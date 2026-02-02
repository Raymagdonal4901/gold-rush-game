import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Rig from '../models/Rig';
// Register
export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        // ตรวจสอบว่า username ซ้ำหรือไม่
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // สร้าง User ใหม่
        const user = await User.create({
            username,
            password: hashedPassword
        });
        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                balance: user.balance,
                energy: user.energy
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password, pin } = req.body;
        console.log(`[LOGIN DEBUG] Attempting login for: ${username}`);
        console.log(`[LOGIN DEBUG] Provided PIN: ${pin}`);

        // หา User
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[LOGIN FAIL] User not found: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`[LOGIN DEBUG] User found: ${user.username}, Role: ${user.role}`);
        console.log(`[LOGIN DEBUG] Stored Hash: ${user.password.substring(0, 10)}...`);

        // ตรวจสอบ password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN DEBUG] Password match result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // ตรวจสอบ PIN (ถ้ามีการส่งมา)
        /* DISABLED BY USER REQUEST
        if (pin) {  // Changed from req.body.pin to pin from destructuring
            if (!user.pin) {
                console.log(`[LOGIN WARN] User has no PIN set in DB but provided one.`);
            } else {
                const isPinMatch = await bcrypt.compare(pin, user.pin);
                console.log(`[LOGIN DEBUG] PIN match result: ${isPinMatch}`);
                if (!isPinMatch) {
                    return res.status(401).json({ message: 'Invalid PIN' });
                }
            }
        }
        */
        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        const updatedEnergy = await calculateAndSyncEnergy(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                balance: user.balance,
                energy: updatedEnergy,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedEnergy = await calculateAndSyncEnergy(user);
        res.json({
            id: user._id,
            username: user.username,
            balance: user.balance,
            energy: updatedEnergy,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const calculateAndSyncEnergy = async (user: any) => {
    const now = new Date();
    const lastUpdate = user.lastEnergyUpdate || user.createdAt || now;
    const elapsedHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    // Constant drain: 100% in 24 hours (4.166% per hour)
    const drain = elapsedHours * 4.166666666666667;
    const currentEnergy = Math.max(0, Math.min(100, (user.energy ?? 100) - drain));

    user.energy = currentEnergy;
    user.lastEnergyUpdate = now;
    await user.save();
    return currentEnergy;
};

export const refillEnergy = async (req: any, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentEnergy = user.energy ?? 100;
        const needed = Math.max(0, 100 - currentEnergy);

        const rigs = await Rig.find({ ownerId: userId });
        let totalDailyCost = 0;
        rigs.forEach(r => {
            totalDailyCost += r.energyCostPerDay || 0;
        });

        // 0.02 Baht per 1%
        let cost = (needed / 100) * totalDailyCost;
        if (cost < 1.0) { // MIN_REFILL_FEE
            cost = 1.0;
        }

        if (user.balance < cost) {
            return res.status(400).json({ message: 'ยอดเงินในวอลเลทไม่เพียงพอสำหรับเติมพลังงาน' });
        }

        user.balance -= cost;
        user.energy = 100;
        // Buffer: Set last update 5 seconds in future so it stays 100% for a bit
        user.lastEnergyUpdate = new Date(Date.now() + 5000);
        await user.save();

        res.json({
            message: 'Refill successful',
            cost,
            balance: user.balance,
            energy: user.energy
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const seedAdmin = async (req: Request, res: Response) => {
    try {
        // New credentials
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'bleach';
        const ADMIN_PIN = '4901';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
        const hashedPin = await bcrypt.hash(ADMIN_PIN, salt);

        // Delete and recreate to ensure clean state
        await User.deleteOne({ username: ADMIN_USERNAME });

        const admin = await User.create({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            pin: hashedPin,
            role: 'ADMIN',
            balance: 999999,
            energy: 100
        });

        res.json({
            message: 'Admin created',
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            pin: ADMIN_PIN
        });
    } catch (error) {
        res.status(500).json({ message: 'Seed error', error });
    }
};