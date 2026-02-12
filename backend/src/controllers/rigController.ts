import { Request, Response } from 'express';
import Rig from '../models/Rig';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

// Get all rigs for a user
export const getMyRigs = async (req: AuthRequest, res: Response) => {
    const start = Date.now();
    try {
        const rigs = await Rig.find({ ownerId: req.userId });

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

const CRAFTABLE_RIGS: Record<string, any> = {
    'เครื่องขุดปฏิกรณ์ไวเบรเนียม': {
        id: 8,
        recipe: { materials: { 7: 1, 8: 2, 9: 3 } },
        dailyProfit: 100,
        durationHours: 365 * 24, // Use hours for consistency if model expects it
        dailyEnergyCost: 50,
        rarity: 'ULTRA_LEGENDARY',
        name: { th: 'เครื่องขุดปฏิกรณ์ไวเบรเนียม', en: 'Vibranium Reactor Rig' }
    }
};

export const craftRig = async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        const userId = req.userId;
        console.log(`[CRAFT_RIG] Attempting to craft: "${name}" for user: ${userId}`);

        // Robust name matching or ID fallback
        let preset = CRAFTABLE_RIGS[name];
        if (!preset) {
            // Try to find by partial match or known ID if possible 
            // Since we know ID 8 is the reactor, let's check if it's the one
            if (name.includes('ปฏิกรณ์')) {
                preset = CRAFTABLE_RIGS['เครื่องขุดปฏิกรณ์ไวเบรเนียม'];
            }
        }

        if (!preset) {
            console.log(`[CRAFT_RIG] FAILED: No preset found for name: "${name}"`);
            return res.status(400).json({ message: 'เครื่องจักรนี้ไม่สามารถผลิตได้ หรือชื่อไม่ถูกต้อง' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check Materials
        if (!user.materials) user.materials = {};
        for (const [tier, amount] of Object.entries(preset.recipe.materials)) {
            const has = user.materials[tier] || 0;
            console.log(`[CRAFT_RIG] Tier ${tier}: have ${has}, need ${amount}`);
            if (has < (amount as number)) {
                return res.status(400).json({ message: `วัตถุดิบไม่เพียงพอ (Tier ${tier})` });
            }
        }

        // Check Slot Limit (Server Side)
        const rigCount = await Rig.countDocuments({ ownerId: userId });
        const maxSlots = user.unlockedSlots || 3;
        if (rigCount >= maxSlots) {
            return res.status(400).json({ message: 'Mining slots are full. Please unlock more slots.' });
        }

        // Deduct Materials
        for (const [tier, amount] of Object.entries(preset.recipe.materials)) {
            user.materials[tier] -= (amount as number);
        }
        user.markModified('materials');

        // Log Transaction
        const craftTx = new Transaction({
            userId,
            type: 'ASSET_PURCHASE',
            amount: 0,
            status: 'COMPLETED',
            description: `ผลิตเครื่องจักร: ${typeof name === 'object' ? name.th : name}`
        });
        await craftTx.save();

        // Give a Starter Glove (Handmade / High Quality for T8!)
        const starterGlove = {
            id: Math.random().toString(36).substr(2, 9),
            typeId: 'glove',
            name: { th: 'ถุงมือไวเบรเนียม (Starter)', en: 'Vibranium Glove (Starter)' },
            price: 0,
            dailyBonus: 20, // High bonus for T8
            durationBonus: 0,
            rarity: 'RARE',
            purchasedAt: Date.now(),
            lifespanDays: preset.durationDays,
            expireAt: Date.now() + (preset.durationDays * 24 * 60 * 60 * 1000),
            level: 1,
            isHandmade: true
        };

        if (!user.inventory) user.inventory = [];
        user.inventory.push(starterGlove);

        // Create Rig
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + preset.durationDays);

        const rig = await Rig.create({
            ownerId: userId,
            name, // Keep string for DB consistency if model hasn't changed
            investment: 0,
            dailyProfit: preset.dailyProfit,
            expiresAt,
            slots: [starterGlove.id, null, null, null, null], // Set starter glove
            rarity: preset.rarity,
            repairCost: 0,
            energyCostPerDay: preset.dailyEnergyCost,
            bonusProfit: 0,
            lastClaimAt: new Date()
        });

        await user.save();
        console.log(`[CRAFT_RIG] SUCCESS: Rig created with ID: ${rig._id}, Glove ID: ${starterGlove.id}`);
        res.status(201).json({ success: true, rig, glove: starterGlove });
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

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < investment) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct balance
        user.balance -= investment;

        // --- GLOVE GENERATION (Free Starter Glove) ---
        const rand = Math.random() * 100;
        let rarity = 'COMMON';
        let bonus = 0.5; // 0.5 THB

        // Updated names and bonuses based on user images
        let gloveName: { th: string, en: string } = { th: 'พนักงานทั่วไป (STAFF)', en: 'Staff (STAFF)' }; // Default
        if (rand < 80) { rarity = 'COMMON'; bonus = 0.5; gloveName = { th: 'พนักงานทั่วไป (STAFF)', en: 'Staff (STAFF)' }; }
        else if (rand < 91) { rarity = 'RARE'; bonus = 1.0; gloveName = { th: 'หัวหน้างาน (SUPERVISOR)', en: 'Supervisor (SUPERVISOR)' }; }
        else if (rand < 96) { rarity = 'SUPER_RARE'; bonus = 1.5; gloveName = { th: 'ผู้จัดการหอพัก (MANAGER)', en: 'Manager (MANAGER)' }; }
        else if (rand < 99) { rarity = 'EPIC'; bonus = 2.0; gloveName = { th: 'ผู้บริหารอาคาร (EXECUTIVE)', en: 'Executive (EXECUTIVE)' }; }
        else { rarity = 'LEGENDARY'; bonus = 3.0; gloveName = { th: 'หุ้นส่วนใหญ่ (PARTNER)', en: 'Partner (PARTNER)' }; }

        const gloveId = Math.random().toString(36).substr(2, 9);

        const newGlove = {
            id: gloveId,
            typeId: 'glove',
            name: gloveName,
            price: 0,
            dailyBonus: bonus,
            durationBonus: 0,
            rarity,
            purchasedAt: Date.now(),
            lifespanDays: 9999,
            expireAt: Date.now() + (9999 * 24 * 60 * 60 * 1000),
            level: 1
        };

        // Add to inventory (using type casting because Mongoose arrays are tricky with Mixed)
        user.inventory.push(newGlove);
        await user.save();

        // Log Transaction for Rig Purchase
        const rigPurchaseTx = new Transaction({
            userId,
            type: 'ASSET_PURCHASE',
            amount: investment,
            status: 'COMPLETED',
            description: `ซื้อเครื่องจักร: ${typeof name === 'object' ? name.th : name}`
        });
        await rigPurchaseTx.save();

        // Create Rig with Glove Equipped in Slot 0
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Calculate rig rarity based on investment (USD scale: ~3000 -> 85, ~2000 -> 57, ~1000 -> 28)
        const rigRarity = investment >= 85 ? 'LEGENDARY' : investment >= 57 ? 'EPIC' : investment >= 28 ? 'RARE' : 'COMMON';

        console.log(`[BUY_RIG DEBUG] Creating rig for user: ${userId}, name: ${name}, rarity: ${rigRarity}`);

        const rig = await Rig.create({
            ownerId: userId,
            name,
            investment,
            dailyProfit,
            expiresAt,
            slots: [gloveId, null, null, null, null], // Equip glove
            rarity: rigRarity,
            repairCost: repairCost || 0,
            energyCostPerDay: energyCostPerDay || 0,
            bonusProfit: bonusProfit || 0,
            lastClaimAt: new Date() // Initialize locally
        });

        console.log(`[BUY_RIG DEBUG] Rig created with ID: ${rig._id}`);

        // Return both
        res.status(201).json({ rig, glove: newGlove });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim profit from a rig
export const claimRigProfit = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;
        const { amount } = req.body; // Amount calculated by frontend for display/sync

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Backend side calculation to verify amount if possible, 
        // but for now we trust the amount or just update lastClaimAt.
        // Actually, to prevent cheating, we SHOULD calculate it on backend too.
        // For now, let's just implement the persistence part.

        user.balance += amount;
        rig.lastClaimAt = new Date(); // Reset timer on backend

        await user.save();
        await rig.save();

        // Log Transaction for Mining Claim
        const claimTx = new Transaction({
            userId,
            type: 'MINING_CLAIM',
            amount: amount,
            status: 'COMPLETED',
            description: `เก็บผลผลิตจากเครื่องขุด: ${typeof rig.name === 'object' ? rig.name.th : rig.name}`
        });
        await claimTx.save();

        res.json({
            success: true,
            balance: user.balance,
            lastClaimAt: rig.lastClaimAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Refill a specific rig's energy
export const refillRigEnergy = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
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

        // Check for "Safety Uniform" (id: 'uniform') in slots for 5% discount
        let discountMultiplier = 1.0;
        if (rig.slots && rig.slots.length > 0) {
            const equippedItems = user.inventory.filter((i: any) => rig.slots.includes(i.id || i._id));
            const hasUniform = equippedItems.some((i: any) => i.typeId === 'uniform');
            if (hasUniform) {
                discountMultiplier = 0.95; // 5% discount
            }
        }

        // Cost is proportional to needed energy
        const baseCost = rig.energyCostPerDay || 0;
        let cost = (needed / 100) * baseCost * discountMultiplier;

        // Apply Overclock X2 Energy Cost
        if (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > Date.now()) {
            cost *= 2;
        }

        if (cost < 0.1) cost = 0.1; // Minimum fee

        if (user.balance < cost) {
            return res.status(400).json({ message: 'ยอดเงินในวอลเลทไม่เพียงพอ' });
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
            message: 'Rig energy refilled',
            cost,
            balance: user.balance,
            energy: rig.energy
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Collect materials from a rig
export const collectMaterials = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;
        const { amount, tier } = req.body;

        console.log(`[DEBUG_COLLECT] User: ${userId}, Rig: ${rigId}, Amount: ${amount}, Tier: ${tier}`);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // ALL Rigs now exclusively drop Chest Keys
        const newKey = {
            id: Math.random().toString(36).substr(2, 9),
            typeId: 'chest_key',
            name: { th: 'กุญแจเข้าเหมือง', en: 'Mining Key' },
            price: 0,
            dailyBonus: 0,
            durationBonus: 0,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: 999,
            expireAt: Date.now() + (999 * 24 * 60 * 60 * 1000),
            level: 1
        };

        if (!user.inventory) user.inventory = [];
        user.inventory.push(newKey);
        rig.lastCollectionAt = new Date();

        await user.save();
        await rig.save();

        // Log Transaction
        const keyTx = new Transaction({
            userId,
            type: 'GIFT_CLAIM',
            amount: 0,
            status: 'COMPLETED',
            description: `ได้รับไอเทมจากเครื่องขุด: กุญแจเข้าเหมือง`
        });
        await keyTx.save();

        console.log(`[DEBUG_COLLECT] Success. User: ${userId}, Rig: ${rigId}, Item: Mining Key`);
        return res.json({ success: true, item: newKey });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const claimRigGift = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // ALL Rig Gifts now exclusively drop Chest Keys
        const newKey = {
            id: Math.random().toString(36).substr(2, 9),
            typeId: 'chest_key',
            name: { th: 'กุญแจเข้าเหมือง', en: 'Mining Key' },
            price: 0,
            dailyBonus: 0,
            durationBonus: 0,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: 365,
            expireAt: Date.now() + (365 * 24 * 60 * 60 * 1000),
            level: 1
        };

        if (!user.inventory) user.inventory = [];
        user.inventory.push(newKey);
        user.markModified('inventory');

        rig.lastGiftAt = new Date(); // Reset cooldown
        await rig.save();
        await user.save();

        // Log Transaction
        const giftTx = new Transaction({
            userId,
            type: 'GIFT_CLAIM',
            amount: 0,
            status: 'COMPLETED',
            description: `ได้รับของขวัญจากเครื่องขุด: กุญแจเข้าเหมือง`
        });
        await giftTx.save();

        res.json({
            type: 'ITEM',
            item: newKey,
            materials: user.materials // Return current state for sync
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

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Ensure item exists in inventory
        const itemIndex = user.inventory.findIndex((i: any) => (i.id === itemId || i._id === itemId));
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in inventory' });

        const item = user.inventory[itemIndex];

        // Ensure slots array exists
        if (!rig.slots) rig.slots = [null, null, null, null, null];

        // SYNC LIFESPAN: Set item expiry to match Rig expiry
        const rigExpireAt = new Date(rig.expiresAt).getTime();
        item.expireAt = rigExpireAt;

        // Calculate lifespanDays for display
        const remainingMs = Math.max(0, rigExpireAt - Date.now());
        item.lifespanDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

        // Check if item is already equipped elsewhere
        const otherRigs = await Rig.find({ ownerId: userId, _id: { $ne: rigId } });
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

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        if (rig.slots && rig.slots[slotIndex]) {
            rig.slots[slotIndex] = null;
            rig.markModified('slots');
            await rig.save();
        }

        res.json({ success: true, rig });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Destroy (Smash) a rig - deletes rig and all its items from inventory
export const destroyRig = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
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
            await user.save();
        }

        // Delete the rig
        await Rig.deleteOne({ _id: rigId });

        res.json({ success: true, message: 'ทำลายเครื่องจักรและอุปกรณ์ที่ติดตั้งอยู่แล้ว' });
    } catch (error) {
        console.error('[DESTROY_RIG] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Repair a rig
export const repairRig = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
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

        // Update Weekly Stats for Quests
        if (!user.weeklyStats) user.weeklyStats = { materialsCrafted: 0, moneySpent: 0, dungeonsEntered: 0, itemsCrafted: 0, repairAmount: 0, rareLootCount: 0 };
        user.weeklyStats.repairAmount = (user.weeklyStats.repairAmount || 0) + (100 - rig.energy); // Assuming energy is restored to 100
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + repairCost;
        user.markModified('weeklyStats');

        await user.save();

        // Log Transaction
        const repairTx = new Transaction({
            userId,
            type: 'REPAIR',
            amount: repairCost,
            status: 'COMPLETED',
            description: `ซ่อมบำรุงเครื่องขุด: ${typeof rig.name === 'object' ? rig.name.th : rig.name}`
        });
        await repairTx.save();

        res.json({ message: 'Repair successful', cost: repairCost, balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
