import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Rig from '../models/Rig';
import WithdrawalRequest from '../models/WithdrawalRequest';

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

import SystemConfig from '../models/SystemConfig';

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

import DepositRequest from '../models/DepositRequest';

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

import ClaimRequest from '../models/ClaimRequest';

// Get Pending Claims
export const getPendingClaims = async (req: AuthRequest, res: Response) => {
    try {
        const claims = await ClaimRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
