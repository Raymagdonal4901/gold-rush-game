const mongoose = require('mongoose');
require('dotenv').config();

// Define Schemas (Minimal for verification)
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    referralCode: String,
    referralStats: { totalEarned: Number }
}));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    amount: Number,
    status: String,
    description: String
}));

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush');
        console.log('Connected to DB');

        const username = 'ZONG888';
        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User ${username} not found`);
            process.exit(0);
        }

        console.log(`Found User: ${user.username} (${user._id})`);

        const commissionStats = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(user._id.toString()),
                    type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD', 'REFERRAL_BONUS', 'REFERRAL_BONUS_COMMISSION_BUY', 'REFERRAL_BONUS_COMMISSION_YIELD'] },
                    status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: null,
                    l1: {
                        $sum: {
                            $cond: [{ $regexMatch: { input: "$description", regex: "L1", options: "i" } }, "$amount", 0]
                        }
                    },
                    l2: {
                        $sum: {
                            $cond: [{ $regexMatch: { input: "$description", regex: "L2", options: "i" } }, "$amount", 0]
                        }
                    },
                    l3: {
                        $sum: {
                            $cond: [{ $regexMatch: { input: "$description", regex: "L3", options: "i" } }, "$amount", 0]
                        }
                    },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        console.log('Aggregation Result:');
        console.log(JSON.stringify(commissionStats, null, 2));

        if (commissionStats.length > 0 && commissionStats[0].total > 0) {
            console.log('✅ SUCCESS: Commissions found and correctly aggregated.');
        } else {
            console.log('⚠️ WARNING: No commissions found for this user in Transaction collection.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
