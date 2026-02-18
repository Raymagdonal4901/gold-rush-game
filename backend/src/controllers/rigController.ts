import { Request, Response } from 'express';
import Rig from '../models/Rig';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { MATERIAL_CONFIG, RIG_LOOT_TABLES, SHOP_ITEMS, RENEWAL_CONFIG, RIG_PRESETS, ENERGY_CONFIG, MINING_VOLATILITY_CONFIG, SALVAGE_CONFIG, RIG_UPGRADE_RULES, MAX_RIG_LEVEL, LEVEL_CONFIG } from '../constants';
import { recalculateUserIncome } from './userController';

const MATERIAL_NAMES = MATERIAL_CONFIG.NAMES;

// Determine rig preset ID from investment amount or name matching
export function getRigPresetId(rig: any): number {
    const inv = rig.investment;

    // 1. First priority: Match by unique investment amounts (for standard paid rigs)
    if (inv > 0) {
        if (inv === 300) return 1;
        if (inv === 500) return 2;
        if (inv === 1000) return 3;
        if (inv === 1500) return 4;
        if (inv === 2000) return 5;
        if (inv === 2500) return 6;
        if (inv === 3000) return 7;
    }

    // 2. Second priority: Match by keywords in name (for special/crafted/free rigs)
    const name = typeof rig.name === 'string' ? rig.name : (rig.name?.th || rig.name?.en || '');

    // Tier 8: Vibranium Reactor (God Tier)
    if (name.includes('ปฏิกรณ์') || name.includes('Vibranium') || name.includes('God')) return 8;

    // Tier 9: Rotten Glove (Starter)
    if (name.includes('เน่า') || name.includes('Rotten')) return 9;

    // 3. Fallback to Tier 9 (Free)
    return 9;
}

// Helper to aggregate accessory buffs
export function getRigBuffs(rig: any, user: any) {
    const buffs = {
        repairDiscount: 0,
        decayReduction: 0,
        dropRateBoost: 0,
        critChance: 0,
        claimCooldownMultiplier: 1.0, // Multiplier: 1.0 = base, 0.9 = -10% cooldown
        hashrateBoost: 1.0, // Multiplier: 1.0 = base, 1.1 = +10% hashrate
        accountLevel: user.accountLevel || 1
    };

    if (rig.slots && rig.slots.length > 0) {
        for (const itemId of rig.slots) {
            if (!itemId) continue;
            const item = user.inventory.find((i: any) => (i.id === itemId || i._id === itemId));
            if (item) {
                // Find config to get buffs
                const config = SHOP_ITEMS.find(s => s.id === item.typeId);
                if (config && config.buffs) {
                    if (config.buffs.repairDiscount) buffs.repairDiscount += config.buffs.repairDiscount;
                    if (config.buffs.decayReduction) buffs.decayReduction += config.buffs.decayReduction;
                    if (config.buffs.dropRateBoost) buffs.dropRateBoost += config.buffs.dropRateBoost;
                    if (config.buffs.critChance) buffs.critChance += config.buffs.critChance;

                    // Unified Accessory Percentage Logic (1.0 = 1% hashrate boost)
                    // We prioritize item.dailyBonus (leveled value) over static config
                    const itemDailyBonus = item.dailyBonus || config.minBonus || 0;
                    if (itemDailyBonus > 0) {
                        // e.g. 10.0 bonus means +10% -> +0.10 to multiplier
                        buffs.hashrateBoost += (itemDailyBonus / 100);
                    }

                    // Also check for static hashrateBoost multipliers in config for compatibility
                    if (config.buffs.hashrateBoost && config.buffs.hashrateBoost > 1.0) {
                        buffs.hashrateBoost += (config.buffs.hashrateBoost - 1.0);
                    }

                    // claimCooldownMultiplier: 0.9 means -10% -> (0.9 - 1) = -0.1
                    if (config.buffs.claimCooldownMultiplier) {
                        buffs.claimCooldownMultiplier += (config.buffs.claimCooldownMultiplier - 1);
                    }
                }
            }
        }
    }

    // Clamp values to prevent extreme edge cases
    buffs.claimCooldownMultiplier = Math.max(0.5, buffs.claimCooldownMultiplier); // Max 50% faster
    buffs.hashrateBoost = Math.max(1.0, buffs.hashrateBoost);

    return buffs;
}

// Roll loot from a rig's loot table
function rollLoot(presetId: number, buffs: any = {}): { tier?: number; itemId?: string; amount: number } {
    const table = RIG_LOOT_TABLES[presetId];
    if (!table) {
        // Fallback: 1x Coal for rigs without a loot table (Tier 1, Tier 9)
        return { tier: 1, amount: 1 };
    }
    // Apply Drop Rate Boost: Effectively reduces the 'nothing' chance or shifts range
    // Logic: rand = Math.random() * (100 - boost)
    const boostPercent = (buffs.dropRateBoost || 0) * 100;
    const rand = Math.random() * Math.max(1, 100 - boostPercent);
    let cumulative = 0;
    for (const entry of table) {
        cumulative += entry.chance;
        if (rand < cumulative) {
            const amount = entry.minAmount === entry.maxAmount
                ? entry.minAmount
                : Math.floor(Math.random() * (entry.maxAmount - entry.minAmount + 1)) + entry.minAmount;
            return { tier: entry.matTier, itemId: entry.itemId, amount };
        }
    }
    // Safety fallback: return last entry
    const last = table[table.length - 1];
    return { tier: last.matTier, itemId: last.itemId, amount: last.minAmount };
}

// === Dynamic Volatility: คำนวณ yield ต่อครั้ง ===
// สุ่ม baseValue + Random(0~maxRandom) แล้วลุ้น Jackpot (Critical Hit)
export function calculateDailyYield(presetId: number, isOverclocked: boolean = false, multiplier: number = 1.5, buffs: any = {}, starLevel: number = 0, rigLevel: number = 1): { amount: number; isJackpot: boolean } {
    const config = MINING_VOLATILITY_CONFIG[presetId];
    if (!config) {
        console.warn(`[YIELD] No volatility config for preset ${presetId}, fallback to 0`);
        return { amount: 0, isJackpot: false };
    }

    // Original Yield Logic: Base Value + Random(0, maxRandom)
    const rawYield = config.baseValue + Math.floor(Math.random() * (config.maxRandom + 1));

    let isJackpot = false;

    // --- Multiplicative Stacking Implementation (Unified) ---
    // Final Yield = RawYield * Overclock * Items * Stars * Level * AccountLevel

    // 1. Overclock (e.g. 1.5x)
    const ocMult = isOverclocked ? multiplier : 1.0;

    // 2. Items (e.g. 1.05x for 5% boost)
    const itemMult = (buffs.hashrateBoost && buffs.hashrateBoost > 1.0) ? buffs.hashrateBoost : 1.0;

    // 3. Stars (e.g. 1.05x for 1 star)
    const starMult = 1 + (starLevel * 0.05);

    // 4. Level multiplier (config-based growth)
    const upgradeRule = RIG_UPGRADE_RULES[presetId];
    const levelMult = upgradeRule ? Math.pow(upgradeRule.statGrowth, (rigLevel - 1)) : 1.0;

    // 5. Account Level efficiency boost: 1% per level (e.g. Level 2 = 1.01x)
    const userAccountLevel = buffs.accountLevel || 1;
    const accountLevelMult = 1 + ((userAccountLevel - 1) * (LEVEL_CONFIG.yieldBonusPerLevel || 0.01));

    let finalYield = rawYield * ocMult * itemMult * starMult * levelMult * accountLevelMult;

    // Log breakdown for sanity check
    console.log(`[YIELD_FIX] Tier ${presetId} | Base: ${rawYield} | OC: ${ocMult}x | Item: ${itemMult}x | Star: ${starMult}x | Level: ${levelMult.toFixed(2)}x | AccLevel: ${accountLevelMult.toFixed(2)}x | Final: ${finalYield.toFixed(2)}`);

    // Roll for Jackpot: if (Math.random() < JackpotChance)
    // Overclock adds flat 0.02 (2%) to jackpot chance
    // Buffs add flat chance
    let effectiveJackpotChance = isOverclocked ? (config.jackpotChance + 0.02) : config.jackpotChance;
    if (buffs.critChance) {
        effectiveJackpotChance += buffs.critChance;
    }

    if (effectiveJackpotChance > 0 && Math.random() < effectiveJackpotChance) {
        const jackpotBonus = finalYield * (config.jackpotMultiplier - 1);
        finalYield += jackpotBonus;
        isJackpot = true;
        console.log(`[JACKPOT] ⚡ Tier ${presetId}: ${Math.floor(finalYield)} THB (${config.jackpotMultiplier}x Bonus!${isOverclocked ? ' + Overclock' : ''})`);
    }

    return { amount: Math.floor(finalYield), isJackpot };
}

// Get all rigs for a user
export const getMyRigs = async (req: AuthRequest, res: Response) => {
    const start = Date.now();
    try {
        const rigs = await Rig.find({ ownerId: req.user?._id });

        // Calculate currentMaterials dynamically based on time
        const DROP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Hours
        const MAX_CAPACITY = 1;

        const rigsWithMaterials = rigs.map(rig => {
            const rigObj = rig.toObject();
            const now = Date.now();
            const lastCollection = rig.lastCollectionAt ? new Date(rig.lastCollectionAt).getTime() : new Date(rig.purchaseDate).getTime();
            const elapsed = Math.max(0, now - lastCollection);

            // Calculate generated amount
            let generated = Math.floor(elapsed / DROP_INTERVAL_MS);
            if (generated > MAX_CAPACITY) generated = MAX_CAPACITY;

            // If generated, use it. If frontend sends optimistic update, backend is source of truth.
            return {
                ...rigObj,
                currentMaterials: generated
            };
        });

        res.json(rigsWithMaterials);
        console.log(`[PERF] getMyRigs took ${Date.now() - start}ms`);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Craftable rigs are now derived from constants.ts RIG_PRESETS
const CRAFTABLE_RIGS = RIG_PRESETS.filter(rig => rig.craftingRecipe);

export const craftRig = async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        const userId = req.userId;
        console.log(`[CRAFT_RIG] Attempting to craft: "${name}" for user: ${userId}`);

        // Robust matching using RIG_PRESETS for machines
        let preset = RIG_PRESETS.find(i => i.name.th === name || i.name.en === name || i.id.toString() === name);
        if (!preset && name.includes('ปฏิกรณ์')) {
            preset = RIG_PRESETS.find(i => i.id === 8); // Vibranium Reactor ID
        }

        if (!preset) {
            console.log(`[CRAFT_RIG] FAILED: No preset found for name: "${name}"`);
            return res.status(400).json({ message: 'เครื่องจักรนี้ไม่สามารถผลิตได้ หรือชื่อไม่ถูกต้อง' });
        }

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // --- ENFORCE GLOBAL WAREHOUSE CAPACITY ---
        const totalOwnedRigs = await Rig.countDocuments({ ownerId: user._id, status: 'ACTIVE' });
        const warehouseCapacity = user.miningSlots || 3;
        if (totalOwnedRigs >= warehouseCapacity) {
            return res.status(403).json({
                message: `โกดังเต็มแล้ว! (เต็มความจุ: ${totalOwnedRigs}/${warehouseCapacity}) โปรดขยายพื้นที่โกดังก่อน`,
                code: 'WAREHOUSE_FULL'
            });
        }

        // --- ENFORCE TIER ownership LIMIT ---
        const tierPresetId = preset.id;
        const volConfig = MINING_VOLATILITY_CONFIG[tierPresetId];
        const maxTierQuantity = volConfig?.maxQuantity || 50;
        const currentTierCount = await Rig.countDocuments({ ownerId: user._id, tierId: tierPresetId, status: 'ACTIVE' });

        if (currentTierCount >= maxTierQuantity) {
            return res.status(403).json({
                message: `คุณมีเครื่งขุดรุ่นนี้ครบตามขีดจำกัดแล้ว (Limit: ${maxTierQuantity})`,
                code: 'TIER_LIMIT_REACHED'
            });
        }

        // Check Materials
        if (!user.materials) user.materials = {};
        const materialsNeeded = preset.craftingRecipe?.materials || {};

        for (const [tier, amount] of Object.entries(materialsNeeded)) {
            const has = user.materials[tier] || 0;
            console.log(`[CRAFT_RIG] Tier ${tier}: have ${has}, need ${amount}`);
            if (has < (amount as number)) {
                return res.status(400).json({ message: `วัตถุดิบไม่เพียงพอ (Tier ${tier})` });
            }
        }


        // Deduct Materials
        for (const [tier, amount] of Object.entries(materialsNeeded)) {
            user.materials[tier] -= (amount as number);
        }
        user.markModified('materials');

        // Log Transaction
        const craftTx = new Transaction({
            userId: user._id,
            type: 'ASSET_PURCHASE',
            amount: 0,
            status: 'COMPLETED',
            description: `ผลิตเครื่องจักร: ${typeof name === 'object' ? name.th : name}`
        });
        await craftTx.save();

        const lifespanDays = preset.durationMonths ? (preset.durationMonths * 30) : (preset.durationDays || 365);


        // Create Rig
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + lifespanDays);

        const rig = await Rig.create({
            ownerId: user._id,
            name, // Keep string for DB consistency if model hasn't changed
            investment: 0,
            dailyProfit: preset.dailyProfit,
            expiresAt,
            slots: [null, null, null, null, null], // Empty slots
            rarity: preset.type || 'COMMON',
            repairCost: 0,
            energyCostPerDay: preset.energyCostPerDay,
            bonusProfit: 0,
            lastClaimAt: new Date(),
            level: 1,
            tierId: preset.id
        });

        await user.save();

        // Recalculate Income
        await recalculateUserIncome(user._id.toString());

        console.log(`[CRAFT_RIG] SUCCESS: Rig created with ID: ${rig._id}`);
        res.status(201).json({ success: true, rig });
    } catch (error) {
        console.error(`[CRAFT_RIG] ERROR:`, error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Buy a rig
export const buyRig = async (req: AuthRequest, res: Response) => {
    try {
        const { name, investment, dailyProfit, durationDays, repairCost, energyCostPerDay, bonusProfit } = req.body;
        const userId = req.userId;

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (user.balance < investment) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // --- ENFORCE GLOBAL WAREHOUSE CAPACITY ---
        const totalOwnedRigs = await Rig.countDocuments({ ownerId: user._id, status: 'ACTIVE' });
        const warehouseCapacity = user.miningSlots || 3;
        if (totalOwnedRigs >= warehouseCapacity) {
            return res.status(403).json({
                message: `โกดังเต็มแล้ว! (เต็มความจุ: ${totalOwnedRigs}/${warehouseCapacity}) โปรดขยายพื้นที่โกดังก่อน`,
                code: 'WAREHOUSE_FULL'
            });
        }

        // --- ENFORCE TIER ownership LIMIT ---
        const presetId = getRigPresetId({ investment, name });
        const volConfig = MINING_VOLATILITY_CONFIG[presetId];
        const maxTierQuantity = volConfig?.maxQuantity || 50;
        const currentTierCount = await Rig.countDocuments({ ownerId: user._id, tierId: presetId, status: 'ACTIVE' });

        if (currentTierCount >= maxTierQuantity) {
            return res.status(403).json({
                message: `คุณมีเครื่องขุดรุ่นนี้ครบตามขีดจำกัดแล้ว (Limit: ${maxTierQuantity})`,
                code: 'TIER_LIMIT_REACHED'
            });
        }

        // --- ENFORCE ONE-TIME PURCHASE LIMIT ---
        if (presetId === 9 && user.purchasedRigIds && user.purchasedRigIds.includes(9)) {
            return res.status(403).json({
                message: `คุณได้ซื้อเครื่องขุดรุ่นนี้ไปแล้ว (จำกัดการซื้อ 1 ครั้งต่อบัญชี)`,
                code: 'PURCHASE_LIMIT_REACHED'
            });
        }

        // Deduct balance
        user.balance -= investment;

        // Record purchase for one-time rigs
        if (presetId === 9) {
            if (!user.purchasedRigIds) user.purchasedRigIds = [];
            if (!user.purchasedRigIds.includes(9)) {
                user.purchasedRigIds.push(9);
            }
        }

        await user.save();

        // Log Transaction for Rig Purchase
        const rigPurchaseTx = new Transaction({
            userId: user._id,
            type: 'ASSET_PURCHASE',
            amount: investment,
            status: 'COMPLETED',
            description: `ซื้อเครื่องจักร: ${typeof name === 'object' ? name.th : name}`
        });
        await rigPurchaseTx.save();

        // Create Rig
        const preset = RIG_PRESETS.find(p => p.id === presetId);
        const lifespanDays = preset ? (preset.durationMonths ? (preset.durationMonths * 30) : (preset.durationDays || 365)) : (durationDays || 30);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + lifespanDays);

        // Calculate rig rarity based on preset type or investment (THB scale: 3000 -> LEGENDARY, 2000 -> EPIC, 1000 -> RARE)
        const rigRarity = preset?.type || (investment >= 3000 ? 'LEGENDARY' : investment >= 2000 ? 'EPIC' : investment >= 1000 ? 'RARE' : 'COMMON');

        console.log(`[BUY_RIG DEBUG] Creating rig for user: ${userId}, name: ${typeof name === 'object' ? JSON.stringify(name) : name}, rarity: ${rigRarity}`);

        const rig = await Rig.create({
            ownerId: user._id,
            name,
            investment,
            dailyProfit,
            expiresAt,
            slots: [null, null, null, null, null], // Empty slots
            rarity: rigRarity,
            repairCost: repairCost || 0,
            energyCostPerDay: energyCostPerDay || 0,
            bonusProfit: bonusProfit || 0,
            lastClaimAt: new Date(), // Initialize locally
            // Dynamic Volatility Fields
            tierId: getRigPresetId({ investment, name }), // Helper function needs object with investment/name
            currentDurability: MINING_VOLATILITY_CONFIG[getRigPresetId({ investment, name })]?.durabilityMax || 3000,
            status: 'ACTIVE',
            totalMined: 0,
            level: 1
        });

        // === REFERRAL BONUS (3% of Purchase Price) ===
        if (user.referrerId) {
            try {
                const referrer = await User.findById(user.referrerId);
                if (referrer) {
                    const commission = Math.floor(investment * 0.05); // 5%
                    if (commission > 0) {
                        referrer.balance += commission;
                        // Update Referral Stats
                        if (!referrer.referralStats) {
                            referrer.referralStats = { totalInvited: 0, totalEarned: 0 };
                        }
                        referrer.referralStats.totalEarned += commission;
                        referrer.markModified('referralStats');

                        await referrer.save();

                        // Log Transaction
                        const refTx = new Transaction({
                            userId: referrer._id,
                            type: 'REFERRAL_BONUS_BUY',
                            amount: commission,
                            status: 'COMPLETED',
                            description: `ค่าคอมมิชชั่น 5% จากการซื้อเครื่องขุดของ ${user.username}`,
                            details: { fromUser: user._id.toString() }
                        });
                        await refTx.save();
                        console.log(`[REFERRAL_BUY] Paid ${commission} THB to ${referrer.username} for purchase by ${user.username}`);
                    }
                }
            } catch (err) {
                console.error('[REFERRAL_BUY_ERROR] Failed to pay bonus:', err);
            }
        }

        console.log(`[BUY_RIG DEBUG] Rig created with ID: ${rig._id}`);

        // Return both

        // Recalculate Income
        await recalculateUserIncome(user._id.toString());

        res.status(201).json({ rig });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim profit from a rig — Dynamic Volatility Model
// คำนวณ yield ฝั่ง server ด้วย calculateDailyYield() แทนที่จะเชื่อค่าจาก frontend
export const claimRigProfit = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // === 24-HOUR PER-RIG COOLDOWN CHECK ===
        const baseCooldownMs = 24 * 60 * 60 * 1000;
        const buffs = getRigBuffs(rig, user);
        const cooldownMs = baseCooldownMs * buffs.claimCooldownMultiplier;
        const now = new Date();

        if (rig.lastClaimAt) {
            const timeSinceLastClaim = now.getTime() - new Date(rig.lastClaimAt).getTime();
            if (timeSinceLastClaim < cooldownMs) {
                const remainingMs = cooldownMs - timeSinceLastClaim;
                const hours = Math.floor(remainingMs / (60 * 60 * 1000));
                const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

                return res.status(400).json({
                    message: `คุณสามารถรับรายได้จากเครื่องนี้ได้อีกครั้งในอีก ${hours} ชม. ${minutes} นาที (You can claim from this rig again in ${hours}h ${minutes}m)`,
                    code: 'CLAIM_COOLDOWN',
                    remainingMs
                });
            }
        }

        // หา Preset ID ของเครื่องขุด
        const presetId = getRigPresetId(rig);

        // Save tierId if missing (migration)
        if (!rig.tierId) {
            rig.tierId = presetId;
        }

        const volConfig = MINING_VOLATILITY_CONFIG[presetId];
        let durabilityDecay = volConfig?.durabilityDecay || 100;

        // === Check Overclock Status ===
        const isOverclocked = user.overclockExpiresAt && user.overclockExpiresAt.getTime() > now.getTime();
        const overclockMultiplier = user.overclockMultiplier || 1.5;

        if (isOverclocked) {
            const ocPenalty = (ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5);
            durabilityDecay *= ocPenalty; // Standardized Decay during Overclock
            console.log(`[OVERCLOCK] Active for ${user.username} | Boost: ${overclockMultiplier}x | Decay: ${durabilityDecay}`);
        }

        // Apply Decay Reduction Buff
        if (buffs.decayReduction > 0) {
            durabilityDecay *= (1 - buffs.decayReduction);
            console.log(`[BUFF] Decay Reduction: ${buffs.decayReduction * 100}% | New Decay: ${durabilityDecay}`);
        }

        // === CHECK DURABILITY ===
        if (rig.status === 'BROKEN' || (rig.currentDurability !== undefined && rig.currentDurability <= 0)) {
            return res.status(400).json({
                message: 'เครื่องขุดเสียหาย! โปรดซ่อมแซมก่อนใช้งาน (Rig is BROKEN! Please repair first)',
                code: 'RIG_BROKEN'
            });
        }

        // === Dynamic Volatility: คำนวณ yield ===
        const { amount, isJackpot } = calculateDailyYield(presetId, isOverclocked, overclockMultiplier, buffs, rig.starLevel || 0, rig.level || 1);

        const rigNameStr = typeof rig.name === 'object' ? (rig.name.th || rig.name.en) : rig.name;
        console.log(`[CLAIM] User ${userId} | Rig: ${rigNameStr} (Preset ${presetId}) | Yield: ${amount} THB ${isJackpot ? '⚡ CRITICAL HIT!' : ''} | Old Balance: ${user.balance}`);

        user.balance += amount;
        user.lastClaimedAt = now;

        // Update Rig State
        rig.lastClaimAt = now;
        rig.totalMined = (rig.totalMined || 0) + amount;

        // Apply Durability Decay
        if (rig.currentDurability === undefined) rig.currentDurability = volConfig?.durabilityMax || 3000;
        rig.currentDurability = Math.max(0, rig.currentDurability - durabilityDecay);

        if (rig.currentDurability <= 0) {
            rig.status = 'BROKEN';
            console.log(`[RIG_FAIL] Rig ${rig._id} is now BROKEN (Durability 0)`);
        }

        await user.save();
        console.log(`[CLAIM] New Balance: ${user.balance}`);
        await rig.save();

        // === REFERRAL BONUS (1% of Yield - System Pays) ===
        if (user.referrerId) {
            // Process async to not block response
            (async () => {
                try {
                    const referrer = await User.findById(user.referrerId);
                    if (referrer) {
                        const commission = Math.floor(amount * 0.01); // 1%
                        if (commission > 0) {
                            referrer.balance += commission;
                            // Update Referral Stats
                            if (!referrer.referralStats) {
                                referrer.referralStats = { totalInvited: 0, totalEarned: 0 };
                            }
                            referrer.referralStats.totalEarned += commission;
                            referrer.markModified('referralStats');

                            await referrer.save();

                            const refTx = new Transaction({
                                userId: referrer._id,
                                type: 'REFERRAL_BONUS_YIELD',
                                amount: commission,
                                status: 'COMPLETED',
                                description: `ค่าคอมมิชชั่น 1% จากการขุดของ ${user.username}`,
                                details: { fromUser: user._id.toString(), rigId: rig._id.toString() }
                            });
                            await refTx.save();
                            console.log(`[REFERRAL_YIELD] Paid ${commission} THB to ${referrer.username} for mining by ${user.username}`);
                        }
                    }
                } catch (err) {
                    console.error('[REFERRAL_YIELD_ERROR]', err);
                }
            })();
        }

        // Log Transaction
        const description = isJackpot
            ? `⚡ CRITICAL HIT! เก็บผลผลิตจากเครื่องขุด: ${rigNameStr} (${amount} THB)`
            : `เก็บผลผลิตจากเครื่องขุด: ${rigNameStr} (${amount} THB)`;

        const claimTx = new Transaction({
            userId,
            type: 'CLAIM_YIELD', // Changed from MINING_CLAIM to match spec
            amount: amount,
            status: 'COMPLETED',
            description,
            details: {
                rigId: rig._id.toString(),
                isJackpot
            }
        });
        await claimTx.save();

        res.json({
            success: true,
            amount,
            isJackpot,
            balance: user.balance,
            lastClaimAt: rig.lastClaimAt,
            currentDurability: rig.currentDurability,
            status: rig.status
        });
    } catch (error) {
        console.error('[CLAIM_ERROR]', error);
        res.status(500).json({ message: `Server error: ${(error as any).message}` });
    }
};

// Refill a specific rig's energy
export const refillRigEnergy = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Calculate needed energy (simplified drain logic matching frontend/MockDB for consistency)
        const now = new Date();
        const lastUpdate = rig.lastEnergyUpdate || rig.purchaseDate || now;
        const elapsedHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        // 100% in 24 hours (4.166% per hour), double during Overclock
        let drainRate = 4.166666666666667;
        if (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > now.getTime()) {
            drainRate *= 2;
        }
        const drain = elapsedHours * drainRate;
        const currentEnergy = Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));
        const needed = 100 - currentEnergy;

        if (needed <= 0) {
            return res.status(400).json({ message: 'Energy is already full' });
        }

        // Check for Buffs in slots
        const buffs = getRigBuffs(rig, user);
        const discountMultiplier = 1.0 - buffs.repairDiscount;

        // Cost is proportional to needed energy
        const baseCost = rig.energyCostPerDay || 0;
        let cost = (needed / 100) * baseCost * discountMultiplier;

        // Apply Overclock X2 Energy Cost
        if (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > Date.now()) {
            cost *= 2;
        }

        if (cost < 0.1) cost = 0.1; // Minimum fee

        if (user.balance < cost) {
            return res.status(400).json({ success: false, message: 'ยอดเงินในวอลเลทไม่เพียงพอ' });
        }

        // Deduct balance and update rig
        user.balance -= cost;
        rig.energy = 100;
        rig.lastEnergyUpdate = now;

        await user.save();
        await rig.save();

        // Log Transaction for Energy Refill
        const energyTx = new Transaction({
            userId,
            type: 'ENERGY_REFILL',
            amount: cost,
            status: 'COMPLETED',
            description: `เติมพลังงานเครื่องขุด: ${typeof rig.name === 'object' ? rig.name.th : rig.name}`
        });
        await energyTx.save();

        res.json({
            success: true,
            message: 'Rig energy refilled',
            cost,
            balance: user.balance,
            energy: rig.energy
        });
    } catch (error: any) {
        console.error('[REFILL_RIG_ENERGY_ERROR]', error);
        res.status(500).json({ success: false, message: 'Server error', error: (error as any).message });
    }
};

// Collect materials from a rig
export const collectMaterials = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;
        const { amount, tier } = req.body;

        console.log(`[DEBUG_COLLECT] User: ${userId}, Rig: ${rigId}, Amount: ${amount}, Tier: ${tier}`);

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Server-side validation: Check if enough time has passed
        const now = new Date();
        let effectiveInterval = MATERIAL_CONFIG.DROP_INTERVAL_MS || 14400000;

        // Apply Overclock Boost if active
        // NOTE: Frontend uses `overclockBoost` variable which is 2x if active
        if (user.isOverclockActive && user.overclockExpiresAt && new Date(user.overclockExpiresAt) > now) {
            const multiplier = ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5;
            effectiveInterval = effectiveInterval / multiplier;
        }

        // Use atomic findOneAndUpdate with cooldown condition
        const rig = await Rig.findOneAndUpdate(
            {
                _id: rigId,
                ownerId: user._id,
                $or: [
                    { lastCollectionAt: { $exists: false } },
                    { lastCollectionAt: { $lte: new Date(now.getTime() - effectiveInterval) } }
                ]
            },
            { $set: { lastCollectionAt: now } },
            { new: true }
        );

        if (!rig) {
            // Either rig not found or cooldown not met
            const existingRig = await Rig.findOne({ _id: rigId, ownerId: user._id });
            if (!existingRig) return res.status(404).json({ message: 'Rig not found' });
            return res.status(400).json({ message: 'ยังไม่ถึงรอบเวลาการเก็บรวบรวมไอเทม' });
        }

        // Per-Rig Loot Drop
        const presetId = getRigPresetId(rig);
        const buffs = getRigBuffs(rig, user);
        const loot = rollLoot(presetId, buffs);
        const lootAmount = loot.amount;

        let rewardName = '';
        let rewardType = 'MATERIAL';

        if (loot.itemId) {
            rewardType = 'ITEM';
            const shopItem = SHOP_ITEMS.find(s => s.id === loot.itemId);
            if (!shopItem) {
                console.error(`[ERROR] Item pool mismatch: ${loot.itemId} not found in SHOP_ITEMS`);
                return res.status(500).json({ message: 'Loot error' });
            }

            const nameObj = shopItem.name;
            rewardName = typeof nameObj === 'object' ? nameObj.th : nameObj;

            // Add to Inventory
            if (!user.inventory) user.inventory = [];
            const lifespan = shopItem.lifespanDays || 30;
            const bonus = (Number(shopItem.minBonus) + Number(shopItem.maxBonus)) / 2 || 0;

            for (let i = 0; i < lootAmount; i++) {
                user.inventory.push({
                    id: Math.random().toString(36).substr(2, 9),
                    typeId: shopItem.id,
                    name: shopItem.name,
                    price: shopItem.price,
                    dailyBonus: bonus,
                    durationBonus: shopItem.durationBonus || 0,
                    rarity: shopItem.rarity || 'RARE',
                    purchasedAt: Date.now(),
                    lifespanDays: lifespan,
                    expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000),
                    maxDurability: shopItem.maxDurability || (lifespan * 100),
                    currentDurability: shopItem.maxDurability || (lifespan * 100),
                    level: 1
                });
            }
            user.markModified('inventory');
        } else {
            const lootTier = loot.tier ?? 1;
            if (!user.materials) user.materials = {};
            user.materials[lootTier] = (user.materials[lootTier] || 0) + lootAmount;
            user.markModified('materials');

            const matName = MATERIAL_NAMES[lootTier as keyof typeof MATERIAL_NAMES] || { th: `แร่ Tier ${lootTier}`, en: `Ore Tier ${lootTier}` };
            rewardName = matName.th;
        }

        await user.save();

        // Log Transaction
        const materialTx = new Transaction({
            userId: user._id,
            type: 'GIFT_CLAIM',
            amount: 0,
            status: 'COMPLETED',
            description: `ได้รับไอเทมจากเครื่องขุด: ${rewardName} x${lootAmount}`
        });
        await materialTx.save();

        console.log(`[DEBUG_COLLECT] Success. User: ${userId}, Rig: ${rigId}, Preset: ${presetId}, Item: ${rewardName} x${lootAmount}`);
        return res.json({
            success: true,
            type: rewardType,
            tier: loot.tier,
            itemId: loot.itemId,
            amount: lootAmount,
            name: rewardType === 'ITEM' ? (SHOP_ITEMS.find(s => s.id === loot.itemId)?.name) : (MATERIAL_NAMES[(loot.tier ?? 1) as keyof typeof MATERIAL_NAMES]),
            rig,
            materials: user.materials,
            inventory: user.inventory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const claimRigGift = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Server-side validation: Check gift cycle (default 1 day)
        const GIFT_CYCLE_DAYS = 1;
        const now = new Date();

        let boost = 1;
        if (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > now.getTime()) {
            boost = 2; // Match frontend BOX_DROP_SPEED_BOOST logic
        }

        const giftIntervalMs = (GIFT_CYCLE_DAYS * 24 * 60 * 60 * 1000) / boost;

        // Use atomic findOneAndUpdate with cooldown condition
        const rig = await Rig.findOneAndUpdate(
            {
                _id: rigId,
                ownerId: user._id,
                $or: [
                    { lastGiftAt: { $exists: false } },
                    { lastGiftAt: { $lte: new Date(now.getTime() - giftIntervalMs) } }
                ]
            },
            { $set: { lastGiftAt: now } },
            { new: true }
        );

        if (!rig) {
            const existingRig = await Rig.findOne({ _id: rigId, ownerId: user._id });
            if (!existingRig) return res.status(404).json({ message: 'Rig not found' });
            return res.status(400).json({ message: 'ยังไม่ถึงเวลาเปิดกล่องของขวัญ' });
        }

        // Per-Rig Loot Drop
        const presetId = getRigPresetId(rig);
        const buffs = getRigBuffs(rig, user);
        const loot = rollLoot(presetId, buffs);
        const lootAmount = loot.amount;

        let rewardName = '';
        let rewardType = 'MATERIAL';

        if (loot.itemId) {
            rewardType = 'ITEM';
            const shopItem = SHOP_ITEMS.find(s => s.id === loot.itemId);
            if (!shopItem) {
                console.error(`[ERROR] Item pool mismatch: ${loot.itemId} not found in SHOP_ITEMS`);
                return res.status(500).json({ message: 'Loot error' });
            }

            const nameObj = shopItem.name;
            rewardName = typeof nameObj === 'object' ? nameObj.th : nameObj;

            // Add to Inventory
            if (!user.inventory) user.inventory = [];
            const lifespan = shopItem.lifespanDays || 30;
            const bonus = (Number(shopItem.minBonus) + Number(shopItem.maxBonus)) / 2 || 0;

            for (let i = 0; i < lootAmount; i++) {
                user.inventory.push({
                    id: Math.random().toString(36).substr(2, 9),
                    typeId: shopItem.id,
                    name: shopItem.name,
                    price: shopItem.price,
                    dailyBonus: bonus,
                    durationBonus: shopItem.durationBonus || 0,
                    rarity: shopItem.rarity || 'RARE',
                    purchasedAt: Date.now(),
                    lifespanDays: lifespan,
                    expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000),
                    maxDurability: shopItem.maxDurability || (lifespan * 100),
                    currentDurability: shopItem.maxDurability || (lifespan * 100),
                    level: 1
                });
            }
            user.markModified('inventory');
        } else {
            const lootTier = loot.tier ?? 1;
            if (!user.materials) user.materials = {};
            user.materials[lootTier] = (user.materials[lootTier] || 0) + lootAmount;
            user.markModified('materials');

            const matName = MATERIAL_NAMES[lootTier] || { th: `แร่ Tier ${lootTier}`, en: `Ore Tier ${lootTier}` };
            rewardName = matName.th;
        }

        await user.save();

        // Log Transaction
        const giftTx = new Transaction({
            userId: user._id,
            type: 'GIFT_CLAIM',
            amount: 0,
            status: 'COMPLETED',
            description: `ได้รับของขวัญจากเครื่องขุด: ${rewardName} x${lootAmount}`
        });
        await giftTx.save();

        res.json({
            type: rewardType,
            tier: loot.tier,
            itemId: loot.itemId,
            amount: lootAmount,
            name: rewardType === 'ITEM' ? (SHOP_ITEMS.find(s => s.id === loot.itemId)?.name) : (MATERIAL_NAMES[loot.tier ?? 1]),
            rig,
            materials: user.materials,
            inventory: user.inventory
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const equipAccessory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;
        const { itemId, slotIndex } = req.body;

        // Prevent replacing the glove (Slot 0)
        if (slotIndex === 0) {
            return res.status(403).json({ message: 'ไม่สามารถเปลี่ยนถุงมือได้ (เป็นอุปกรณ์ถาวร)' });
        }

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Ensure item exists in inventory
        const itemIndex = user.inventory.findIndex((i: any) => (i.id === itemId || i._id === itemId));
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in inventory' });

        const item = user.inventory[itemIndex];

        // VALIDATION: Only allow actual equipment types, not utility items
        const VALID_EQUIPMENT_TYPES = ['uniform', 'bag', 'boots', 'glasses', 'mobile', 'pc', 'auto_excavator', 'glove'];
        if (!VALID_EQUIPMENT_TYPES.includes(item.typeId)) {
            return res.status(400).json({
                message: `ไอเทมประเภท ${item.typeId} ไม่สามารถสวมใส่ได้ (Item type ${item.typeId} cannot be equipped)`
            });
        }

        // Ensure slots array exists
        if (!rig.slots) rig.slots = [null, null, null, null, null];

        // SYNC LIFESPAN: Equipment durability is independent (HP-based)
        // No longer sync expireAt to rig expiry

        // Check if item is already equipped elsewhere
        const otherRigs = await Rig.find({ ownerId: user._id, _id: { $ne: rigId } });
        for (const otherRig of otherRigs) {
            if (otherRig.slots && otherRig.slots.includes(itemId)) {
                const idx = otherRig.slots.indexOf(itemId);
                otherRig.slots[idx] = null;
                otherRig.markModified('slots');
                await otherRig.save();
            }
        }

        // Equip to target rig
        rig.slots[slotIndex] = itemId;
        rig.markModified('slots');

        user.markModified('inventory');
        await user.save();
        await rig.save();

        // Recalculate Income
        await recalculateUserIncome(user._id.toString());

        res.json({ success: true, rig, inventory: user.inventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const unequipAccessory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;
        const { slotIndex } = req.body;

        // Prevent unequipping the glove (Slot 0)
        if (slotIndex === 0) {
            return res.status(403).json({ message: 'ไม่สามารถถอดถุงมือได้ (เป็นอุปกรณ์ถาวร)' });
        }

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        if (rig.slots && rig.slots[slotIndex]) {
            rig.slots[slotIndex] = null;
            rig.markModified('slots');
            await rig.save();
        }

        // Recalculate Income
        await recalculateUserIncome(user._id.toString());

        res.json({ success: true, rig });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Merge two identical rigs into a higher star level rig
export const mergeRigs = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { rigId1, rigId2 } = req.body;

        if (!rigId1 || !rigId2 || rigId1 === rigId2) {
            return res.status(400).json({ message: 'การเลือกเครื่องจักรไม่ถูกต้อง' });
        }

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Fetch both rigs
        const [rig1, rig2] = await Promise.all([
            Rig.findOne({ _id: rigId1, ownerId: userId }),
            Rig.findOne({ _id: rigId2, ownerId: userId })
        ]);

        if (!rig1 || !rig2) {
            return res.status(404).json({ message: 'ไม่พบเครื่องจักรที่ระบุ' });
        }

        // --- VALIDATION ---
        // 1. Check if broken or dead
        if (rig1.isDead || rig2.isDead || rig1.status === 'BROKEN' || rig2.status === 'BROKEN') {
            return res.status(400).json({ message: 'ไม่สามารถรวมเครื่องที่เสียหายหรือพังแล้วได้' });
        }

        // 2. Check compatibility (Same Name/Preset)
        const name1 = typeof rig1.name === 'object' ? rig1.name.en : rig1.name;
        const name2 = typeof rig2.name === 'object' ? rig2.name.en : rig2.name;
        if (name1 !== name2) {
            return res.status(400).json({ message: 'เครื่องจักรต้องเป็นรุ่นเดียวกัน' });
        }

        // 3. Check Star Level/Rank
        if (Number(rig1.starLevel || 0) !== Number(rig2.starLevel || 0)) {
            return res.status(400).json({ message: 'เครื่องจักรต้องมีระดับดาวเท่ากัน' });
        }

        if ((rig1.starLevel || 0) >= 5) {
            return res.status(400).json({ message: 'เครื่องขุดนี้ถึงระดับสูงสุดแล้ว (5 ดาว)' });
        }

        // 4. Check Durability (> 90%)
        // Get Max Durability from config if possible, or assume based on current
        // For simplicity, we check if current is close to max of config.
        // Let's rely on preset ID to find max durability config
        const presetId = getRigPresetId(rig1);
        const volatilityConfig = MINING_VOLATILITY_CONFIG[presetId];
        const maxDurability = volatilityConfig ? volatilityConfig.durabilityMax : 3000; // Default 3000

        const minRequired = maxDurability * 0.9;
        if ((rig1.currentDurability || 0) < minRequired || (rig2.currentDurability || 0) < minRequired) {
            return res.status(400).json({ message: 'เครื่องจักรทั้งสองต้องได้รับการซ่อมแซมสมบูรณ์ (>90%)' });
        }

        // 5. Check Cost
        const MERGE_FEE = 100;
        if (user.balance < MERGE_FEE) {
            return res.status(400).json({ message: `ยอดเงินไม่เพียงพอ ต้องการ ${MERGE_FEE} บาท` });
        }

        // --- EXECUTION ---

        // Deduct Fee
        user.balance -= MERGE_FEE;
        await user.save();

        // Calculate New Stats
        const newStarLevel = Number(rig1.starLevel || 0) + 1;
        const baseDailyProfit = rig1.dailyProfit;
        // Logic: (Rig1 + Rig2) * 1.10 is theoretically 2.2x of one rig
        const newDailyProfit = (Number(rig1.dailyProfit) + Number(rig2.dailyProfit)) * 1.10;

        // Create New Rig
        console.log(`[MERGE_DEBUG] Merging Rigs: ${rig1._id} (Lvl ${rig1.starLevel}) + ${rig2._id} (Lvl ${rig2.starLevel}) -> New Lvl ${newStarLevel}`);

        const newRig = new Rig({
            ownerId: userId,
            name: rig1.name,
            investment: rig1.investment + rig2.investment,
            dailyProfit: newDailyProfit,
            purchaseDate: new Date(),
            expiresAt: rig1.expiresAt > rig2.expiresAt ? rig1.expiresAt : rig2.expiresAt,
            rarity: rig1.rarity,
            starLevel: newStarLevel,
            level: 1,
            repairCost: rig1.repairCost * 2,
            energyCostPerDay: rig1.energyCostPerDay,
            energy: 100,
            lastEnergyUpdate: new Date(),
            currentDurability: maxDurability,
            status: 'ACTIVE',
            tierId: rig1.tierId || getRigPresetId(rig1)
        });

        await newRig.save();

        // Burn Old Rigs
        await Rig.deleteOne({ _id: rig1._id });
        await Rig.deleteOne({ _id: rig2._id });

        // Log Transaction
        const mergeTx = new Transaction({
            userId: user._id,
            type: 'EXPENSE',
            amount: MERGE_FEE,
            status: 'COMPLETED',
            description: `รวมเครื่องขุด: ${typeof rig1.name === 'object' ? rig1.name.th : rig1.name} Rank ${newStarLevel} (Fee: ${MERGE_FEE})`,
            details: {
                rigId1: rigId1,
                rigId2: rigId2,
                newRigId: newRig._id
            }
        });
        await mergeTx.save();

        // Recalculate Income
        await recalculateUserIncome(user._id.toString());

        res.json({ success: true, message: 'รวมเครื่องขุดสำเร็จ!', rig: newRig });

    } catch (error) {
        console.error('[MERGE_RIGS] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Destroy (Smash) a rig - deletes rig and all its items from inventory
export const destroyRig = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Identify all items equipped on this rig
        const itemsToDestroy = (rig.slots || []).filter(id => id !== null);

        if (itemsToDestroy.length > 0) {
            console.log(`[DESTROY_RIG] Destroying rig ${rigId} and items:`, itemsToDestroy);

            // Remove items from user's inventory
            user.inventory = user.inventory.filter((item: any) => {
                const itemId = item.id || item._id;
                return !itemsToDestroy.includes(itemId.toString());
            });

            user.markModified('inventory');
        }

        // --- CALCULATE SALVAGE REFUND ---
        const presetId = getRigPresetId(rig);
        let salvageTier = 'TIER_1';

        if (presetId === 4) salvageTier = 'TIER_2';
        else if (presetId === 5) salvageTier = 'TIER_3';
        else if ([6, 7, 8].includes(presetId)) salvageTier = 'TIER_4';

        const config = SALVAGE_CONFIG[salvageTier];
        const rewards: { tier: number; amount: number; name: string }[] = [];
        const items: { id: string; name: string }[] = [];

        // 1. Roll for Materials
        for (const mat of config.materials) {
            const chance = mat.chance ?? 1;
            if (Math.random() <= chance) {
                const amount = Math.floor(Math.random() * (mat.max - mat.min + 1)) + mat.min;
                if (amount > 0) {
                    if (!user.materials) user.materials = {};
                    user.materials[mat.tier] = (user.materials[mat.tier] || 0) + amount;

                    const matName = MATERIAL_NAMES[mat.tier as keyof typeof MATERIAL_NAMES] || { th: 'แร่', en: 'Ore' };
                    rewards.push({ tier: mat.tier, amount, name: typeof matName === 'object' ? matName.th : matName });
                }
            }
        }

        // 2. Roll for Bonus Items
        if (config.bonus && Math.random() <= config.bonus.chance) {
            const itemCount = config.bonus.count || 1;
            const shopItem = SHOP_ITEMS.find(i => i.id === config.bonus?.itemId);
            const itemName = shopItem ? (typeof shopItem.name === 'object' ? shopItem.name.th : shopItem.name) : config.bonus.itemId;

            for (let i = 0; i < itemCount; i++) {
                user.inventory.push({
                    id: config.bonus.itemId,
                    category: 'TOOL', // Default to tool for repair kits
                    acquiredAt: new Date()
                });
            }
            items.push({ id: config.bonus.itemId, name: itemName as string });
        }

        user.markModified('materials');
        user.markModified('inventory');
        await user.save();

        // Delete the rig
        await Rig.deleteOne({ _id: rigId });

        // Prepare Summary Strings
        const matSummary = rewards.map(r => `${r.name} x${r.amount}`).join(', ');
        const itemSummary = items.length > 0 ? `, ไอเทม: ${items.map(i => i.name).join(', ')}` : '';
        const fullSummary = matSummary + itemSummary;

        // Log Transaction
        const salvageTx = new Transaction({
            userId: user._id,
            type: 'INCOME',
            amount: 0,
            status: 'COMPLETED',
            description: `หลอมเครื่องจักร: ${typeof rig.name === 'object' ? rig.name.th : rig.name} (ได้รับ: ${fullSummary})`,
            details: {
                salvageTier,
                rewards,
                items
            }
        });
        await salvageTx.save();

        res.json({
            success: true,
            message: `หลอมเครื่องจักรสำเร็จ! ได้รับ ${fullSummary}`,
            rewards,
            items
        });
    } catch (error) {
        console.error('[DESTROY_RIG] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// === Rig Level Up (Material Burning) ===
export const upgradeRig = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        const currentLevel = rig.level || 1;
        if (currentLevel >= MAX_RIG_LEVEL) {
            return res.status(400).json({ message: 'Rig is already at max level' });
        }

        const tierId = rig.tierId || getRigPresetId(rig);
        const rule = RIG_UPGRADE_RULES[tierId];
        if (!rule) {
            return res.status(400).json({ message: 'No upgrade rules for this rig type' });
        }

        // Calculate material cost: baseCost * costMultiplier^(currentLevel - 1)
        const materialCost = Math.floor(rule.baseCost * Math.pow(rule.costMultiplier, currentLevel - 1));
        const matTier = rule.materialTier;

        // Check user has enough materials
        if (!user.materials) user.materials = {};
        const currentMats = Number(user.materials[matTier] || 0);
        if (currentMats < materialCost) {
            const matName = MATERIAL_NAMES[matTier as keyof typeof MATERIAL_NAMES] || { th: 'แร่', en: 'Ore' };
            return res.status(400).json({
                message: `Not enough materials`,
                required: materialCost,
                have: currentMats,
                materialName: matName
            });
        }

        // Deduct materials
        user.materials[matTier] = currentMats - materialCost;
        user.markModified('materials');

        // Increment level
        const newLevel = currentLevel + 1;
        rig.level = newLevel;

        // Restore durability to max (free repair!) & Increase Max Capacity
        const volConfig = MINING_VOLATILITY_CONFIG[tierId];
        const baseMax = volConfig?.durabilityMax || 3000;

        // Increase Max Durability
        const currentMax = rig.maxDurability || baseMax;
        const newMax = currentMax + (rule.durabilityBonus || 0);

        rig.maxDurability = newMax;
        rig.currentDurability = newMax;
        rig.status = 'ACTIVE';

        await rig.save();
        await user.save();

        // Recalculate user income
        await recalculateUserIncome(user._id.toString());

        // Log transaction
        const matName = MATERIAL_NAMES[matTier as keyof typeof MATERIAL_NAMES] || { th: 'แร่', en: 'Ore' };
        const rigName = typeof rig.name === 'object' ? rig.name.th : rig.name;
        const tx = new Transaction({
            userId: user._id,
            type: 'EXPENSE',
            amount: 0,
            status: 'COMPLETED',
            description: `อัพเกรด ${rigName} เป็น Lv.${newLevel} (ใช้ ${typeof matName === 'object' ? matName.th : matName} x${materialCost})`
        });
        await tx.save();

        console.log(`[UPGRADE_RIG] ${rigName} upgraded to Lv.${newLevel} | Cost: ${materialCost} of tier ${matTier}`);

        res.json({
            success: true,
            rig,
            newLevel,
            materialUsed: materialCost,
            materialTier: matTier
        });
    } catch (error) {
        console.error('[UPGRADE_RIG] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Repair a rig
export const repairRig = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: user._id });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        const repairCost = rig.repairCost || 0;
        if (user.balance < repairCost) {
            return res.status(400).json({ message: 'ยอดเงินไม่เพียงพอสำหรับค่าซ่อมบำรุง' });
        }

        user.balance -= repairCost;
        // Logic: repair resets lifespan or just 'repairs' if we have durability.
        // Based on constants, let's assume it just costs money.
        // If we want to extend lifespan, we should add days to expiresAt.
        // But user said "Repair costs", so let's just deduct money and log it.

        // Restore Durability
        const presetId = getRigPresetId(rig);
        const volConfig = MINING_VOLATILITY_CONFIG[presetId];
        const maxDurability = volConfig?.durabilityMax || 3000;

        rig.currentDurability = maxDurability;
        rig.status = 'ACTIVE';
        rig.lastRepairAt = new Date();
        // rig.energy = 100; // Legacy energy system, maybe keep it synced or deprecate

        // Update Weekly Stats for Quests
        if (!user.weeklyStats) user.weeklyStats = { materialsCrafted: 0, moneySpent: 0, dungeonsEntered: 0, itemsCrafted: 0, repairAmount: 0, rareLootCount: 0 };
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + repairCost;
        user.markModified('weeklyStats');

        await user.save();
        await rig.save();

        // Log Transaction
        const repairTx = new Transaction({
            userId: user._id,
            type: 'REPAIR',
            amount: repairCost,
            status: 'COMPLETED',
            description: `ซ่อมบำรุงเครื่องขุด: ${typeof rig.name === 'object' ? rig.name.th : rig.name}`,
            details: { rigId: rig._id.toString(), note: 'Restored to Max Durability' }
        });
        await repairTx.save();

        res.json({ message: 'Repair successful', cost: repairCost, balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// ... existing code ...

export const renewRig = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId; // Fixed: req.userId instead of req.user.userId
        const rigId = req.params.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId }); // Fixed: ownerId instead of userId
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Check if rig is actually dead or eligible for renewal
        // Allow renewal if it's dead OR if it's close to dying (optional, but requested feature is for expired rigs)
        // For now, let's allow it if isDead is true.
        if (!rig.isDead) { // Fixed: added to model
            return res.status(400).json({ message: 'Rig is not expired yet.' });
        }

        // Find Preset to get original price
        // We might not have the original price stored on the rig if it was a custom one, 
        // but typically it should match a preset.
        // If rig has 'investment' field (from earlier code analysis), use that.
        // Fallback to preset if needed.

        let originalPrice = rig.investment || 0;

        // Discount Logic
        const discount = originalPrice * RENEWAL_CONFIG.DISCOUNT_PERCENT;
        const cost = Math.floor(originalPrice - discount);

        if (user.balance < cost) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct Balance
        user.balance -= cost;
        await user.save();

        // Update Rig
        rig.isDead = false;
        rig.purchaseDate = new Date(); // Fixed: purchaseDate and Date object
        rig.energy = 100;
        rig.lastEnergyUpdate = new Date();
        rig.lastRepairAt = new Date(); // Fixed: added to model
        // Increment renewal count if we want to track it, but not strictly required by prompt

        await rig.save();

        // Log Transaction
        await Transaction.create({
            userId: user._id,
            type: 'RIG_RENEW',
            amount: cost,
            description: `Renewed Rig: ${typeof rig.name === 'string' ? rig.name : rig.name['en']} (-5% Discount)`,
            status: 'COMPLETED',
            timestamp: Date.now()
        });

        res.json({ success: true, message: 'Rig renewed successfully', rig, balance: user.balance });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
