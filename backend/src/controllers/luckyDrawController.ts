
import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { v4 as uuidv4 } from 'uuid';

const LUCKY_DRAW_COST = 50;
const FREE_COOLDOWN = 12 * 60 * 60 * 1000; // 12 hours

export const playLuckyDraw = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = Date.now();
        const lastPlay = user.lastLuckyDraw || 0;
        const isFree = (now - lastPlay) > FREE_COOLDOWN;

        if (!isFree) {
            if (user.balance < LUCKY_DRAW_COST) {
                return res.status(400).json({ message: 'เงินไม่พอ (Insufficient balance)' });
            }
            user.balance -= LUCKY_DRAW_COST;
        }

        // Random Logic
        const rand = Math.random() * 100;
        let reward: any = { type: 'money', amount: 10, label: { th: 'รางวัลปลอบใจ 10 บาท', en: 'Consolation Prize 10 THB' } };

        if (rand < 1) {
            // 1% Jackpot
            reward = { type: 'money', amount: 500, label: { th: 'JACKPOT! 500 บาท', en: 'JACKPOT! 500 THB' } };
        } else if (rand < 5) {
            // 4% Rare Item
            reward = { type: 'item', id: 'upgrade_chip', amount: 10, label: { th: 'ชิปอัปเกรด x10', en: 'Upgrade Chip x10' } };
        } else if (rand < 15) {
            // 10% Energy
            reward = { type: 'energy', amount: 50, label: { th: 'พลังงาน +50', en: 'Energy +50' } };
        } else if (rand < 40) {
            // 25% Materials
            reward = { type: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } };
        }

        // Apply Reward
        if (reward.type === 'money') {
            user.balance += reward.amount;
        } else if (reward.type === 'energy') {
            user.energy = Math.min(100, (user.energy || 0) + reward.amount);
        } else if (reward.type === 'material') {
            if (!user.materials) user.materials = {};
            const tierStr = reward.tier.toString();
            user.materials[tierStr] = (user.materials[tierStr] || 0) + reward.amount;
            user.markModified('materials');
        } else if (reward.type === 'item') {
            for (let i = 0; i < (reward.amount || 1); i++) {
                user.inventory.push({
                    id: uuidv4(),
                    typeId: reward.id,
                    name: reward.label,
                    rarity: 'RARE',
                    purchasedAt: Date.now(),
                    level: 1
                });
            }
        }

        user.lastLuckyDraw = now;
        await user.save();

        // Log Transaction (Cost)
        if (!isFree) {
            const costTx = new Transaction({
                userId: user._id,
                type: 'LUCKY_DRAW',
                amount: LUCKY_DRAW_COST,
                status: 'COMPLETED',
                description: `เล่นเสี่ยงโชค (Lucky Draw)`
            });
            await costTx.save();
        }

        // Log Transaction (Reward)
        const rewardTx = new Transaction({
            userId: user._id,
            type: 'LUCKY_DRAW',
            amount: reward.type === 'money' ? reward.amount : 0,
            status: 'COMPLETED',
            description: `รับรางวัลเสี่ยงโชค: ${typeof reward.label === 'object' ? reward.label.th : reward.label}`
        });
        await rewardTx.save();

        res.json({
            success: true,
            label: reward.label,
            reward: {
                type: reward.type,
                amount: reward.amount,
                id: reward.id
            },
            newBalance: user.balance
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
