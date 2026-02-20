/**
 * Diagnostic script: Check referral commission transactions for a specific user
 * Usage: npx ts-node src/diagnose_commissions.ts <username_or_referralCode>
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User';
import Transaction from './models/Transaction';

const target = process.argv[2] || 'ZONG888';

async function diagnose() {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Find user
    const user = await User.findOne({
        $or: [
            { username: { $regex: new RegExp(`^${target}$`, 'i') } },
            { referralCode: { $regex: new RegExp(`^${target}$`, 'i') } }
        ]
    }).select('_id username referralCode referralStats');

    if (!user) {
        console.log(`User not found: ${target}`);
        process.exit(1);
    }

    console.log(`\n=== User: ${user.username} ===`);
    console.log(`ID: ${user._id}`);
    console.log(`ID type: ${typeof user._id}`);
    console.log(`Referral Code: ${user.referralCode}`);
    console.log(`Stored referralStats:`, JSON.stringify(user.referralStats, null, 2));

    const userIdStr = user._id.toString();

    // Check referral transactions with string match
    const txByString = await Transaction.find({
        userId: userIdStr,
        type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS', 'REFERRAL_BONUS_COMMISSION_BUY', 'REFERRAL_BONUS_COMMISSION_YIELD', 'REFERRAL_BUY_BONUS', 'REFERRAL_YIELD_BONUS'] }
    }).limit(5);
    console.log(`\n--- Transactions matched by string userId (${userIdStr}): ${txByString.length} ---`);
    txByString.forEach(tx => {
        console.log(`  Type: ${tx.type} | Amount: ${tx.amount} | Desc: ${tx.description} | Status: ${tx.status} | userId field type: ${typeof tx.userId} | userId value: ${tx.userId}`);
    });

    // Check referral transactions with ObjectId match (raw query)
    const txByObjectId = await Transaction.collection.find({
        userId: user._id,
        type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS', 'REFERRAL_BONUS_COMMISSION_BUY', 'REFERRAL_BONUS_COMMISSION_YIELD', 'REFERRAL_BUY_BONUS', 'REFERRAL_YIELD_BONUS'] }
    }).limit(5).toArray();
    console.log(`\n--- Transactions matched by ObjectId userId: ${txByObjectId.length} ---`);
    txByObjectId.forEach(tx => {
        console.log(`  Type: ${tx.type} | Amount: ${tx.amount} | Desc: ${tx.description} | userId type in DB: ${typeof tx.userId} | isObjectId: ${tx.userId instanceof mongoose.Types.ObjectId}`);
    });

    // Count ALL referral transactions (any userId type)
    const allReferralTx = await Transaction.collection.find({
        type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS'] }
    }).limit(5).toArray();
    console.log(`\n--- Sample referral transactions (any user): ${allReferralTx.length} ---`);
    allReferralTx.forEach(tx => {
        console.log(`  userId: ${tx.userId} (type: ${typeof tx.userId}, isObjId: ${tx.userId instanceof mongoose.Types.ObjectId}) | Type: ${tx.type} | Amount: ${tx.amount}`);
    });

    // Aggregation test
    const aggResult = await Transaction.aggregate([
        {
            $match: {
                userId: userIdStr,
                type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS', 'REFERRAL_BONUS_COMMISSION_BUY', 'REFERRAL_BONUS_COMMISSION_YIELD'] },
                status: 'COMPLETED'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
    console.log(`\n--- Aggregation (string match) ---`);
    console.log(JSON.stringify(aggResult, null, 2));

    // Also test ObjectId aggregation
    const aggResultObjId = await Transaction.collection.aggregate([
        {
            $match: {
                userId: user._id,
                type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS', 'REFERRAL_BONUS_COMMISSION_BUY', 'REFERRAL_BONUS_COMMISSION_YIELD'] },
                status: 'COMPLETED'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]).toArray();
    console.log(`\n--- Aggregation (ObjectId match) ---`);
    console.log(JSON.stringify(aggResultObjId, null, 2));

    // L1 referrals check
    const l1Users = await User.find({ referrerId: user._id }).select('username').limit(3);
    console.log(`\n--- L1 Direct Referrals (first 3): ---`);
    l1Users.forEach(u => console.log(`  ${u.username} (${u._id})`));

    await mongoose.disconnect();
    console.log('\nDone.');
}

diagnose().catch(console.error);
