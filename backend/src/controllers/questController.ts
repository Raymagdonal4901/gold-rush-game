
import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';

export const getQuestStatus = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { nextResetAt } = await checkAndResetWeeklyQuests(user);

        res.json({
            weeklyStats: user.weeklyStats || {},
            lastQuestReset: user.lastQuestReset,
            nextResetAt,
            claimedQuests: user.claimedQuests || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Define Quests (Mirrors frontend constants to avoid shared repo complexity for now)
const QUESTS = [
    { id: 'q1', type: 'materials_crafted', target: 20, rewardType: 'points', rewardAmount: 20, rewardId: null },
    { id: 'q2', type: 'spend', target: 5000, rewardType: 'points', rewardAmount: 30, rewardId: null },
    { id: 'q3', type: 'dungeon', target: 30, rewardType: 'points', rewardAmount: 50, rewardId: null },
    { id: 'q4', type: 'items_crafted', target: 20, rewardType: 'points', rewardAmount: 40, rewardId: null },
    { id: 'q5', type: 'repair', target: 100, rewardType: 'points', rewardAmount: 20, rewardId: null },
    { id: 'q6', type: 'rare_loot', target: 1, rewardType: 'points', rewardAmount: 60, rewardId: null },
];

export const claimQuestReward = async (req: any, res: Response) => {
    try {
        const { questId } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await checkAndResetWeeklyQuests(user);

        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) return res.status(404).json({ message: 'Quest not found' });

        // Check if already claimed
        if (user.claimedQuests && user.claimedQuests.includes(questId)) {
            return res.status(400).json({ message: 'Quest already claimed' });
        }

        // Check completion
        const stats = user.weeklyStats || {};
        let progress = 0;
        if (quest.type === 'materials_crafted') progress = stats.materialsCrafted || 0;
        if (quest.type === 'spend') progress = stats.moneySpent || 0;
        if (quest.type === 'dungeon') progress = stats.dungeonsEntered || 0;
        if (quest.type === 'items_crafted') progress = stats.itemsCrafted || 0;
        if (quest.type === 'repair') progress = stats.repairAmount || 0;
        if (quest.type === 'rare_loot') progress = stats.rareLootCount || 0;

        if (progress < quest.target) {
            return res.status(400).json({ message: 'Quest requirements not met', current: progress, target: quest.target });
        }

        // Give Reward
        if (quest.rewardType === 'points') {
            user.masteryPoints = (user.masteryPoints || 0) + quest.rewardAmount;
        } else if (quest.rewardType === 'money') {
            user.balance += quest.rewardAmount;
        } else if (quest.rewardType === 'material') {
            const matTier = quest.rewardId ? String(quest.rewardId) : '1';
            user.materials[matTier] = (user.materials[matTier] || 0) + quest.rewardAmount;
            user.markModified('materials');
        }

        // Mark as claimed
        user.claimedQuests = [...(user.claimedQuests || []), questId];
        await user.save();

        // Log Transaction
        const questTx = new Transaction({
            userId: user._id,
            type: 'QUEST_REWARD',
            amount: quest.rewardType === 'money' ? quest.rewardAmount : 0,
            status: 'COMPLETED',
            description: `รับรางวัลเควส: ${quest.id}`
        });
        await questTx.save();

        res.json({
            message: 'Quest claimed successfully',
            user: {
                balance: user.balance,
                masteryPoints: user.masteryPoints,
                claimedQuests: user.claimedQuests
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Achievements
const ACHIEVEMENTS = [
    { id: 'log_1', title: 'First Steps', type: 'login', target: 1, points: 10 },
    { id: 'log_5', title: 'Loyal Miner', type: 'login', target: 5, points: 50 },
    { id: 'lucky_1', title: 'Fortune Finder', type: 'lucky', target: 1, points: 20 },
    { id: 'lucky_10', title: 'High Roller', type: 'lucky', target: 10, points: 100 },
];

// Mining Ranks
const MINING_RANKS = [
    { id: 'bronze', label: 'Bronze Miner', points: 0, rewardId: null },
    { id: 'silver', label: 'Silver Miner', points: 100, rewardId: 'starter_pack' },
    { id: 'gold', label: 'Gold Tycoon', points: 500, rewardId: 'gold_glove' },
    { id: 'platinum', label: 'Platinum Baron', points: 2000, rewardId: 'expert_rig' },
    { id: 'diamond', label: 'Diamond Overlord', points: 10000, rewardId: 'royal_permit' },
];

export const claimAchievement = async (req: any, res: Response) => {
    try {
        const { achId } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const ach = ACHIEVEMENTS.find(a => a.id === achId);
        if (!ach) return res.status(404).json({ message: 'Achievement not found' });

        // Check if already claimed
        if (user.claimedAchievements && user.claimedAchievements.includes(achId)) {
            return res.status(400).json({ message: 'Achievement already claimed' });
        }

        // Check completion (Lifetime Stats)
        const stats = user.stats || {};
        let progress = 0;
        if (ach.type === 'login') progress = stats.totalLogins || 0;
        if (ach.type === 'lucky') progress = stats.luckyDraws || 0;

        if (progress < ach.target) {
            return res.status(400).json({ message: 'Achievement requirements not met', current: progress, target: ach.target });
        }

        // Give Reward
        user.masteryPoints = (user.masteryPoints || 0) + ach.points;
        user.claimedAchievements = [...(user.claimedAchievements || []), achId];
        user.markModified('claimedAchievements');
        await user.save();

        // Log Transaction
        const achTx = new Transaction({
            userId: user._id,
            type: 'QUEST_REWARD',
            amount: 0,
            status: 'COMPLETED',
            description: `รับรางวัลความสำเร็จ: ${ach.title}`
        });
        await achTx.save();

        res.json({
            message: 'Achievement claimed successfully',
            masteryPoints: user.masteryPoints,
            claimedAchievements: user.claimedAchievements
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const claimRankReward = async (req: any, res: Response) => {
    try {
        const { rankId } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rank = MINING_RANKS.find(r => r.id === rankId);
        if (!rank) return res.status(404).json({ message: 'Rank not found' });

        if (!rank.rewardId) {
            return res.status(400).json({ message: 'This rank has no claimable reward' });
        }

        // Check if already claimed
        if (user.claimedRanks && user.claimedRanks.includes(rankId)) {
            return res.status(400).json({ message: 'Rank reward already claimed' });
        }

        // Check eligibility
        if (user.masteryPoints < rank.points) {
            return res.status(400).json({ message: 'Mastery points insufficient', current: user.masteryPoints, required: rank.points });
        }

        // Give Reward (Placeholder: For now just mark as claimed. In real app, add item to inventory)
        // user.inventory.push({ ...someItemLookup(rank.rewardId) });

        user.claimedRanks = [...(user.claimedRanks || []), rankId];
        user.markModified('claimedRanks');
        await user.save();

        // Log Transaction
        const rankTx = new Transaction({
            userId: user._id,
            type: 'RANK_REWARD',
            amount: 0,
            status: 'COMPLETED',
            description: `รับรางวัลเลื่อนระดับ: ${rank.label}`
        });
        await rankTx.save();

        res.json({
            message: 'Rank reward claimed successfully',
            claimedRanks: user.claimedRanks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Helper function to reset quests every Monday at 00:00
export const checkAndResetWeeklyQuests = async (user: any) => {
    const now = new Date();
    const lastReset = user.lastQuestReset ? new Date(user.lastQuestReset) : new Date(0);

    // Calculate the most recent Monday 00:00
    // Day: 0=Sun, 1=Mon, ..., 6=Sat
    const currentMonday = new Date(now);
    const day = now.getDay();
    const diff = (day === 0 ? 6 : day - 1); // Days since last Monday
    currentMonday.setDate(now.getDate() - diff);
    currentMonday.setHours(0, 0, 0, 0);

    // Calculate Next Monday 00:00
    const nextResetAt = new Date(currentMonday);
    nextResetAt.setDate(currentMonday.getDate() + 7);

    if (lastReset < currentMonday) {
        console.log(`[QUEST] Resetting weekly quests for user ${user.username}. Last Reset: ${lastReset.toISOString()}, Current Monday: ${currentMonday.toISOString()}`);
        user.weeklyStats = {
            materialsCrafted: 0,
            moneySpent: 0,
            dungeonsEntered: 0,
            itemsCrafted: 0,
            repairAmount: 0,
            rareLootCount: 0
        };
        // Reset claimed quests for the new week
        user.claimedQuests = [];
        user.markModified('claimedQuests');
        user.markModified('weeklyStats');

        user.lastQuestReset = now;
        await user.save();
    }

    return { nextResetAt };
};
