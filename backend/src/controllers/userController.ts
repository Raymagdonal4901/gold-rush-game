import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const SLOT_EXPANSION_CONFIG: Record<number, { title: string; cost: number; mats: Record<number, number>; item?: string; itemCount?: number }> = {
    4: { title: 'ขยายพื้นที่ขุดเจาะช่องที่ 4', cost: 2000, mats: { 3: 30, 4: 10 }, item: 'chest_key', itemCount: 1 },
    5: { title: 'ขยายพื้นที่ขุดเจาะช่องที่ 5', cost: 3000, mats: { 5: 10, 6: 5 }, item: 'upgrade_chip', itemCount: 5 },
    6: { title: 'สร้างแท่นขุดเจาะพิเศษ (Master Wing)', cost: 5000, mats: { 7: 1, 8: 1, 9: 1 }, item: undefined, itemCount: 0 },
};

export const unlockSlot = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        let { targetSlot } = req.body;
        targetSlot = Number(targetSlot);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUnlocked = Number(user.unlockedSlots || 3);
        console.log(`[DEBUG] User ${userId} attempting to unlock slot ${targetSlot}. Current unlocked: ${currentUnlocked}`);

        // Idempotency: If already unlocked, return success immediately
        if (targetSlot <= currentUnlocked) {
            return res.json({
                message: 'Slot already unlocked',
                user: {
                    balance: user.balance,
                    unlockedSlots: user.unlockedSlots,
                    materials: user.materials,
                    inventory: user.inventory
                }
            });
        }

        if (targetSlot !== currentUnlocked + 1) {
            return res.status(400).json({ message: `Invalid target slot. Expected ${currentUnlocked + 1}, got ${targetSlot}` });
        }

        const config = SLOT_EXPANSION_CONFIG[targetSlot as keyof typeof SLOT_EXPANSION_CONFIG];
        if (!config) {
            return res.status(400).json({ message: 'Slot configuration not found' });
        }

        // Check Requirements
        // 1. Cost
        if (user.balance < config.cost) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // 2. Materials
        const userMaterials = user.materials || {};
        for (const [tier, amount] of Object.entries(config.mats)) {
            const owned = userMaterials[tier] || 0;
            if (owned < amount) {
                return res.status(400).json({ message: 'Insufficient materials' });
            }
        }

        // 3. Items
        if (config.item) {
            const needed = config.itemCount || 1;
            const inventory = user.inventory || [];
            const ownedItems = inventory.filter(i => i.typeId === config.item);
            if (ownedItems.length < needed) {
                return res.status(400).json({ message: `Insufficient items: ${config.item}` });
            }

            // Deduct items
            let deducted = 0;
            user.inventory = inventory.filter(item => {
                if (deducted < needed && item.typeId === config.item) {
                    deducted++;
                    return false;
                }
                return true;
            });
        }

        // Deduct Resources
        user.balance -= config.cost;
        for (const [tier, amount] of Object.entries(config.mats)) {
            user.materials[tier] = (user.materials[tier] || 0) - amount;
        }

        // Mark as mixed for materials since it's an object
        user.markModified('materials');
        user.markModified('inventory');

        // Update Slots
        user.unlockedSlots = targetSlot;

        await user.save();

        res.json({
            message: 'Slot unlocked successfully',
            user: {
                balance: user.balance,
                unlockedSlots: user.unlockedSlots,
                materials: user.materials,
                inventory: user.inventory
            }
        });
    } catch (error) {
        console.error('Unlock slot error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // Fetch top 20 users by daily income (calculated or stored)
        // Since dailyIncome isn't directly stored, we might use activeRigs calculation or just use balance/energy as proxy?
        // Or fetch all and calculate.
        // For MVP, user.weeklyStats.totalIncome or similar?
        // Let's rely on User model having 'dailyIncome' field if possible, or calculate it.
        // Wait, Rig model has dailyProfit.
        // We need to aggregate Rigs for each user? That's expensive for all users.
        // For now, let's sort by 'balance' or 'weeklyStats.totalIncome'.
        // MockDB used 'dailyIncome' which was rigid. 
        // Let's use 'balance' for "Richest".
        // Title says "Top 10 Mining Empire" -> "อันดับเศรษฐี".

        const users = await User.find({})
            .sort({ balance: -1 })
            .limit(20)
            .select('username balance');

        // Map to format
        const leaders = users.map((u, index) => ({
            id: u._id,
            username: u.username,
            dailyIncome: u.balance, // Using balance as proxy for "Wealth"
            rank: index + 1
        }));

        res.json(leaders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
