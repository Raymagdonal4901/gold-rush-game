const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    type: String,
    description: String,
    amount: Number
}));

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush');
        const count = await Transaction.countDocuments({
            type: { $in: ['REFERRAL_BONUS_BUY', 'REFERRAL_BONUS_YIELD'] }
        });
        console.log('Referral Transactions Count:', count);

        const sample = await Transaction.findOne({ type: 'REFERRAL_BONUS_BUY' });
        if (sample) {
            console.log('Sample Description:', sample.description);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
