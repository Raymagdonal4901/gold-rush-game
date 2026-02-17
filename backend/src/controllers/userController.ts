import { Request, Response } from 'express';
import User from '../models/User';
import Rig from '../models/Rig';
import { AuthRequest } from '../middleware/auth';

import { MATERIAL_CONFIG, SLOT_EXPANSION_CONFIG, SHOP_ITEMS, RIG_UPGRADE_RULES, MINING_VOLATILITY_CONFIG } from '../constants';

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
            // Repair if out of sync
            const needsRepair = (user.warehouseCapacity || 0) < targetSlot || (user.miningSlots || 0) < targetSlot;
            if (needsRepair) {
                user.warehouseCapacity = Math.max(user.warehouseCapacity || 0, targetSlot);
                user.miningSlots = Math.max(user.miningSlots || 0, targetSlot);
                await user.save();
                console.log(`[REPAIR] Fixed capacity for ${user.username} during redundant unlock of slot ${targetSlot}`);
            }

            return res.json({
                message: 'Slot already unlocked',
                user: {
                    balance: user.balance,
                    unlockedSlots: user.unlockedSlots,
                    miningSlots: user.miningSlots,
                    warehouseCapacity: user.warehouseCapacity,
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
                const itemName = SHOP_ITEMS.find((s: any) => s.id === config.item)?.name?.th || config.item;
                return res.status(400).json({ message: `อุปกรณ์ไม่เพียงพอ: ${itemName}` });
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
        user.miningSlots = targetSlot; // Synchronize warehouse capacity with unlocked slots
        user.warehouseCapacity = targetSlot; // Synchronize official warehouse capacity field

        await user.save();

        res.json({
            message: 'Slot unlocked successfully',
            user: {
                balance: user.balance,
                unlockedSlots: user.unlockedSlots,
                miningSlots: user.miningSlots,
                warehouseCapacity: user.warehouseCapacity,
                materials: user.materials,
                inventory: user.inventory
            }
        });
    } catch (error) {
        console.error('Unlock slot error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const recalculateUserIncome = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return 0;

        const rigs = await Rig.find({ ownerId: userId, isDead: { $ne: true } });

        let totalBaseDaily = 0;
        let totalEquipmentDaily = 0;

        // Calculate Multipliers
        // Check for Vibranium in inventory
        const hasVibranium = user.inventory.some((i: any) => i.typeId === 'vibranium');
        const globalMultiplier = hasVibranium ? 2 : 1;

        for (const rig of rigs) {
            // Base Profit + Bonus Profit
            // Handle Legacy Scale if needed (though backend should start standardizing)
            // Mirroring frontend logic:

            const rigNameStr = typeof rig.name === 'string' ? rig.name : (rig.name?.en || rig.name?.th || '');
            const isNoBonusRig = ['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(rigNameStr);
            const effectiveBonusProfit = isNoBonusRig ? 0 : (Number(rig.bonusProfit) || 0);

            // Legacy Scale Fallback from frontend (rig.dailyProfit < 5 -> * 35)
            // But usually backend stores correct values. We'll trust DB value for now, 
            // or apply same heuristic if values are suspiciously low? 
            // Let's assume DB values are correct THB for now to avoid double scaling if fixed elsewhere.
            // Actually, frontend says: "All amounts in system are stored as THB".
            // So we just sum them up.

            const volConfig = MINING_VOLATILITY_CONFIG[rig.tierId || 1];
            const baseValue = volConfig?.baseValue || 0;
            const bonusProfit = Number(rig.bonusProfit) || 0;

            // Equipment Bonus
            let equippedBonus = 0;
            if (rig.slots && rig.slots.length > 0) {
                for (const itemId of rig.slots) {
                    if (!itemId) continue;
                    const item = user.inventory.find((i: any) => i.id === itemId);
                    if (item) {
                        equippedBonus += (Number(item.dailyBonus) || 0);
                    }
                }
            }

            const starMult = 1 + (Number(rig.starLevel) || 0) * 0.05;
            const upgradeRule = RIG_UPGRADE_RULES[rig.tierId || 1];
            const levelMult = upgradeRule ? Math.pow(upgradeRule.statGrowth, (Number(rig.level) || 1) - 1) : 1;

            totalBaseDaily += (baseValue + bonusProfit + equippedBonus) * starMult * levelMult;
        }

        const totalDailyIncome = (totalBaseDaily + totalEquipmentDaily) * globalMultiplier;

        user.totalDailyIncome = totalDailyIncome;
        await user.save();

        return totalDailyIncome;

    } catch (error) {
        console.error("Error recalculating income:", error);
        return 0;
    }
};

export const recalculateAllUsersIncome = async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        let count = 0;
        for (const user of users) {
            await recalculateUserIncome((user._id as unknown) as string);
            count++;
        }
        res.json({ success: true, message: `Recalculated income for ${count} users` });
    } catch (error) {
        res.status(500).json({ message: 'Migration failed', error });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // Aggregation: Top 10 users by totalDailyIncome + their best rig (Ace Machine)
        const pipeline = [
            { $match: { totalDailyIncome: { $gt: 0 } } },
            { $sort: { totalDailyIncome: -1 as const } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'rigs',
                    let: { odId: { $toString: '$_id' } },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$ownerId', '$$odId'] }, isDead: { $ne: true } } },
                        { $sort: { tierId: -1 as const, investment: -1 as const } },
                    ],
                    as: 'rigs'
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    totalDailyIncome: 1,
                    avatarUrl: 1,
                    rigCount: { $size: '$rigs' },
                    aceRig: { $arrayElemAt: ['$rigs', 0] },
                }
            }
        ];

        const results = await User.aggregate(pipeline);

        const leaders = results.map((u: any, index: number) => ({
            id: u._id,
            username: u.username,
            dailyIncome: u.totalDailyIncome || 0,
            rigCount: u.rigCount || 0,
            aceRig: u.aceRig ? {
                tierId: u.aceRig.tierId || 1,
                name: u.aceRig.name,
            } : null,
            avatarUrl: u.avatarUrl,
            rank: index + 1
        }));

        res.json(leaders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const claimNotificationReward = async (req: AuthRequest, res: Response) => {
    try {
        const { notificationId } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const notification = user.notifications.find(n => n.id === notificationId);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        if (!notification.hasReward) {
            return res.status(400).json({ message: 'This notification has no reward' });
        }

        if (notification.isClaimed) {
            return res.status(400).json({ message: 'Reward already claimed' });
        }

        // Process Reward
        let rewardMessage = '';
        if (notification.rewardType === 'CURRENCY') {
            const amount = Number(notification.rewardValue) || 0;
            user.balance += amount;
            rewardMessage = `ได้รับเงินจำนวน ${amount.toLocaleString()} เรียบร้อย!`;
        } else if (notification.rewardType === 'ITEM') {
            // Handle Array of Items, Single Item Object, or Item ID String
            const rewards = Array.isArray(notification.rewardValue)
                ? notification.rewardValue
                : [notification.rewardValue];

            let addedCount = 0;
            const { SHOP_ITEMS } = require('../constants'); // Local import to avoid circular dependency if any

            for (const rewardData of rewards) {
                if (!rewardData) continue;

                let itemToPush = null;

                if (typeof rewardData === 'string') {
                    // It's an Item ID (e.g. 'chest_key')
                    const shopItem = SHOP_ITEMS.find((s: any) => s.id === rewardData);
                    if (shopItem) {
                        const lifespan = shopItem.lifespanDays || 30;
                        itemToPush = {
                            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            typeId: shopItem.id,
                            name: shopItem.name,
                            price: shopItem.price,
                            dailyBonus: (Number(shopItem.minBonus) + Number(shopItem.maxBonus)) / 2 || 0,
                            durationBonus: shopItem.durationBonus || 0,
                            rarity: shopItem.rarity || 'RARE',
                            purchasedAt: Date.now(),
                            lifespanDays: lifespan,
                            expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000),
                            maxDurability: shopItem.maxDurability || (lifespan * 100),
                            currentDurability: shopItem.maxDurability || (lifespan * 100),
                            level: 1
                        };
                    }
                } else if (typeof rewardData === 'object') {
                    // It's already an item object
                    itemToPush = {
                        ...rewardData,
                        id: rewardData.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        purchasedAt: rewardData.purchasedAt || Date.now()
                    };
                }

                if (itemToPush) {
                    user.inventory.push(itemToPush);
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                const firstReward = rewards[0];
                let firstItemName = 'Item';
                if (typeof firstReward === 'string') {
                    const si = SHOP_ITEMS.find((s: any) => s.id === firstReward);
                    firstItemName = si?.name?.th || si?.name || firstReward;
                } else {
                    firstItemName = firstReward?.name?.th || firstReward?.name || 'Item';
                }
                rewardMessage = addedCount > 1
                    ? `ได้รับ ${addedCount} ไอเทม เรียบร้อย!`
                    : `ได้รับ ${firstItemName} เรียบร้อย!`;
            } else {
                rewardMessage = `เกิดข้อผิดพลาดในการรับไอเทม`;
            }
        }

        // Mark as claimed
        notification.isClaimed = true;
        notification.read = true; // Also mark as read
        user.markModified('notifications');
        user.markModified('inventory');

        await user.save();

        res.json({
            success: true,
            message: rewardMessage,
            user: {
                balance: user.balance,
                inventory: user.inventory,
                notifications: user.notifications
            }
        });
    } catch (error) {
        console.error('Claim notification reward error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.notifications = user.notifications.filter(n => n.id !== id);
        user.markModified('notifications');
        await user.save();

        res.json({
            success: true,
            user: {
                notifications: user.notifications
            }
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
export const getReferrals = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const referrals = await User.find({ referrerId: userId })
            .select('username createdAt')
            .sort({ createdAt: -1 });

        const mappedReferrals = referrals.map(u => ({
            username: u.username.length > 4 ? u.username.substring(0, 4) + '***' : u.username + '***',
            joinedAt: u.createdAt
        }));

        res.json(mappedReferrals);
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
