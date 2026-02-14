import mongoose from 'mongoose';
import User from './models/User';
import WithdrawalRequest from './models/WithdrawalRequest';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        console.log('--- WITHDRAWAL REQUESTS FOR AMOUNT 200 ---');
        // Search for amount 200. The method might store it as number or string depending on model.
        const targetWithdrawals = await WithdrawalRequest.find({ amount: 200 }).lean();

        targetWithdrawals.forEach(w => {
            console.log(`ID: ${w._id}, UserID: ${w.userId}, Username: ${w.username}, Amount: ${w.amount}, Status: ${w.status}, CreatedAt: ${w.createdAt}`);
        });

        if (targetWithdrawals.length === 0) {
            console.log('No withdrawals found for amount 200');
            // List all usernames found in withdrawals to see if SEK10 is there
            const allWithdrawalUsers = await WithdrawalRequest.distinct('username');
            console.log('Usernames in all withdrawals:', allWithdrawalUsers);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
