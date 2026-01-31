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
