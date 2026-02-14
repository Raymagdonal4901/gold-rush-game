
import mongoose from 'mongoose';
import DepositRequest from './models/DepositRequest';
import WithdrawalRequest from './models/WithdrawalRequest';
import User from './models/User';
import Transaction from './models/Transaction';

const approveAll = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Approve Deposits
        const pendingDeposits = await DepositRequest.find({ status: 'PENDING' });
        console.log(`Found ${pendingDeposits.length} pending deposits.`);

        for (const deposit of pendingDeposits) {
            deposit.status = 'APPROVED';
            await deposit.save();

            const user = await User.findById(deposit.userId);
            if (user) {
                user.balance += deposit.amount;
                await user.save();

                const tx = new Transaction({
                    userId: user._id,
                    type: 'DEPOSIT',
                    amount: deposit.amount,
                    status: 'COMPLETED',
                    description: 'ฝากเงินเข้าระบบ (Auto Approved)'
                });
                await tx.save();
                console.log(`Approved deposit ${deposit._id} for user ${user.username} (+${deposit.amount})`);
            }
        }

        // Approve Withdrawals
        const pendingWithdrawals = await WithdrawalRequest.find({ status: 'PENDING' });
        console.log(`Found ${pendingWithdrawals.length} pending withdrawals.`);

        for (const withdrawal of pendingWithdrawals) {
            withdrawal.status = 'APPROVED';
            await withdrawal.save();

            // Balance already deducted at request creation

            const tx = new Transaction({
                userId: withdrawal.userId,
                type: 'WITHDRAWAL',
                amount: withdrawal.amount,
                status: 'COMPLETED',
                description: 'ถอนเงินออกจากระบบ (Auto Approved)'
            });
            await tx.save();

            console.log(`Approved withdrawal ${withdrawal._id} (-${withdrawal.amount})`);
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
};

approveAll();
