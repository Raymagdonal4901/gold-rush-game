import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Rig from '../models/Rig';

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

// Get System Config (Stub)
export const getSystemConfig = async (req: AuthRequest, res: Response) => {
    try {
        // In a real app, this would be fetched from a Config model
        res.json({
            receivingQrCode: null,
            isMaintenanceMode: false
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Stub endpoints for dashboard stats
export const getPendingClaims = async (req: AuthRequest, res: Response) => {
    res.json([]);
};

export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
    res.json([]);
};

export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
    res.json([]);
};
