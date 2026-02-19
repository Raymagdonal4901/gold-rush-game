
const mongoose = require('mongoose');
const path = require('path');

// Mock User model if needed, but we just need the connection
const uri = 'mongodb://localhost:27017/gold-rush';

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ username: 'RAYMAGDONAL' }).toArray();
        if (users.length === 0) {
            console.log('User RAYMAGDONAL not found');
            return;
        }

        const user = users[0];
        const userIdStr = user._id.toString();
        const userIdObj = user._id;

        console.log('User ID (String):', userIdStr);
        console.log('User ID (ObjectId):', userIdObj);

        const txTypes = ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS'];

        // Check for transactions with string userId
        const txsStr = await db.collection('transactions').find({
            userId: userIdStr,
            type: { $in: txTypes }
        }).limit(5).toArray();
        console.log('Transactions found with String userId:', txsStr.length);

        // Check for transactions with ObjectId userId
        const txsObj = await db.collection('transactions').find({
            userId: userIdObj,
            type: { $in: txTypes }
        }).limit(5).toArray();
        console.log('Transactions found with ObjectId userId:', txsObj.length);

        if (txsStr.length > 0) {
            console.log('Example Transaction (String):', JSON.stringify(txsStr[0], null, 2));
        }
        if (txsObj.length > 0) {
            console.log('Example Transaction (ObjectId):', JSON.stringify(txsObj[0], null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
