import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Rig from '../models/Rig';
import WithdrawalRequest from '../models/WithdrawalRequest';
import DepositRequest from '../models/DepositRequest';
import ClaimRequest from '../models/ClaimRequest';
import SystemConfig from '../models/SystemConfig';
import Transaction from '../models/Transaction';

// Give Compensation (Add Balance)
export const adminGiveCompensation = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN DEBUG] adminGiveCompensation called body:', req.body);
        const { userId, amount, reason } = req.body;
        let user;
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
        }
        if (!user) {
            user = await User.findOne({ username: userId });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        user.balance += amountNum;
        await user.save();

        // Create Transaction Record
        const transaction = new Transaction({
            userId: user.id,
            type: 'COMPENSATION',
            amount: amountNum,
            status: 'COMPLETED',
            description: reason || 'Server Maintenance Compensation'
        });
        await transaction.save();

        res.json({ message: 'Compensation successful', newBalance: user.balance });
    } catch (error) {
        console.error('[ADMIN ERROR] adminGiveCompensation failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add Item to User
export const adminAddItem = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, itemId, amount } = req.body;
        let user;
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
        }
        if (!user) {
            user = await User.findOne({ username: userId });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const amountNum = Number(amount) || 1;

        const newItem = {
            id: uuidv4(),
            typeId: itemId,
            name: itemId,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: 30,
            isHandmade: false
        };

        for (let i = 0; i < amountNum; i++) {
            user.inventory.push({ ...newItem, id: uuidv4() });
        }

        await user.save();

        res.json({ message: 'Item added successfully', inventory: user.inventory });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get User Stats (Deposits/Withdrawals)
export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        // Total Deposits (APPROVED only)
        const depositStats = await DepositRequest.aggregate([
            { $match: { userId: userId, status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = depositStats.length > 0 ? depositStats[0].total : 0;

        // Total Withdrawals (APPROVED only)
        const withdrawalStats = await WithdrawalRequest.aggregate([
            { $match: { userId: userId, status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawals = withdrawalStats.length > 0 ? withdrawalStats[0].total : 0;

        res.json({
            totalDeposits,
            totalWithdrawals
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get All Users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find().select('-password -pin').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get All Rigs
export const getAllRigs = async (req: AuthRequest, res: Response) => {
    try {
        const rigs = await Rig.find().sort({ purchasedAt: -1 });
        res.json(rigs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get System Config (Real)
export const getSystemConfig = async (req: AuthRequest, res: Response) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({});
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update System Config
export const updateSystemConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { receivingQrCode, isMaintenanceMode } = req.body;

        // Upsert logic
        let config = await SystemConfig.findOne();
        if (!config) {
            config = new SystemConfig({});
        }

        if (receivingQrCode !== undefined) config.receivingQrCode = receivingQrCode;
        if (isMaintenanceMode !== undefined) config.isMaintenanceMode = isMaintenanceMode;

        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Pending Deposits
export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
    try {
        const deposits = await DepositRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Process Deposit (Approve/Reject)
export const processDepositRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const deposit = await DepositRequest.findById(id);
        if (!deposit) return res.status(404).json({ message: 'Deposit request not found' });
        if (deposit.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

        deposit.status = status;
        deposit.processedAt = new Date();
        await deposit.save();

        if (status === 'APPROVED') {
            const user = await User.findById(deposit.userId);
            if (user) {
                user.balance += deposit.amount;
                await user.save();
            }
        }

        res.json({ message: `Deposit ${status}`, deposit });
    } catch (error: any) {
        res.status(500).json({
            message: 'Server error processing deposit',
            error: error.message || error
        });
    }
};

// Get Pending Withdrawals
export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
    try {
        const withdrawals = await WithdrawalRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Process Withdrawal (Approve/Reject)
export const processWithdrawalRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const withdrawal = await WithdrawalRequest.findById(id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
        if (withdrawal.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

        withdrawal.status = status;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        if (status === 'REJECTED') {
            // Refund the user if rejected
            const user = await User.findById(withdrawal.userId);
            if (user) {
                user.balance += withdrawal.amount;
                await user.save();
            }
        }

        res.json({ message: `Withdrawal ${status}`, withdrawal });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Pending Claims
export const getPendingClaims = async (req: AuthRequest, res: Response) => {
    try {
        const claims = await ClaimRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
