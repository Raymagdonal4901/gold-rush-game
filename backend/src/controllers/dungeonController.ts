import { Response } from 'express';
import User from '../models/User';
import Rig from '../models/Rig';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

const SHOP_ITEMS = [
    { id: 'upgrade_chip', name: { th: 'ชิปอัปเกรด', en: 'Upgrade Chip' }, price: 5, lifespanDays: 999, minBonus: 0, maxBonus: 0 },
    { id: 'chest_key', name: { th: 'กุญแจเข้าเหมือง', en: 'Mining Key' }, price: 5, lifespanDays: 365, minBonus: 0, maxBonus: 0 },
    { id: 'mixer', name: { th: 'โต๊ะช่างสกัดแร่', en: 'Crafting Table' }, price: 5, lifespanDays: 365, minBonus: 0, maxBonus: 0 },
    { id: 'magnifying_glass', name: { th: 'แว่นขยายส่องแร่', en: 'Magnifying Glass' }, price: 5, lifespanDays: 365, minBonus: 0, maxBonus: 0 },
    { id: 'robot', name: { th: 'หุ่นยนต์ AI', en: 'AI Robot' }, price: 100, lifespanDays: 30, minBonus: 0, maxBonus: 0 },
    { id: 'insurance_card', name: { th: 'ใบประกันความเสี่ยง', en: 'Insurance Card' }, price: 300, lifespanDays: 0, minBonus: 0, maxBonus: 0 },
    { id: 'ancient_blueprint', name: { th: 'แผนที่ขุดทองโบราณ', en: 'Ancient Mining Map' }, price: 9999, lifespanDays: 999, minBonus: 0, maxBonus: 0 },
    { id: 'hourglass_small', name: { th: 'นาฬิกาทราย (เล็ก)', en: 'Small Hourglass' }, price: 5, lifespanDays: 999, minBonus: 0, maxBonus: 0 },
    { id: 'hourglass_medium', name: { th: 'นาฬิกาทราย (กลาง)', en: 'Medium Hourglass' }, price: 20, lifespanDays: 999, minBonus: 0, maxBonus: 0 },
    { id: 'hourglass_large', name: { th: 'นาฬิกาทราย (ใหญ่)', en: 'Large Hourglass' }, price: 60, lifespanDays: 999, minBonus: 0, maxBonus: 0 },
    { id: 'repair_kit', name: { th: 'ชุดบำรุงรักษาพิเศษ', en: 'Special Maintenance Kit' }, price: 50, lifespanDays: 999, minBonus: 0, maxBonus: 0 },
];

const DUNGEON_CONFIG = [
    {
        id: 1,
        name: { th: 'สำรวจแหล่งแร่พื้นฐาน (Online)', en: 'Basic Mineral Exploration (Online)' },
        cost: 100,
        durationHours: 2,
        keyCost: 2,
        rewards: {
            common: [{ tier: 1, amount: 10, chance: 100 }, { tier: 2, amount: 5, chance: 100 }],
            salt: [{ tier: 1, amount: 5, chance: 100 }],
            rare: [
                { itemId: 'chest_key', amount: 1, chance: 33 },
                { itemId: 'hourglass_small', amount: 1, chance: 33 },
                { itemId: 'upgrade_chip', amount: 1, chance: 34 }
            ]
        }
    },
    {
        id: 2,
        name: { th: 'ทีมสำรวจมืออาชีพ (Expedition)', en: 'Professional Expedition' },
        cost: 300,
        durationHours: 6,
        keyCost: 10,
        rewards: {
            common: [{ tier: 3, amount: 10, chance: 100 }, { tier: 4, amount: 5, chance: 100 }],
            salt: [{ tier: 3, amount: 5, chance: 100 }, { tier: 1, amount: 5, chance: 100 }],
            rare: [
                { itemId: 'upgrade_chip', amount: 1, chance: 25 },
                { itemId: 'mixer', amount: 1, chance: 25 },
                { itemId: 'magnifying_glass', amount: 1, chance: 25 },
                { itemId: 'hourglass_medium', amount: 1, chance: 25 }
            ]
        }
    },
    {
        id: 3,
        name: { th: 'มหกรรมขุดเหมืองโลก (Mining Expo)', en: 'Global Mining Expo' },
        cost: 1000,
        durationHours: 12,
        keyCost: 0,
        rewards: {
            common: [{ tier: 5, amount: 15, chance: 100 }, { tier: 6, amount: 5, chance: 100 }],
            salt: [{ tier: 5, amount: 5, chance: 100 }],
            rare: [
                { tier: 9, amount: 1, chance: 50 },
                { tier: 8, amount: 1, chance: 50 }
            ]
        }
    }
];

export const startExpedition = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { dungeonId, rigId, useKey } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.activeExpedition) {
            return res.status(400).json({ message: 'คุณอยู่ในระหว่างการสำรวจอยู่แล้ว' });
        }

        const dungeon = DUNGEON_CONFIG.find(d => d.id === dungeonId);
        if (!dungeon) return res.status(404).json({ message: 'Dungeon not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Cost validation
        if (useKey) {
            const keyIndex = user.inventory.findIndex(i => i.typeId === 'chest_key');
            if (keyIndex === -1) return res.status(400).json({ message: 'คุณไม่มีกุญแจสำหรับเข้าใช้งาน' });
            user.inventory.splice(keyIndex, 1);
            user.markModified('inventory');
        } else {
            if (user.balance < dungeon.cost) {
                return res.status(400).json({ message: 'ยอดเงินไม่เพียงพอ' });
            }
            user.balance -= dungeon.cost;

            // Log Transaction
            const tx = new Transaction({
                userId,
                type: 'DUNGEON_ENTRY',
                amount: dungeon.cost,
                status: 'COMPLETED',
                description: `เข้าสำรวจ: ${typeof dungeon.name === 'object' ? dungeon.name.th : dungeon.name}`
            });
            await tx.save();
        }

        const startTime = Date.now();
        const endTime = startTime + (dungeon.durationHours * 60 * 60 * 1000);

        user.activeExpedition = {
            dungeonId,
            rigId,
            startTime,
            endTime
        };

        // Update stats
        if (!user.weeklyStats) user.weeklyStats = {};
        user.weeklyStats.dungeonsEntered = (user.weeklyStats.dungeonsEntered || 0) + 1;
        user.markModified('activeExpedition');
        user.markModified('weeklyStats');
        user.markModified('materials');
        user.markModified('inventory');

        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const claimExpedition = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user || !user.activeExpedition) {
            return res.status(400).json({ message: 'ไม่มีการสำรวจที่พร้อมรับรางวัล' });
        }

        const GRACE_PERIOD = 10000; // 10 seconds grace period
        if (Date.now() < user.activeExpedition.endTime - GRACE_PERIOD) {
            return res.status(400).json({ message: 'การสำรวจยังไม่เสร็จสิ้น' });
        }

        const dungeon = DUNGEON_CONFIG.find(d => d.id === user.activeExpedition!.dungeonId);
        if (!dungeon) return res.status(404).json({ message: 'Dungeon config not found' });

        // Reward Generation Logic: 1 Normal (Common/Salt) + 1 Jackpot
        let rewards: any[] = [];
        let rewardType = 'common';
        let rewardString = '';

        // 1. Pick ONE Normal Reward (80% Common, 20% Salt) - EVERY DUNGEON GETS THIS (ID 1, 2, 3)
        const roll = Math.random() * 100;
        let normalPool = roll < 20 ? dungeon.rewards.salt : dungeon.rewards.common;
        if (normalPool.length === 0) normalPool = dungeon.rewards.common; // Fallback

        if (normalPool.length > 0) {
            const idx = Math.floor(Math.random() * normalPool.length);
            rewards.push({ ...normalPool[idx], type: roll < 20 ? 'salt' : 'common' });
        }

        // 2. Pick ONE Jackpot Reward (100% Guaranteed) - ONLY for ID 2, 3
        if (dungeon.id !== 1 && dungeon.rewards.rare.length > 0) {
            const idx = Math.floor(Math.random() * dungeon.rewards.rare.length);
            rewards.push({ ...dungeon.rewards.rare[idx], type: 'rare' });
            rewardType = 'rare'; // Set type to rare for jackpot styling
        }

        const materialNames: any = {
            0: { th: 'วัสดุปริศนา', en: 'Mysterious Material' },
            1: { th: 'ถ่านหิน', en: 'Coal' },
            2: { th: 'ทองแดง', en: 'Copper' },
            3: { th: 'เหล็ก', en: 'Iron' },
            4: { th: 'ทองคำ', en: 'Gold' },
            5: { th: 'เพชร', en: 'Diamond' },
            6: { th: 'น้ำมันดิบ', en: 'Crude Oil' },
            7: { th: 'แร่วาเบรเนียม', en: 'Vibranium' },
            8: { th: 'แร่ลึกลับ', en: 'Mysterious Ore' },
            9: { th: 'แร่ในตำนาน', en: 'Legendary Ore' }
        };

        // Apply Rewards
        for (const r of rewards) {
            let nameObj: { th: string, en: string } = { th: '', en: '' };
            if (r.itemId) {
                const shopItem = SHOP_ITEMS.find((s: any) => s.id === r.itemId);
                if (shopItem) {
                    nameObj = shopItem.name;
                    const lifespan = r.itemId === 'robot' ? 30 : (shopItem.lifespanDays || 30);
                    user.inventory.push({
                        id: Math.random().toString(36).substr(2, 9),
                        typeId: shopItem.id,
                        name: shopItem.name,
                        price: shopItem.price,
                        dailyBonus: (shopItem.minBonus + shopItem.maxBonus) / 2,
                        rarity: 'RARE',
                        purchasedAt: Date.now(),
                        lifespanDays: lifespan,
                        expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000),
                        level: 1
                    });
                    user.markModified('inventory');
                }
            } else if (r.tier !== undefined) {
                if (!user.materials) user.materials = {};
                user.materials[r.tier.toString()] = (user.materials[r.tier.toString()] || 0) + (r.amount || 1);
                nameObj = materialNames[r.tier] || { th: `Unknown Ore (${r.tier})`, en: `Unknown Ore (${r.tier})` };
                user.markModified('materials');
            }

            const label = r.type === 'rare' ? '[JACKPOT] ' : '';
            const nameStr = typeof nameObj === 'object' ? nameObj.th : nameObj;
            rewardString += `${rewardString ? ' + ' : ''}${label}${nameStr} x${r.amount || 1}`;
        }

        user.activeExpedition = null; // CRITICAL: Clear expedition BEFORE marking modified
        user.markModified('activeExpedition');
        user.markModified('materials');
        user.markModified('inventory');
        await user.save();

        // Log Transaction
        const rewardTx = new Transaction({
            userId,
            type: 'DUNGEON_REWARD',
            amount: 0,
            status: 'COMPLETED',
            description: `รับรางวัลจากการสำรวจ: ${rewardString}`
        });
        await rewardTx.save();

        // Log Transaction if reward included significant things (optional)

        res.json({
            success: true,
            reward: rewardString,
            type: rewardType,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const skipExpeditionTime = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { itemId } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.activeExpedition) {
            return res.status(400).json({ message: 'No active expedition' });
        }

        const itemIndex = user.inventory.findIndex(i => i.typeId === itemId);
        if (itemIndex === -1) return res.status(400).json({ message: 'Item not found in inventory' });

        let skipMs = 0;
        if (itemId === 'hourglass_small') skipMs = 30 * 60 * 1000;
        else if (itemId === 'hourglass_medium') skipMs = 2 * 60 * 60 * 1000;
        else if (itemId === 'hourglass_large') skipMs = 6 * 60 * 60 * 1000;

        user.activeExpedition.endTime -= skipMs;
        user.inventory.splice(itemIndex, 1);
        user.markModified('activeExpedition');
        user.markModified('inventory');

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
