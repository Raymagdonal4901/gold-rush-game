import User from '../models/User';
import Rig from '../models/Rig';
import Transaction from '../models/Transaction';
import {
    ROBOT_CONFIG,
    ENERGY_CONFIG,
    MINING_VOLATILITY_CONFIG,
    REFERRAL_COMMISSION,
    RIG_PRESETS
} from '../constants';
import { calculateDailyYield, getRigPresetId } from '../controllers/rigController';

/**
 * AI Robot Synchronization Service (Catch-up Mechanism)
 * This simulates robot activity for the period the user was offline.
 */
export const syncRobotActions = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // 1. Check if user owns an ACTIVE (non-expired) AI Robot
        const activeBot = user.inventory?.find((item: any) =>
            item.typeId === 'ai_robot' && (!item.expireAt || item.expireAt > Date.now())
        );

        if (!activeBot) {
            // Even without a bot, we must sync energy drain for all users
            await syncEnergyOnly(user);
            return;
        }

        // If bot is paused, it only drains energy (no automation)
        if (user.isBotPaused) {
            await syncEnergyOnly(user);
            return;
        }

        const rigs = await Rig.find({ ownerId: userId, isDead: { $ne: true } });
        const now = new Date();
        const nowMs = now.getTime();
        let balanceChanged = false;

        for (const rig of rigs) {
            let rigChanged = false;

            // --- A. SYNC ENERGY & AUTO-REFILL ---
            const lastEnergyUpdate = rig.lastEnergyUpdate ? new Date(rig.lastEnergyUpdate).getTime() : rig.purchaseDate.getTime();
            const elapsedHours = (nowMs - lastEnergyUpdate) / (1000 * 60 * 60);

            let drainRatePerHour = 4.166666666666667; // 100% / 24h
            const isOverclocked = user.overclockExpiresAt && user.overclockExpiresAt.getTime() > nowMs;
            if (isOverclocked) {
                drainRatePerHour *= 2;
            }

            const totalDrain = elapsedHours * drainRatePerHour;
            let currentEnergy = Math.max(0, (rig.energy ?? 100) - totalDrain);

            // Auto-refill Energy if < threshold
            if (currentEnergy < (ROBOT_CONFIG.ENERGY_THRESHOLD || 50)) {
                // Costs 50 THB (Match backend refillEnergy standard for overclock-style or specialized fee)
                // However, rigController says standard refill is free or small fee? 
                // Let's assume the robot uses the most efficient refill (e.g. 50 THB for 100% or similar)
                // In refillEnergy, 'overclock' type is 50 THB. Standard is 0.02 per 1%.
                // Robot will use standard refill for cost efficiency.
                const needed = 100 - currentEnergy;
                const cost = needed * 0.02;

                if (user.balance >= cost) {
                    user.balance -= cost;
                    currentEnergy = 100;
                    balanceChanged = true;
                    rigChanged = true;
                    console.log(`[ROBOT_SYNC] Rig ${rig._id} Energy refill: -${cost} THB`);
                }
            }

            if (rig.energy !== currentEnergy) {
                rig.energy = currentEnergy;
                rig.lastEnergyUpdate = now;
                rigChanged = true;
            }

            // --- B. AUTO REPAIR ---
            const volConfig = MINING_VOLATILITY_CONFIG[rig.tierId || getRigPresetId(rig)];
            const isBroken = rig.status === 'BROKEN' || (rig.currentDurability !== undefined && rig.currentDurability <= 0);

            if (isBroken) {
                // Free repair or fee? controller says repairRig is usually based on repairCost
                const repairCost = rig.repairCost || 0;
                if (user.balance >= repairCost) {
                    user.balance -= repairCost;
                    rig.currentDurability = rig.maxDurability || 3000;
                    rig.status = 'ACTIVE';
                    rig.lastRepairAt = now;
                    balanceChanged = true;
                    rigChanged = true;
                    console.log(`[ROBOT_SYNC] Rig ${rig._id} Repaired: -${repairCost} THB`);
                }
            }

            // --- C. AUTO CLAIM PROFITS (24h Cycles) ---
            // If rig is ACTIVE and has energy, calculate multi-claim if offline for days
            if (rig.status === 'ACTIVE' && rig.energy > 0) {
                const baseCooldownMs = 24 * 60 * 60 * 1000;
                // Simplified buffs check for sync (Hashrate/Cooldown)
                // In production, getRigBuffs would be imported, but we can simplify or import it
                // For now, let's assume standard cooldown 24h for sync safety
                const lastClaim = rig.lastClaimAt ? new Date(rig.lastClaimAt).getTime() : rig.purchaseDate.getTime();
                let nextPossibleClaim = lastClaim + baseCooldownMs;

                while (nowMs >= nextPossibleClaim) {
                    // Simulate a claim
                    const presetId = rig.tierId || getRigPresetId(rig);
                    const overclockMultiplier = user.overclockMultiplier || 1.5;
                    const { amount } = calculateDailyYield(presetId, isOverclocked, overclockMultiplier, {}, rig.starLevel || 0, rig.level || 1);

                    user.balance += amount;
                    rig.lastClaimAt = new Date(nextPossibleClaim);
                    rig.totalMined = (rig.totalMined || 0) + amount;

                    // Durability Decay per claim
                    let decay = volConfig?.durabilityDecay || 400;
                    if (isOverclocked) decay *= 1.5;
                    rig.currentDurability = Math.max(0, (rig.currentDurability || 3000) - decay);

                    if (rig.currentDurability <= 0) {
                        rig.status = 'BROKEN';
                        balanceChanged = true;
                        rigChanged = true;
                        break; // Stop claiming if broken
                    }

                    balanceChanged = true;
                    rigChanged = true;
                    nextPossibleClaim += baseCooldownMs;
                    console.log(`[ROBOT_SYNC] Rig ${rig._id} Auto-claimed: +${amount} THB`);

                    // Log Transaction (Optional but good for history)
                    await Transaction.create({
                        userId: user._id,
                        amount: amount,
                        type: 'YIELD',
                        description: `หุ่นยนต์ AI เก็บรายได้อัตโนมัติ (${rig.name?.th || 'เครื่องขุด'})`,
                        timestamp: new Date(nextPossibleClaim - baseCooldownMs)
                    }).catch(() => { });
                }
            }

            if (rigChanged) {
                await rig.save();
            }
        }

        if (balanceChanged) {
            user.markModified('inventory');
            await user.save();
        }

    } catch (error) {
        console.error('[ROBOT_SYNC_ERROR]', error);
    }
};

/**
 * Basic energy sync for users without bot
 */
const syncEnergyOnly = async (user: any) => {
    const now = new Date();
    const lastUpdate = user.lastEnergyUpdate || user.createdAt || now;
    const elapsedHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    let drainRate = 4.166666666666667;
    if (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > now.getTime()) {
        drainRate *= (ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5);
    }
    const drain = elapsedHours * drainRate;
    user.energy = Math.max(0, (user.energy ?? 100) - drain);
    user.lastEnergyUpdate = now;
    await user.save();
};
