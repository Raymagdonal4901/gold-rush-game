import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DepositRequest from './models/DepositRequest';
import User from './models/User';


const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const deposits = await DepositRequest.find({});
        console.log('All Deposits:', JSON.stringify(deposits, null, 2));

        const pending = await DepositRequest.find({ status: 'PENDING' });
        console.log('Pending Deposits:', pending.length);

        const users = await User.find({});
        console.log('Users count:', users.length);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
