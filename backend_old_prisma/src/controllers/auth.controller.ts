// Authentication Controller

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 12;

// ============================================
// VALIDATION SCHEMAS
// ============================================

const RegisterSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(6).max(128),
    email: z.string().email().optional(),
    referralCode: z.string().optional(),
});

const LoginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

const VerifyPinSchema = z.object({
    pin: z.string().length(4).regex(/^\d{4}$/),
});

const SetPinSchema = z.object({
    pin: z.string().length(4).regex(/^\d{4}$/),
});

// ============================================
// REGISTER
// ============================================

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = RegisterSchema.parse(req.body);

        // Check if username exists
        const existing = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existing) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Find upline if referral code provided
        let uplineId: string | null = null;
        if (data.referralCode) {
            const upline = await prisma.user.findUnique({
                where: { referralCode: data.referralCode },
            });
            if (upline) {
                uplineId = upline.id;
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create user with wallet
        const user = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                uplineId,
                wallet: {
                    create: {
                        cashBalance: 0,
                        coinBalance: 0,
                        energy: 100,
                    },
                },
            },
            include: { wallet: true },
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                referralCode: user.referralCode,
                wallet: user.wallet,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};

// ============================================
// LOGIN
// ============================================

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = LoginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { username: data.username },
            include: { wallet: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.isBanned) {
            return res.status(403).json({ error: 'Account banned', reason: user.banReason });
        }

        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                referralCode: user.referralCode,
                wallet: user.wallet,
                unlockedSlots: user.unlockedSlots,
                vipExp: user.vipExp,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
};

// ============================================
// VERIFY PIN
// ============================================

export const verifyPin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = VerifyPinSchema.parse(req.body);
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.pinHash) {
            return res.status(400).json({ error: 'PIN not set' });
        }

        const isValid = await bcrypt.compare(data.pin, user.pinHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        res.json({ success: true, verified: true });
    } catch (error) {
        next(error);
    }
};

// ============================================
// SET PIN
// ============================================

export const setPin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = SetPinSchema.parse(req.body);
        const userId = (req as any).user.id;

        const pinHash = await bcrypt.hash(data.pin, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { pinHash },
        });

        res.json({ success: true, message: 'PIN set successfully' });
    } catch (error) {
        next(error);
    }
};

// ============================================
// GET CURRENT USER
// ============================================

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                machines: true,
                inventory: { where: { quantity: { gt: 0 } } },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            referralCode: user.referralCode,
            wallet: user.wallet,
            machines: user.machines,
            inventory: user.inventory,
            unlockedSlots: user.unlockedSlots,
            vipExp: user.vipExp,
            miningPoints: user.miningPoints,
            checkInDay: user.checkInDay,
            lastCheckIn: user.lastCheckIn,
        });
    } catch (error) {
        next(error);
    }
};
