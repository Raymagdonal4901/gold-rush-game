import mongoose from 'mongoose';
import User from './backend/src/models/User';
import Rig from './backend/src/models/Rig';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

async function checkStats() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const usersCount = await User.countDocuments();
    const activeRigs = await Rig.countDocuments();

    const userBalances = await User.aggregate([
        { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    const totalBalance = userBalances.length > 0 ? userBalances[0].total : 0;

    const rigInvestments = await Rig.aggregate([
        { $group: { _id: null, total: { $sum: "$investment" } } }
    ]);
    const totalInvestment = rigInvestments.length > 0 ? rigInvestments[0].total : 0;

    console.log('--- DATABASE STATS ---');
    console.log('Total Users:', usersCount);
    console.log('Total Rigs:', activeRigs);
    console.log('Total User Balance:', totalBalance);
    console.log('Total Rig Investment:', totalInvestment);
    console.log('Market Cap (Sum):', totalBalance + totalInvestment);
    console.log('----------------------');

    await mongoose.disconnect();
}

checkStats();
