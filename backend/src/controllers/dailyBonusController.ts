import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

// Copy of Frontend Constants
const DAILY_CHECKIN_REWARDS = [
    { day: 1, reward: 'money', amount: 10, label: { th: '10 บาท', en: '10 THB' } },
    { day: 2, reward: 'material', tier: 1, amount: 2, label: { th: 'ถ่านหิน x2', en: 'Coal x2' } },
    { day: 3, reward: 'money', amount: 15, label: { th: '15 บาท', en: '15 THB' } },
    { day: 4, reward: 'material', tier: 1, amount: 3, label: { th: 'ถ่านหิน x3', en: 'Coal x3' } },
    { day: 5, reward: 'money', amount: 20, label: { th: '20 บาท', en: '20 THB' } },
    { day: 6, reward: 'item', id: 'chest_key', amount: 1, label: { th: 'กุญแจเข้าเหมือง x1', en: 'Mining Key x1' } },
    { day: 7, reward: 'item', id: 'chest_key', amount: 3, label: { th: 'กุญแจเข้าเหมือง x3', en: 'Mining Key x3' }, highlight: true },
    { day: 8, reward: 'money', amount: 25, label: { th: '25 บาท', en: '25 THB' } },
    { day: 9, reward: 'material', tier: 2, amount: 2, label: { th: 'ทองแดง x2', en: 'Copper x2' } },
    { day: 10, reward: 'money', amount: 30, label: { th: '30 บาท', en: '30 THB' } },
    { day: 11, reward: 'material', tier: 3, amount: 1, label: { th: 'เหล็ก x1', en: 'Iron x1' } },
    { day: 12, reward: 'money', amount: 35, label: { th: '35 บาท', en: '35 THB' } },
    { day: 13, reward: 'item', id: 'upgrade_chip', amount: 2, label: { th: 'ชิป x2', en: 'Upgrade Chip x2' } },
    { day: 14, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' }, highlight: true },
    { day: 15, reward: 'money', amount: 40, label: { th: '40 บาท', en: '40 THB' } },
    { day: 16, reward: 'material', tier: 3, amount: 2, label: { th: 'เหล็ก x2', en: 'Iron x2' } },
    { day: 17, reward: 'material', tier: 2, amount: 5, label: { th: 'ทองแดง x5', en: 'Copper x5' } },
    { day: 18, reward: 'money', amount: 45, label: { th: '45 บาท', en: '45 THB' } },
    { day: 19, reward: 'material', tier: 3, amount: 2, label: { th: 'เหล็ก x2', en: 'Iron x2' } },
    { day: 20, reward: 'item', id: 'upgrade_chip', amount: 5, label: { th: 'ชิป x5', en: 'Upgrade Chip x5' } },
    { day: 21, reward: 'item', id: 'upgrade_chip', amount: 15, label: { th: 'ชิป x15', en: 'Upgrade Chip x15' }, highlight: true },
    { day: 22, reward: 'money', amount: 50, label: { th: '50 บาท', en: '50 THB' } },
    { day: 23, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } },
    { day: 24, reward: 'item', id: 'chest_key', amount: 5, label: { th: 'กุญแจเข้าเหมือง x5', en: 'Mining Key x5' } },
    { day: 25, reward: 'money', amount: 60, label: { th: '60 บาท', en: '60 THB' } },
    { day: 26, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } },
    { day: 27, reward: 'item', id: 'mixer', amount: 1, label: { th: 'เครื่องผสม', en: 'Mixer' } },
    { day: 28, reward: 'money', amount: 100, label: { th: 'Jackpot 100 บาท', en: 'Jackpot 100 THB' }, highlight: true },
    { day: 29, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } },
    { day: 30, reward: 'grand_prize', label: { th: 'ใบประกันความเสี่ยง + เพชร', en: 'Insurance Card + Diamond' }, highlight: true, special: true },
];

const getResetDayIdentifier = (timestamp: number) => {
    if (timestamp === 0) return 'never';
    // Shift time by -7 hours so that 07:00 AM becomes 00:00 AM for date calculation
    const date = new Date(timestamp - (7 * 60 * 60 * 1000));
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

        // Determine streak
        let streak = (user.checkInStreak || 0) + 1;

        // Reset streak if missed more than 48 hours (relative to reset time)
        // Or simply if > 48h from last check in
        if (lastCheckInTime !== 0 && (now - lastCheckInTime) > (48 * 60 * 60 * 1000)) {
            streak = 1;
        }

        if (streak > 30) {
            streak = 1; // Cycle back after 30 days
        }

        const reward = DAILY_CHECKIN_REWARDS.find(r => r.day === streak);
        if (!reward) {
            return res.status(500).json({ message: 'Reward configuration error' });
        }

        // Give Reward
        if (reward.reward === 'money') {
            user.balance += reward.amount!;
        } else if (reward.reward === 'material') {
            if (!user.materials) user.materials = {};
            const matTier = reward.tier!.toString();
            user.materials[matTier] = (user.materials[matTier] || 0) + reward.amount!;
            user.markModified('materials');
        } else if (reward.reward === 'item' || reward.reward === 'grand_prize') {
            if (!user.inventory) user.inventory = [];

            if (reward.reward === 'grand_prize') {
                // Insurance Card (id: insurance_card) + Master Wing (Slot 6)
                // Let's just give insurance card and maybe some money/mats for now as Master Wing is a slot expansion
                // Actually, let's just follow the label: Insurance Card + Diamond
                user.inventory.push({
                    id: 'insurance_card',
                    name: 'Insurance Card',
                    type: 'CONSUMABLE',
                    purchasedAt: new Date(),
                    lifespanDays: 0
                });
                // Diamond x1
                if (!user.materials) user.materials = {};
                user.materials['5'] = (user.materials['5'] || 0) + 1;
                user.markModified('materials');
            } else {
                user.inventory.push({
                    id: reward.id!,
                    name: reward.id!.replace('_', ' '),
                    type: 'CONSUMABLE',
                    purchasedAt: new Date(),
                    lifespanDays: 0 // Consumables have 0 lifespan (unlimited or 1-time)
                });
            }
            user.markModified('inventory');
        }

        const txDetail = JSON.stringify({
            th: `เช็คอินวันที่ ${streak}: ${reward.label.th}`,
            en: `Day ${streak} check-in: ${reward.label.en}`
        });

        // Create Transaction Log
        await Transaction.create({
            userId,
            type: 'DAILY_BONUS',
            amount: 0,
            description: txDetail,
            status: 'COMPLETED',
            timestamp: new Date()
        });

        user.lastCheckIn = new Date(now);
        user.checkInStreak = streak;
        await user.save();

        res.json({
            success: true,
            reward,
            streak
        });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
