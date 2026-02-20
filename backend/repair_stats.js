const mongoose = require('mongoose');
require('dotenv').config();

// Define Schemas needed for repair
const userSchema = new mongoose.Schema({
    username: String,
    referrerId: mongoose.Schema.Types.Mixed,
    referralStats: {
        totalInvited: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 }
    }
});

const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.Mixed,
    type: String,
    amount: Number,
    status: String
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

async function repair() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected.');

        const allUsers = await User.find({});
        console.log(`Found ${allUsers.length} users. Recalculating stats...`);

        const refTypes = [
            'REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS',
            'REFERRAL_BONUS_COMMISSION_BUY', 'REFERRAL_BONUS_COMMISSION_YIELD',
            'REFERRAL_BUY_BONUS', 'REFERRAL_YIELD_BONUS'
        ];

        let updatedCount = 0;

        for (const user of allUsers) {
            // 1. Count Level 1 Referrals
            const actualL1Count = await User.countDocuments({ referrerId: user._id });

            // 2. Calculate Total Earned (Permissive match for userId string or ObjectId)
            const earnings = await Transaction.aggregate([
                {
                    $match: {
                        $or: [
                            { userId: user._id.toString() },
                            { userId: user._id }
                        ],
                        type: { $in: refTypes },
                        status: 'COMPLETED'
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const actualTotalEarned = earnings.length > 0 ? earnings[0].total : 0;

            const currentInvited = user.referralStats?.totalInvited || 0;
            const currentEarned = user.referralStats?.totalEarned || 0;

            if (actualL1Count !== currentInvited || actualTotalEarned !== currentEarned) {
                await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            'referralStats.totalInvited': actualL1Count,
                            'referralStats.totalEarned': actualTotalEarned
                        }
                    }
                );
                console.log(`[UPDATED] ${user.username}: Invited ${currentInvited}->${actualL1Count}, Earned ${currentEarned}->${actualTotalEarned}`);
                updatedCount++;
            }
        }

        console.log('-----------------------------------');
        console.log(`Repair complete. ${updatedCount} users updated.`);
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err);
        process.exit(1);
    }
}

repair();
