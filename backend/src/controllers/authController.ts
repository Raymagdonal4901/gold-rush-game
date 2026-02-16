import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import Rig from '../models/Rig';
import SystemConfig from '../models/SystemConfig';
import { ENERGY_CONFIG } from '../constants';

// Public System Config (Maintenance only)
export const getPublicConfig = async (req: Request, res: Response) => {
    try {
        const config = await SystemConfig.findOne();
        res.json({
            isMaintenanceMode: config ? config.isMaintenanceMode : false,
            receivingQrCode: config ? config.receivingQrCode : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Public Stats for Landing Page
export const getLandingStats = async (req: Request, res: Response) => {
    try {
        const usersCount = await User.countDocuments();
        const activeRigs = await Rig.countDocuments();

        // Match Admin Dashboard "Total Investment" logic (Sum of rig investments only)
        const rigInvestments = await Rig.aggregate([
            { $group: { _id: null, total: { $sum: "$investment" } } }
        ]);
        const marketCap = rigInvestments.length > 0 ? rigInvestments[0].total : 0;

        res.json({
            usersCount,
            activeRigs,
            marketCap: Math.floor(marketCap)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Register
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, referralCode } = req.body;
        // ตรวจสอบว่า username หรือ email ซ้ำหรือไม่
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        // --- REFERRAL LOGIC: Find Referrer ---
        let referrerId = null;
        if (referralCode) {
            const trimmedRef = referralCode.trim();
            // Prevent self-referral
            if (trimmedRef !== username) {
                const referrer = await User.findOne({
                    $or: [{ username: trimmedRef }, { referralCode: trimmedRef }]
                });
                if (referrer) {
                    referrerId = referrer._id;
                    // Increment Referrer's totalInvited stat
                    if (!referrer.referralStats) {
                        referrer.referralStats = { totalInvited: 0, totalEarned: 0 };
                    }
                    referrer.referralStats.totalInvited += 1;
                    referrer.markModified('referralStats');
                    await referrer.save();

                    console.log(`[REFERRAL] New user ${username} referred by ${referrer.username}`);
                }
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Initialize empty inventory and notifications
        const inventory: any[] = [];
        const notifications: any[] = [];

        // Generate short Referral Code (Short ID)
        const generatedRefCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // สร้าง User ใหม่
        const user = await User.create({
            username,
            email,
            passwordHash: hashedPassword,
            verificationToken,
            verificationTokenExpires,
            isEmailVerified: false,
            referralCode: generatedRefCode,
            referrerId,
            inventory: [] as any[],
            notifications,
            balance: 0,
            referralStats: { totalInvited: 0, totalEarned: 0 }
        });

        // Mock Email Sending
        console.log('--- MOCK EMAIL ---');
        console.log(`To: ${email}`);
        console.log(`Subject: Verify your email`);
        console.log(`Link: http://localhost:3000/verify?token=${verificationToken}`);
        console.log('------------------');

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            requiresVerification: true
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN DEBUG] Attempting login for: ${email}`);

        // หา User ตาม email (ตามโจทย์ระบุให้รับ email)
        const user = await User.findOne({ email }).select('+passwordHash +verificationToken +verificationTokenExpires');

        // --- SUPER ADMIN AUTO-PROMOTION ---
        const ADMIN_EMAILS = ['raymagdonal4901@gmail.com', 'atipat.csi@gmail.com'];
        if (user && ADMIN_EMAILS.includes(email.toLowerCase())) {
            if (user.role !== 'ADMIN' || !user.isEmailVerified) {
                user.role = 'ADMIN';
                user.isEmailVerified = true;
                user.verificationToken = undefined;
                user.verificationTokenExpires = undefined;
                await user.save();
                console.log(`[AUTO-ADMIN] Promoted and verified ${email}`);
            }
        }
        if (!user) {
            console.log(`[LOGIN FAIL] User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // ตรวจสอบการยืนยันอีเมล
        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify email' });
        }

        console.log(`[LOGIN DEBUG] User found: ${user.username}, Role: ${user.role}`);
        console.log(`[LOGIN DEBUG] Stored Hash: ${user.passwordHash.substring(0, 10)}...`);

        // ตรวจสอบ password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log(`[LOGIN DEBUG] Password match result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        const updatedEnergy = await calculateAndSyncEnergy(user);

        // Normalize Capacity Fields (Repair for legacy users)
        const maxCapacity = Math.max(user.warehouseCapacity || 3, user.unlockedSlots || 3, user.miningSlots || 3);
        const needsRepair = user.warehouseCapacity !== maxCapacity || user.miningSlots !== maxCapacity;

        if (needsRepair) {
            user.warehouseCapacity = maxCapacity;
            user.miningSlots = maxCapacity;
            await user.save();
            console.log(`[REPAIR] Syncing capacity for ${user.username}: ${maxCapacity}`);
        }

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                energy: updatedEnergy,
                role: user.role,
                materials: user.materials || {},
                stats: user.stats || {},
                inventory: user.inventory || [],
                masteryPoints: user.masteryPoints || 0,
                claimedQuests: user.claimedQuests || [],
                claimedAchievements: user.claimedAchievements || [],
                claimedRanks: user.claimedRanks || [],
                checkInStreak: user.checkInStreak || 0,
                lastCheckIn: user.lastCheckIn,
                bankQrCode: user.bankQrCode,
                notifications: user.notifications || [],
                activeExpedition: user.activeExpedition,
                unlockedSlots: user.unlockedSlots || 3,
                miningSlots: maxCapacity,
                warehouseCapacity: maxCapacity,
                isOverclockActive: user.isOverclockActive || false,
                overclockRemainingMs: user.overclockRemainingMs || 0,
                overclockExpiresAt: user.overclockExpiresAt || null
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        }).select('+verificationToken +verificationTokenExpires');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedEnergy = await calculateAndSyncEnergy(user);
        // Normalize Capacity Fields (Repair for legacy users)
        const maxCapacity = Math.max(user.warehouseCapacity || 3, user.unlockedSlots || 3, user.miningSlots || 3);
        const needsRepair = user.warehouseCapacity !== maxCapacity || user.miningSlots !== maxCapacity;

        if (needsRepair) {
            user.warehouseCapacity = maxCapacity;
            user.miningSlots = maxCapacity;
            await user.save();
            console.log(`[REPAIR] Syncing capacity for ${user.username}: ${maxCapacity}`);
        }

        res.json({
            id: user._id,
            username: user.username,
            balance: user.balance,
            energy: updatedEnergy,
            role: user.role,
            materials: user.materials || {},
            stats: user.stats || {},
            inventory: user.inventory || [],
            masteryPoints: user.masteryPoints || 0,
            claimedQuests: user.claimedQuests || [],
            claimedRanks: user.claimedRanks || [],
            checkInStreak: user.checkInStreak || 0,
            lastCheckIn: user.lastCheckIn,
            bankQrCode: user.bankQrCode,
            notifications: user.notifications || [],
            activeExpedition: user.activeExpedition,
            unlockedSlots: user.unlockedSlots || 3,
            miningSlots: maxCapacity,
            warehouseCapacity: maxCapacity,
            isOverclockActive: user.isOverclockActive || false,
            overclockRemainingMs: user.overclockRemainingMs || 0,
            overclockExpiresAt: user.overclockExpiresAt || null
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
    let drainRate = 4.166666666666667;
    if (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > now.getTime()) {
        drainRate *= (ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5);
    }
    const drain = elapsedHours * drainRate;
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

        const { type } = req.body;
        const currentEnergy = user.energy ?? 100;

        let costThb = 0;
        let isOverclock = false;

        // --- 1. OVERCLOCK REFILL (50 THB -> 100% Energy + 24h 1.5x Boost) ---
        if (type === 'overclock') {
            costThb = 50; // Fixed 50 THB price
            isOverclock = true;
        }
        // --- 2. STANDARD REFILL (2 THB/100%) ---
        else {
            const needed = Math.max(0, 100 - currentEnergy);
            // Flat rate: 0.02 Baht per 1% (matching ENERGY_CONFIG.COST_PER_UNIT in frontend)
            const COST_PER_UNIT_THB = 0.02;
            const MIN_REFILL_FEE_THB = 2.0;

            costThb = needed * COST_PER_UNIT_THB;
            if (costThb < MIN_REFILL_FEE_THB) {
                costThb = MIN_REFILL_FEE_THB;
            }
        }

        const EXCHANGE_RATE = 1;
        const cost = costThb / EXCHANGE_RATE; // Convert to USD for balance deduction

        if (user.balance < cost) {
            return res.status(400).json({ success: false, message: 'ยอดเงินในวอลเลทไม่เพียงพอสำหรับเติมพลังงาน' });
        }

        user.balance -= cost;
        user.energy = 100;
        // Buffer: Set last update 5 seconds in future so it stays 100% for a bit
        user.lastEnergyUpdate = new Date(Date.now() + 5000);

        // Apply Overclock if purchased
        if (isOverclock) {
            const extensionMs = (ENERGY_CONFIG.OVERCLOCK_DURATION_HOURS || 24) * 60 * 60 * 1000;
            const currentExpires = (user.overclockExpiresAt && user.overclockExpiresAt.getTime() > Date.now())
                ? user.overclockExpiresAt.getTime()
                : Date.now();

            user.isOverclockActive = true;
            user.overclockExpiresAt = new Date(currentExpires + extensionMs);
            user.overclockRemainingMs = (user.overclockExpiresAt.getTime() - Date.now());
            console.log(`[OVERCLOCK_EXTEND] User ${user.username} | New Expiry: ${user.overclockExpiresAt}`);
        }

        await user.save();

        res.json({
            success: true,
            message: 'Refill successful',
            cost,
            balance: user.balance,
            energy: user.energy
        });
    } catch (error) {
        console.error('[REFILL_ENERGY_ERROR]', error);
        res.status(500).json({ success: false, message: 'Server error', error: (error as any).message });
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

        // Update or create admin
        let admin = await User.findOne({ username: ADMIN_USERNAME }).select('+passwordHash');
        if (admin) {
            admin.passwordHash = hashedPassword;
            admin.pin = hashedPin;
            admin.role = 'ADMIN';
            await admin.save();
        } else {
            admin = await User.create({
                username: ADMIN_USERNAME,
                email: 'admin@goldrush.com',
                passwordHash: hashedPassword,
                pin: hashedPin,
                role: 'ADMIN',
                balance: 999999,
                energy: 100
            });
        }

        res.json({
            message: 'Admin synchronized',
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            pin: ADMIN_PIN,
            role: 'ADMIN'
        });
    } catch (error) {
        res.status(500).json({ message: 'Seed error', error });
    }
};

export const updateBankQr = async (req: any, res: Response) => {
    try {
        const { bankQrCode } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.bankQrCode = bankQrCode;
        await user.save();

        res.json({ message: 'Bank QR updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};