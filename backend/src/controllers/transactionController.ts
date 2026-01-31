import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import DepositRequest, { IDepositRequest } from '../models/DepositRequest';
import User from '../models/User';

// Create Deposit Request (User)
export const createDepositRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, slipImage } = req.body;
        const userId = req.userId;

        if (!amount || !slipImage) {
            return res.status(400).json({ message: 'Amount and Slip Image are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const deposit = await DepositRequest.create({
            userId,
            username: user.username,
            amount,
            slipImage,
            status: 'PENDING'
        });

        res.status(201).json(deposit);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get My Deposit History (User) - Optional for now
export const getMyDeposits = async (req: AuthRequest, res: Response) => {
    try {
        const deposits = await DepositRequest.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
