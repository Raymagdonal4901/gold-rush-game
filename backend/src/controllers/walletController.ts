import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Withdrawal from '../models/Withdrawal';
import Transaction from '../models/Transaction';
import { WITHDRAWAL_FEE_PERCENT, CURRENCY } from '../constants';
import mongoose from 'mongoose';
import SystemConfig from '../models/SystemConfig';

export const requestWithdraw = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const config = await SystemConfig.findOne();
        if (config && config.isWithdrawalEnabled === false) {
            return res.status(403).json({
                message: 'การถอนเงินปิดปรับปรุงชั่วคราว โปรดติดตามประกาศจากทางแอดมิน (Withdrawals are temporarily disabled)'
            });
        }

        const { amount, bankDetails } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!amount || amount < 100) {
            return res.status(400).json({ message: 'Minimum withdrawal is 100 THB' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
            return res.status(400).json({ message: 'Incomplete bank details' });
        }

        // 1. Deduct balance immediately
        user.balance -= amount;
        await user.save({ session });

        // 2. Calculate 5% withdrawal fee (House Revenue)
        const withdrawalFee = Math.floor(amount * WITHDRAWAL_FEE_PERCENT * 100) / 100;

        // 3. Create Withdrawal record
        const withdrawal = await Withdrawal.create([
            {
                userId: user._id,
                amount,
                bankDetails,
                status: 'PENDING'
            }
        ], { session });

        // 4. Create Transaction log for withdrawal and fee
        await Transaction.create([
            {
                userId: user._id,
                type: 'WITHDRAWAL',
                amount: amount,
                status: 'PENDING',
                description: `Withdrawal request to ${bankDetails.bankName}`,
                refId: withdrawal[0]._id
            },
            {
                userId: user._id,
                type: 'WITHDRAW_FEE',
                amount: withdrawalFee,
                status: 'COMPLETED',
                description: `Withdrawal fee (5%) for amount: ${amount} THB`,
                refId: withdrawal[0]._id
            }
        ], { session });

        await session.commitTransaction();
        res.status(201).json({ message: 'Withdrawal request submitted. Waiting for approval.', balance: user.balance });
    } catch (error) {
        await session.abortTransaction();
        console.error('[WITHDRAW_REQUEST_ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};

export const getWalletHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('[GET_WALLET_HISTORY_ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const adminApproveWithdraw = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { withdrawalId, action, adminNote } = req.body;

        const withdrawal = await Withdrawal.findById(withdrawalId);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        if (withdrawal.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        const transaction = await Transaction.findOne({ refId: withdrawalId });

        if (action === 'APPROVE') {
            withdrawal.status = 'APPROVED';
            if (adminNote) withdrawal.adminNote = adminNote;
            await withdrawal.save({ session });

            if (transaction) {
                transaction.status = 'COMPLETED';
                await transaction.save({ session });
            }
        } else if (action === 'REJECT') {
            withdrawal.status = 'REJECTED';
            withdrawal.adminNote = adminNote || 'Rejected by admin';
            await withdrawal.save({ session });

            // Refund balance
            const user = await User.findById(withdrawal.userId);
            if (user) {
                user.balance += withdrawal.amount;
                await user.save({ session });
            }

            if (transaction) {
                transaction.status = 'FAILED';
                await transaction.save({ session });
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await session.commitTransaction();
        res.json({ message: `Withdrawal ${action} successfully`, status: withdrawal.status });
    } catch (error) {
        await session.abortTransaction();
        console.error('[ADMIN_APPROVE_WITHDRAW_ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};
