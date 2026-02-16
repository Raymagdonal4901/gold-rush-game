
import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { v4 as uuidv4 } from 'uuid';
import { LUCKY_DRAW_CONFIG } from '../constants';

export const playLuckyDraw = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = Date.now();
        const lastPlay = user.lastLuckyDraw || 0;
        const isFree = (now - lastPlay) > LUCKY_DRAW_CONFIG.FREE_COOLDOWN_MS;

        if (!isFree) {
            if (user.balance < LUCKY_DRAW_CONFIG.COST) {
                return res.status(400).json({ message: 'เงินไม่พอ (Insufficient balance)' });
            }
            user.balance -= LUCKY_DRAW_CONFIG.COST;
        }

        // Dynamic Reward Logic
        const rand = Math.random() * 100;
        let cumulativeChance = 0;
        let selectedRewardConfig = LUCKY_DRAW_CONFIG.PROBABILITIES[LUCKY_DRAW_CONFIG.PROBABILITIES.length - 1]; // Default to last (consolation)

        for (const p of LUCKY_DRAW_CONFIG.PROBABILITIES) {
            cumulativeChance += p.chance;
            if (rand < cumulativeChance) {
                selectedRewardConfig = p;
                break;
            }
        }

        const reward: any = { ...selectedRewardConfig };

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
                amount: LUCKY_DRAW_CONFIG.COST,
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
