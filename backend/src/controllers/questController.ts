
import { Request, Response } from 'express';
import User from '../models/User';

export const getQuestStatus = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await checkAndResetWeeklyQuests(user);

        res.json({
            weeklyStats: user.weeklyStats || {},
            lastQuestReset: user.lastQuestReset,
            claimedQuests: user.claimedQuests || [] // Assuming claimedQuests is on User model, need to check
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Define Quests (Mirrors frontend constants to avoid shared repo complexity for now)
const QUESTS = [
    { id: 'q1', type: 'materials_crafted', target: 20, rewardType: 'points', rewardAmount: 20 },
    { id: 'q2', type: 'spend', target: 5000, rewardType: 'points', rewardAmount: 30 },
    { id: 'q3', type: 'dungeon', target: 30, rewardType: 'points', rewardAmount: 50 },
    { id: 'q4', type: 'items_crafted', target: 20, rewardType: 'points', rewardAmount: 40 },
    { id: 'q5', type: 'repair', target: 100, rewardType: 'points', rewardAmount: 20 },
    { id: 'q6', type: 'rare_loot', target: 1, rewardType: 'points', rewardAmount: 60 },
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
        }
        // Add other reward types if needed (items, materials)

        // Mark as claimed
        user.claimedQuests = [...(user.claimedQuests || []), questId];
        await user.save();

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

// Helper function to reset quests on Sunday
export const checkAndResetWeeklyQuests = async (user: any) => {
    const now = new Date();
    const lastReset = user.lastQuestReset ? new Date(user.lastQuestReset) : new Date(0);

    // Check if we passed a Sunday since last reset
    const nextReset = new Date(lastReset);
    nextReset.setDate(lastReset.getDate() + (7 - lastReset.getDay())); // Next Sunday (Note: 0 is Sunday, so this logic might need refinement for "Past Sunday")
    nextReset.setHours(0, 0, 0, 0);

    // Better Logic: Find the most recent Sunday 00:00
    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() - now.getDay());
    currentSunday.setHours(0, 0, 0, 0);

    if (lastReset < currentSunday) {
        console.log(`[QUEST] Resetting weekly quests for user ${user.username}`);
        user.weeklyStats = {
            materialsCrafted: 0,
            moneySpent: 0,
            dungeonsEntered: 0,
            itemsCrafted: 0,
            repairAmount: 0,
            rareLootCount: 0
        };
        // Reset claimed quests if we tracked them weekly (assuming claimedQuests is weekly)
        // If claimedQuests is lifetime, we need a separate field for weekly claimed quests
        // Let's assume user.claimedQuests needs reset too if it's weekly
        // user.claimedQuests = []; 

        user.lastQuestReset = now;
        await user.save();
    }
};
