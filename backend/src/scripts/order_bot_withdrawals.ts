import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Withdrawal from '../models/Withdrawal';
import Transaction from '../models/Transaction';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');

async function orderBotWithdrawals() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB at', MONGODB_URI);

        const bots = await User.find({ username: { $regex: /^Bot_/i } });
        console.log(`Found ${bots.length} bots to process.`);

        const withdrawalAmount = 200;
        const feePercent = 0.05;
        const withdrawalFee = withdrawalAmount * feePercent;

        for (const bot of bots) {
            console.log(`Processing bot: ${bot.username} (Level ${bot.accountLevel}, Balance: ${bot.balance} THB)`);

            // 1. Ensure Sufficient Balance (Top up if needed)
            if (bot.balance < withdrawalAmount) {
                console.log(`  - Low balance (${bot.balance} THB). Topping up to 500 THB...`);
                bot.balance = 500;
                await bot.save();
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // 2. Deduct balance
                bot.balance -= withdrawalAmount;
                await bot.save({ session });

                // 3. Create Withdrawal Record
                const withdrawal = await Withdrawal.create([{
                    userId: bot._id,
                    amount: withdrawalAmount,
                    status: 'PENDING',
                    bankDetails: {
                        bankName: 'BOT_AUTO_BANK',
                        accountNumber: '999-999999-9',
                        accountName: `BOT_${bot.username}_AUTO`
                    }
                }], { session });

                // 4. Create Transaction Logs
                await Transaction.create([
                    {
                        userId: bot._id,
                        type: 'WITHDRAWAL',
                        amount: withdrawalAmount,
                        status: 'PENDING',
                        description: `Bot Auto Withdrawal (Script Managed)`,
                        refId: withdrawal[0]._id
                    },
                    {
                        userId: bot._id,
                        type: 'WITHDRAW_FEE',
                        amount: withdrawalFee,
                        status: 'COMPLETED',
                        description: `Withdrawal fee (5%) for amount: ${withdrawalAmount} THB`,
                        refId: withdrawal[0]._id
                    }
                ], { session });

                await session.commitTransaction();
                console.log(`  - Successfully ordered 200 THB withdrawal for ${bot.username}. New balance: ${bot.balance} THB`);
            } catch (err) {
                await session.abortTransaction();
                console.error(`  - Failed to process withdrawal for ${bot.username}:`, err);
            } finally {
                session.endSession();
            }
        }

        console.log('Finished processing all bots.');
        process.exit(0);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

orderBotWithdrawals();
