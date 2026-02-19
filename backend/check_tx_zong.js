
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory (.env is in backend/)
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

async function run() {
    try {
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ username: 'ZONG888' }).toArray();
        if (users.length === 0) {
            console.log('User ZONG888 not found');
            return;
        }

        const user = users[0];
        const userIdStr = user._id.toString();
        const userIdObj = user._id;

        console.log('User ZONG888 ID:', userIdStr);

        // Find ANY referral bonus transactions for this user
        const txTypes = [
            'REFERRAL_BONUS',
            'REFERRAL_BONUS_BUY',
            'REFERRAL_BONUS_YIELD',
            'REFERRAL_BONUS_COMMISSION_BUY',
            'REFERRAL_BONUS_COMMISSION_YIELD'
        ];

        const allReferralTxs = await db.collection('transactions').find({
            $or: [
                { userId: userIdStr },
                { userId: userIdObj }
            ],
            type: { $in: txTypes }
        }).sort({ timestamp: -1 }).limit(10).toArray();

        console.log(`Found ${allReferralTxs.length} recent referral transactions for ZONG888`);

        if (allReferralTxs.length > 0) {
            console.log('--- Sample Transaction (ZONG888) ---');
            console.log(JSON.stringify(allReferralTxs[0], null, 2));

            // Check descriptions for L1/L2/L3
            const descriptions = allReferralTxs.map(t => t.description);
            console.log('Sample descriptions:', descriptions);
        } else {
            console.log('No referral transactions found for ZONG888 using current logic.');

            // Search for ANY transaction with "ZONG" or "คอม" to see if we missed the type
            const keywordTxs = await db.collection('transactions').find({
                description: { $regex: /คอม/i }
            }).limit(5).toArray();

            console.log('Transactions with "คอม" in description:', keywordTxs.length);
            if (keywordTxs.length > 0) {
                console.log('Sample "คอม" tx:', JSON.stringify(keywordTxs[0], null, 2));
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
