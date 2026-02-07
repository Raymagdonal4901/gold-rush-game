import { Request, Response } from 'express';
import User from '../models/User';

// Copy of Frontend Constants
const DAILY_CHECKIN_REWARDS = [
    { day: 1, reward: 'money', amount: 10, label: '10 บาท' },
    { day: 2, reward: 'material', tier: 1, amount: 2, label: 'ถ่านหิน x2' },
    { day: 3, reward: 'money', amount: 15, label: '15 บาท' },
    { day: 4, reward: 'material', tier: 1, amount: 3, label: 'ถ่านหิน x3' },
    { day: 5, reward: 'money', amount: 20, label: '20 บาท' },
    { day: 6, reward: 'item', id: 'chest_key', amount: 1, label: 'กุญแจเข้าเหมือง x1' },
    { day: 7, reward: 'item', id: 'chest_key', amount: 3, label: 'กุญแจเข้าเหมือง x3', highlight: true },
    { day: 8, reward: 'money', amount: 25, label: '25 บาท' },
    { day: 9, reward: 'material', tier: 2, amount: 2, label: 'ทองแดง x2' },
    { day: 10, reward: 'money', amount: 30, label: '30 บาท' },
    { day: 11, reward: 'material', tier: 3, amount: 1, label: 'เหล็ก x1' },
    { day: 12, reward: 'money', amount: 35, label: '35 บาท' },
    { day: 13, reward: 'item', id: 'upgrade_chip', amount: 2, label: 'ชิป x2' },
    { day: 14, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1', highlight: true },
    { day: 15, reward: 'money', amount: 40, label: '40 บาท' },
    { day: 16, reward: 'material', tier: 3, amount: 2, label: 'เหล็ก x2' },
    { day: 17, reward: 'material', tier: 2, amount: 5, label: 'ทองแดง x5' },
    { day: 18, reward: 'money', amount: 45, label: '45 บาท' },
    { day: 19, reward: 'material', tier: 3, amount: 2, label: 'เหล็ก x2' },
    { day: 20, reward: 'item', id: 'upgrade_chip', amount: 5, label: 'ชิป x5' },
    { day: 21, reward: 'item', id: 'upgrade_chip', amount: 15, label: 'ชิป x15', highlight: true },
    { day: 22, reward: 'money', amount: 50, label: '50 บาท' },
    { day: 23, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 24, reward: 'item', id: 'chest_key', amount: 5, label: 'กุญแจเข้าเหมือง x5' },
    { day: 25, reward: 'money', amount: 60, label: '60 บาท' },
    { day: 26, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 27, reward: 'item', id: 'mixer', amount: 1, label: 'เครื่องผสม' },
    { day: 28, reward: 'money', amount: 100, label: 'Jackpot 100 บาท', highlight: true },
    { day: 29, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 30, reward: 'grand_prize', label: 'ใบประกันความเสี่ยง + เพชร', highlight: true, special: true },
];

const getResetDayIdentifier = (timestamp: number) => {
    if (timestamp === 0) return 'never';
    const date = new Date(timestamp);
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
};

export const checkIn = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = Date.now();
        const lastCheckInTime = user.lastCheckIn ? new Date(user.lastCheckIn).getTime() : 0;

        const lastResetDay = getResetDayIdentifier(lastCheckInTime);
        const nowResetDay = getResetDayIdentifier(now);

        // Check if already checked in today (relative to 7 AM reset)
        if (lastCheckInTime !== 0 && lastResetDay === nowResetDay) {
            return res.status(400).json({ message: 'วันนี้คุณรับรางวัลไปแล้ว (รีเซ็ตทุกๆ 07:00 น.)' });
        }

        // Check streak continuity (allow gap until the end of the day after the expected next day)
        // Expected next day is nowResetDay - 1 day
        const dayInMillis = 24 * 60 * 60 * 1000;
        const timeDiff = now - lastCheckInTime;

        let streak = user.checkInStreak || 0;

        // If last check in was more than 48 hours ago, reset streak
        // Or more precisely, if we missed more than one full reset cycle
        if (lastCheckInTime !== 0 && timeDiff > dayInMillis * 2) {
            streak = 1; // Reset streak
        } else {
            streak += 1;
        }

        // Cap streak at 30 days loop
        if (streak > 30) streak = 1;

        // Get reward for current streak day
        const rewardConfig = DAILY_CHECKIN_REWARDS.find(r => r.day === streak);

        if (rewardConfig) {
            // Give Reward
            if (rewardConfig.reward === 'money') {
                user.balance += (rewardConfig as any).amount;
            } else if (rewardConfig.reward === 'material') {
                // Update materials field directly instead of pushing to inventory as objects.
                if (!user.materials) user.materials = {};
                const tier = (rewardConfig as any).tier;
                const amount = (rewardConfig as any).amount;
                user.materials[tier.toString()] = (user.materials[tier.toString()] || 0) + amount;
                user.markModified('materials');

                // Track stats
                if (!user.stats) user.stats = {};
                user.stats.totalMaterialsMined = (user.stats.totalMaterialsMined || 0) + amount;
                user.markModified('stats');
            } else if (rewardConfig.reward === 'item') {
                const itemConfig = (rewardConfig as any);
                const newItem = {
                    id: (itemConfig.id || 'item') + '_' + Date.now(),
                    typeId: itemConfig.id,
                    name: itemConfig.label,
                    price: 0,
                    rarity: 'RARE',
                    purchasedAt: Date.now(),
                    expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
                    level: 1
                };
                // If amount > 1
                const amount = itemConfig.amount || 1;
                for (let i = 0; i < amount; i++) {
                    user.inventory.push({ ...newItem, id: newItem.id + `_${i}` });
                }
            } else if (rewardConfig.reward === 'grand_prize') {
                // Special Logic for Day 30
                user.inventory.push({
                    id: 'insurance_card_' + Date.now(),
                    typeId: 'insurance_card',
                    name: 'ใบประกันความเสี่ยง',
                    price: 300,
                    purchasedAt: Date.now(),
                    expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000
                });
                // And Diamond (Material Tier 5)
                if (!user.materials) user.materials = {};
                user.materials['5'] = (user.materials['5'] || 0) + 1;
                user.markModified('materials');
            }
        }

        user.lastCheckIn = new Date(now);
        user.checkInStreak = streak;
        await user.save();

        res.json({ success: true, streak, reward: rewardConfig });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
