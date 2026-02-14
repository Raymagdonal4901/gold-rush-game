import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Rig from '../models/Rig';
import SystemConfig from '../models/SystemConfig';

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
        const { username, password, referralCode } = req.body;
        // ตรวจสอบว่า username ซ้ำหรือไม่
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // --- REFERRAL LOGIC: Find Referrer ---
        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({
                $or: [{ username: referralCode.trim() }, { referralCode: referralCode.trim() }]
            });
            if (referrer) {
                referredBy = referrer._id;
                console.log(`[REFERRAL] New user ${username} referred by ${referrer.username}`);
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Define Welcome Pack Item if referred
        const inventory: any[] = [];
        const notifications = [];

        if (referredBy) {
            // Reward: Standard Safety Helmet (Manual Claim)
            const welcomeItem = {
                typeId: 'chest_key',
                name: { th: 'กุญแจหีบสมบัติ', en: 'Chest Key' },
                rarity: 'EPIC',
                amount: 1
            };

            notifications.push({
                id: `welcome_${Date.now()}`,
                userId: '', // Shared subdoc logic
                title: 'ยินดีต้อนรับสู่เหมือง Gold Rush!',
                message: 'คุณได้รับ กุญแจหีบสมบัติ จากการลงทะเบียนผ่านรหัสแนะนำ! กรุณากดปุ่มเพื่อรับอุปกรณ์ของคุณ',
                type: 'REWARD',
                read: false,
                timestamp: Date.now(),
                hasReward: true,
                rewardType: 'ITEM',
                rewardValue: welcomeItem,
                isClaimed: false
            });
        }

        // สร้าง User ใหม่
        const user = await User.create({
            username,
            password: hashedPassword,
            referralCode: username, // Set their own referral code as their username
            referredBy,
            inventory: [] as any[],
            notifications,
            balance: 0 // New users always start at 0.00 THB
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
                energy: user.energy,
                materials: user.materials || {},
                stats: user.stats || {},
                inventory: user.inventory || [],
                notifications: user.notifications || [],
                role: user.role,
                unlockedSlots: user.unlockedSlots || 3,
                referralCode: user.referralCode,
                isOverclockActive: user.isOverclockActive || false,
                overclockRemainingMs: user.overclockRemainingMs || 0,
                overclockExpiresAt: user.overclockExpiresAt || null
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
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
                isOverclockActive: user.isOverclockActive || false,
                overclockRemainingMs: user.overclockRemainingMs || 0,
                overclockExpiresAt: user.overclockExpiresAt || null
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
        drainRate *= 2;
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

        // --- 1. OVERCLOCK REFILL (50 THB -> 100% Energy + 48h x2 Boost) ---
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
            const durationMs = 48 * 60 * 60 * 1000; // 48 Hours
            user.isOverclockActive = true;
            user.overclockExpiresAt = new Date(Date.now() + durationMs);
            user.overclockRemainingMs = durationMs;
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
        let admin = await User.findOne({ username: ADMIN_USERNAME });
        if (admin) {
            admin.password = hashedPassword;
            admin.pin = hashedPin;
            admin.role = 'ADMIN';
            await admin.save();
        } else {
            admin = await User.create({
                username: ADMIN_USERNAME,
                password: hashedPassword,
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