const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const UserSchema = new mongoose.Schema({
    username: String,
    referralCode: String,
    referrerId: mongoose.Schema.Types.ObjectId,
    referralStats: {
        totalInvited: Number,
        totalEarned: Number
    },
    createdAt: Date,
    totalDailyIncome: Number
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    amount: Number,
    status: String,
    description: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

async function checkReferralId() {
    const TARGET_CODE = '1ZK0SG2G';

    try {
        console.log(`--- JS AUDIT FOR REFERRAL CODE: ${TARGET_CODE} ---`);
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI is not defined.');
            process.exit(1);
        }

        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const owner = await User.findOne({ referralCode: TARGET_CODE });
        if (!owner) {
            console.error(`ERROR: No user found with referral code ${TARGET_CODE}`);
            process.exit(1);
        }

        console.log(`Owner: ${owner.username} (${owner._id})`);
        console.log(`Stats: totalInvited=${owner.referralStats?.totalInvited || 0}, totalEarned=${owner.referralStats?.totalEarned || 0}`);

        const l1Users = await User.find({ referrerId: owner._id });
        console.log(`Actual L1 Count: ${l1Users.length}`);
        l1Users.forEach(u => console.log(`  - ${u.username} (${u.createdAt})`));

        const l1Ids = l1Users.map(u => u._id);
        const l2Users = await User.find({ referrerId: { $in: l1Ids } });
        console.log(`Actual L2 Count: ${l2Users.length}`);

        const l2Ids = l2Users.map(u => u._id);
        const l3Users = await User.find({ referrerId: { $in: l2Ids } });
        console.log(`Actual L3 Count: ${l3Users.length}`);

        console.log('--- AUDIT COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
}

checkReferralId();
