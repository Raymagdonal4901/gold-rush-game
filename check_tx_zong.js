
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

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
            console.log('--- Sample Transaction ---');
            console.log(JSON.stringify(allReferralTxs[0], null, 2));

            // Check descriptions for L1/L2/L3
            const descriptions = allReferralTxs.map(t => t.description);
            console.log('Sample descriptions:', descriptions);
        } else {
            // Check if there are ANY transactions for this user
            const count = await db.collection('transactions').countDocuments({
                $or: [
                    { userId: userIdStr },
                    { userId: userIdObj }
                ]
            });
            console.log(`Total transactions for ZONG888: ${count}`);

            if (count > 0) {
                const sample = await db.collection('transactions').find({
                    $or: [
                        { userId: userIdStr },
                        { userId: userIdObj }
                    ]
                }).limit(5).toArray();
                console.log('Sample transactions types:', sample.map(t => t.type));
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
