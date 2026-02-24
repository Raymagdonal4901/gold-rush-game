import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';
import { SHOP_ITEMS, DAILY_CHECKIN_REWARDS } from '../constants';
import { v4 as uuidv4 } from 'uuid';


// Copy of Frontend Constants

const getResetDayIdentifier = (timestamp: number) => {
    if (timestamp === 0) return 'never';
    // 00:00 UTC corresponds exactly to 07:00 ICT
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
                const shopItem = SHOP_ITEMS.find(s => s.id === reward.id);
                const lifespan = shopItem?.lifespanDays || 0;
                const bonus = shopItem ? (Number(shopItem.minBonus) + Number(shopItem.maxBonus)) / 2 : 0;
                const count = (reward as any).amount || 1;

                for (let i = 0; i < count; i++) {
                    user.inventory.push({
                        id: uuidv4(),
                        typeId: reward.id!,
                        name: shopItem?.name || reward.id!.replace('_', ' '),
                        price: shopItem?.price || 0,
                        dailyBonus: bonus,
                        durationBonus: shopItem?.durationBonus || 0,
                        rarity: shopItem?.rarity || 'RARE',
                        purchasedAt: Date.now(),
                        lifespanDays: lifespan,
                        expireAt: lifespan > 0 ? Date.now() + (lifespan * 24 * 60 * 60 * 1000) : 0,
                        currentDurability: shopItem?.maxDurability || 100,
                        maxDurability: shopItem?.maxDurability || 100,
                        level: 1,
                        isHandmade: false
                    });
                }
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
