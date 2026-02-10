
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const checkBalances = async () => {
    try {
        let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush';
        if (uri.includes('localhost')) {
            uri = uri.replace('localhost', '127.0.0.1');
        }

        console.log('Connecting to MongoDB at:', uri);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        users.forEach(u => {
            console.log(`- User: ${u.username}, Balance: ${u.balance}`);
        });

        // Force reset just in case
        const result = await User.updateMany({}, { $set: { balance: 0 } });
        console.log(`Forced reset command run. Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkBalances();
