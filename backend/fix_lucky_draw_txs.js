
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String },
    description: { type: String, required: true }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

async function fixTransactions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const query = {
            type: 'LUCKY_DRAW',
            description: 'เล่นเสี่ยงโชค (Lucky Draw)',
            amount: { $gt: 0 }
        };

        const misleadingTxs = await Transaction.find(query);
        console.log(`Found ${misleadingTxs.length} misleading Lucky Draw cost transactions.`);

        if (misleadingTxs.length > 0) {
            const result = await Transaction.updateMany(query, [
                { $set: { amount: { $multiply: ["$amount", -1] } } }
            ]);
            console.log(`Successfully updated ${result.modifiedCount} transactions.`);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixTransactions();
