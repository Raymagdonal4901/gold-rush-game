import mongoose from 'mongoose';
import User from './models/User';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const users = await User.find({});
        users.forEach(u => {
            console.log(`User: ${u.username}`);
            console.log(`Inventory:`, JSON.stringify(u.inventory, null, 2));
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
