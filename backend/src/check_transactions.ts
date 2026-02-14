import mongoose from 'mongoose';
import User from './models/User';
import Transaction from './models/Transaction';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const transactions = await Transaction.find({ type: 'GIFT_CLAIM' }).sort({ timestamp: -1 }).limit(10);
        console.log('Recent GIFT_CLAIM Transactions:');
        transactions.forEach(tx => {
            console.log(`User: ${tx.userId}, Desc: ${tx.description}, Status: ${tx.status}`);
        });

        const users = await User.find({});
        users.forEach(u => {
            console.log(`\nUser: ${u.username} (${u._id})`);
            console.log(`Inventory Items count: ${u.inventory?.length || 0}`);
            if (u.inventory && u.inventory.length > 0) {
                console.log(`Inventory Details:`, JSON.stringify(u.inventory.map((i: any) => ({
                    id: i.id || i._id,
                    typeId: i.typeId,
                    name: i.name
                })), null, 2));
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
