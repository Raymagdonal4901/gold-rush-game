const mongoose = require('mongoose');
require('dotenv').config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush');
        console.log('Connected');

        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ username: 'ZONG888' });

        if (!user) {
            console.log('User ZONG888 not found');
            process.exit(0);
        }

        console.log('User ID:', user._id, typeof user._id);
        const userIdStr = user._id.toString();

        // Check transactions
        const tx = await db.collection('transactions').findOne({
            $or: [
                { userId: user._id },
                { userId: userIdStr }
            ]
        });

        if (tx) {
            console.log('Found a transaction!');
            console.log('userId in Tx:', tx.userId, typeof tx.userId);
            console.log('Tx Type:', tx.type);
            console.log('Description:', tx.description);
        } else {
            console.log('No transactions found for ZONG888');
        }

        // Search for ANY referral bonus transaction to see description format
        const refTx = await db.collection('transactions').findOne({
            type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD'] }
        });

        if (refTx) {
            console.log('Found a referral transaction!');
            console.log('Description:', refTx.description);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
