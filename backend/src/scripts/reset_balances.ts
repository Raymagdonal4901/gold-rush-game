
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const resetBalances = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('MongoDB Connected');

        const result = await User.updateMany({}, { $set: { balance: 0 } });
        console.log(`Reset balances for ${result.modifiedCount} users.`);

        process.exit(0);
    } catch (error) {
        console.error('Error resetting balances:', error);
        process.exit(1);
    }
};

resetBalances();
