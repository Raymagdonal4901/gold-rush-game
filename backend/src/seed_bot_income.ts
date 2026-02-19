import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';
import Rig from './models/Rig';
import Transaction from './models/Transaction';
import { REFERRAL_COMMISSION } from './constants';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');

async function seedBotIncome() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB at', MONGODB_URI);

        const bots = await User.find({ username: { $regex: /^Bot_/i } });
        console.log(`Found ${bots.length} bots to seed.`);

        for (const bot of bots) {
            console.log(`Processing ${bot.username}...`);

            // 1. Ensure Bot has a Rig
            const existingRig = await Rig.findOne({ ownerId: bot._id.toString() });
            if (!existingRig) {
                const newRig = new Rig({
                    ownerId: bot._id.toString(),
                    name: { th: 'เครื่องขุดทดสอบ (Bot Rig)', en: 'Bot Test Rig' },
                    investment: 5000,
                    dailyProfit: 100,
                    purchaseDate: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    tierId: 1,
                    status: 'ACTIVE'
                });
                await newRig.save();
                console.log(`  - Created rig for ${bot.username}`);
            }

            // 2. Generate Commission Transactions for Referrers
            if (bot.referrerId) {
                await processReferralBonuses(bot);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

async function processReferralBonuses(user: any) {
    let currentReferrerId = user.referrerId;
    const levels = [
        { key: 'L1', percent: REFERRAL_COMMISSION.BUY.L1, type: 'BUY', amount: 5000 },
        { key: 'L2', percent: REFERRAL_COMMISSION.BUY.L2, type: 'BUY', amount: 5000 },
        { key: 'L3', percent: REFERRAL_COMMISSION.BUY.L3, type: 'BUY', amount: 5000 },
        { key: 'L1', percent: REFERRAL_COMMISSION.YIELD.L1, type: 'YIELD', amount: 100 },
        { key: 'L2', percent: REFERRAL_COMMISSION.YIELD.L2, type: 'YIELD', amount: 100 },
        { key: 'L3', percent: REFERRAL_COMMISSION.YIELD.L3, type: 'YIELD', amount: 100 }
    ];

    // Simulating L1, L2, L3
    let depth = 0;
    while (currentReferrerId && depth < 3) {
        const referrer = await User.findById(currentReferrerId);
        if (!referrer) break;

        const levelKey = `L${depth + 1}`;

        // Generate BUY Bonus
        const buyBonus = Math.floor(5000 * (levelKey === 'L1' ? REFERRAL_COMMISSION.BUY.L1 : (levelKey === 'L2' ? REFERRAL_COMMISSION.BUY.L2 : REFERRAL_COMMISSION.BUY.L3)));
        const buyTx = new Transaction({
            userId: referrer._id,
            type: 'REFERRAL_BONUS_BUY',
            amount: buyBonus,
            status: 'COMPLETED',
            description: `ค่าคอมมิชชั่น ${levelKey} (${(levelKey === 'L1' ? REFERRAL_COMMISSION.BUY.L1 : (levelKey === 'L2' ? REFERRAL_COMMISSION.BUY.L2 : REFERRAL_COMMISSION.BUY.L3)) * 100}%) จากการซื้อของ ${user.username}`,
            details: { fromUser: user._id.toString() }
        });
        await buyTx.save();

        // Generate YIELD Bonus
        const yieldBonus = Math.floor(100 * (levelKey === 'L1' ? REFERRAL_COMMISSION.YIELD.L1 : (levelKey === 'L2' ? REFERRAL_COMMISSION.YIELD.L2 : REFERRAL_COMMISSION.YIELD.L3)));
        const yieldTx = new Transaction({
            userId: referrer._id,
            type: 'REFERRAL_BONUS_YIELD',
            amount: yieldBonus,
            status: 'COMPLETED',
            description: `ค่าคอมมิชชั่น ${levelKey} (${(levelKey === 'L1' ? REFERRAL_COMMISSION.YIELD.L1 : (levelKey === 'L2' ? REFERRAL_COMMISSION.YIELD.L2 : REFERRAL_COMMISSION.YIELD.L3)) * 100}%) จากการขุดของ ${user.username}`,
            details: { fromUser: user._id.toString() }
        });
        await yieldTx.save();

        // Update Referrer Stats
        referrer.referralStats.totalEarned = (referrer.referralStats.totalEarned || 0) + buyBonus + yieldBonus;
        await referrer.save();

        console.log(`  - Added ${levelKey} bonus to ${referrer.username} from ${user.username}`);

        currentReferrerId = referrer.referrerId;
        depth++;
    }
}

seedBotIncome();
