import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

async function seedReferrals(targetUsername: string) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const rootUser = await User.findOne({ username: targetUsername });
        if (!rootUser) {
            console.error(`User ${targetUsername} not found`);
            process.exit(1);
        }

        console.log(`Seeding 10 bots for ${rootUser.username} (${rootUser._id})`);

        // Helper to create a bot
        const createBot = async (index: number, referrerId: mongoose.Types.ObjectId, income: number) => {
            const botUsername = `Bot_${targetUsername}_${index}_${Math.floor(Math.random() * 1000)}`;
            const botEmail = `${botUsername}@test.com`.toLowerCase();
            const bot = new User({
                username: botUsername,
                email: botEmail,
                passwordHash: 'hashed_dummy_password', // Not used for testing display
                referrerId: referrerId,
                totalDailyIncome: income,
                balance: 1000,
                referralStats: { totalInvited: 0, totalEarned: 0 }
            });
            await bot.save();
            return bot;
        };

        // Level 1: 3 bots
        const l1Bots = [];
        for (let i = 1; i <= 3; i++) {
            const bot = await createBot(i, rootUser._id as any, 50);
            l1Bots.push(bot);
            console.log(`Created L1 Bot: ${bot.username}`);
        }

        // Level 2: 4 bots (2 for first L1, 2 for second L1)
        const l2Bots = [];
        for (let i = 1; i <= 2; i++) {
            const bot = await createBot(i + 3, l1Bots[0]._id as any, 30);
            l2Bots.push(bot);
            console.log(`Created L2 Bot (child of ${l1Bots[0].username}): ${bot.username}`);
        }
        for (let i = 1; i <= 2; i++) {
            const bot = await createBot(i + 5, l1Bots[1]._id as any, 25);
            l2Bots.push(bot);
            console.log(`Created L2 Bot (child of ${l1Bots[1].username}): ${bot.username}`);
        }

        // Level 3: 3 bots (all under first L2)
        for (let i = 1; i <= 3; i++) {
            const bot = await createBot(i + 7, l2Bots[0]._id as any, 10);
            console.log(`Created L3 Bot (child of ${l2Bots[0].username}): ${bot.username}`);
        }

        console.log('Seeding complete! Refresh your dashboard.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

// Get username from command line
const username = process.argv[2];
if (!username) {
    console.error('Please provide a username: npx ts-node src/seed_test_referrals.ts <username>');
    process.exit(1);
}

seedReferrals(username);
