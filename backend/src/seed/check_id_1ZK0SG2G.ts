import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Transaction from '../models/Transaction';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkReferralId() {
    const TARGET_CODE = '1ZK0SG2G';

    try {
        console.log(`--- AUDIT FOR REFERRAL CODE: ${TARGET_CODE} ---`);
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI is not defined in environment variables.');
            process.exit(1);
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully.');

        const owner = await User.findOne({ referralCode: TARGET_CODE });
        if (!owner) {
            console.error(`ERROR: No user found with referral code ${TARGET_CODE}`);
            process.exit(1);
        }

        console.log(`Owner Found: ${owner.username} (${owner._id})`);
        console.log(`Stored Stats: totalInvited=${owner.referralStats?.totalInvited || 0}, totalEarned=${owner.referralStats?.totalEarned || 0}`);

        // 1. Audit Level 1
        const l1Users = await User.find({ referrerId: owner._id }).select('username createdAt');
        console.log(`Actual L1 Count (DB): ${l1Users.length}`);
        l1Users.forEach(u => console.log(`  - ${u.username} (Joined: ${u.createdAt})`));

        // 2. Audit Level 2
        const l1Ids = l1Users.map(u => u._id);
        const l2Users = await User.find({ referrerId: { $in: l1Ids } }).select('username referrerId');
        console.log(`Actual L2 Count (DB): ${l2Users.length}`);

        // 3. Audit Level 3
        const l2Ids = l2Users.map(u => u._id);
        const l3Users = await User.find({ referrerId: { $in: l2Ids } }).select('username referrerId');
        console.log(`Actual L3 Count (DB): ${l3Users.length}`);

        // 4. Audit Earnings
        const bonusTx = await Transaction.find({
            userId: owner._id,
            type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD'] }
        });
        const totalBonusFromTx = bonusTx.reduce((sum, tx) => sum + tx.amount, 0);
        console.log(`Total Referral Earnings from Transactions: ${totalBonusFromTx}`);

        console.log('--- AUDIT COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
}

checkReferralId();
