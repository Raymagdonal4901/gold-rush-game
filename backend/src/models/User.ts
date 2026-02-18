import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    pin?: string;
    balance: number;
    bankQrCode?: string; // Base64 of user's receiving QR code
    energy: number;
    role: string;
    inventory: any[]; // Array of AccessoryItem
    weeklyStats: any; // Object for weekly progress
    claimedQuests: any[]; // Array of strings (Quest IDs)
    claimedAchievements: string[]; // Array of strings (Achievement IDs)
    masteryPoints: number;
    claimedRanks: string[];
    notifications: any[];
    materials: any; // Added materials map
    stats: any; // Added stats object
    checkInStreak: number;
    lastCheckIn?: Date;
    lastQuestReset: Date;
    activeExpedition?: any; // Added activeExpedition
    craftingQueue: any[]; // Added craftingQueue
    unlockedSlots: number;
    lastLuckyDraw?: number;
    overclockExpiresAt?: Date; // Overclock boost expiration
    overclockRemainingMs: number; // Legacy support: Used for paused time in old system
    isOverclockActive: boolean; // Whether overclock is currently running
    overclockMultiplier: number; // Yield multiplier during overclock
    walletAddress?: string; // BSC Wallet Address for USDT

    // Referral System
    referralCode?: string; // Their own code (Short ID or Username)
    referrerId?: mongoose.Types.ObjectId; // The person who invited this user
    referralStats: {
        totalInvited: number;
        totalEarned: number;
    };
    isFirstDepositPaid: boolean;

    createdAt: Date;
    lastEnergyUpdate: Date;
    totalDailyIncome?: number;
    miningSlots: number;
    warehouseCapacity: number;
    lastClaimedAt?: Date;
    isBanned: boolean;
    avatarUrl?: string; // Base64 or URL of user avatar
    purchasedRigIds: number[]; // Track lifetime purchases for one-time rigs
    accountLevel: number;
    maxEnergy?: number;
    marketFee?: number;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    pin: { type: String, select: false }, // 6-digit PIN
    balance: { type: Number, default: 0 },
    bankQrCode: { type: String },
    walletAddress: { type: String, unique: true, sparse: true },
    energy: { type: Number, default: 100 },
    role: { type: String, default: 'USER' },
    unlockedSlots: { type: Number, default: 3 }, // Default 3 slots (1-3)
    inventory: { type: [], default: [] }, // Simplified for Mixed array
    weeklyStats: { type: Object, default: {} },
    claimedQuests: { type: [], default: [] },
    claimedAchievements: { type: [String], default: [] },
    masteryPoints: { type: Number, default: 0 },
    claimedRanks: { type: [String], default: [] },
    notifications: { type: [Object], default: [] },
    materials: { type: Object, default: {} },
    stats: { type: Object, default: {} },
    checkInStreak: { type: Number, default: 0 },
    lastCheckIn: { type: Date },
    lastLuckyDraw: { type: Number, default: 0 },
    overclockExpiresAt: { type: Date },
    overclockRemainingMs: { type: Number, default: 0 },
    isOverclockActive: { type: Boolean, default: false },
    overclockMultiplier: { type: Number, default: 1.5 },
    lastQuestReset: { type: Date, default: Date.now },
    activeExpedition: { type: Object, default: null }, // Added for persistence
    craftingQueue: { type: [], default: [] },

    // Referral System
    referralCode: { type: String, unique: true, sparse: true },
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referralStats: {
        totalInvited: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
    },
    isFirstDepositPaid: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    lastEnergyUpdate: { type: Date, default: Date.now },
    totalDailyIncome: { type: Number, default: 0 },
    lastClaimedAt: { type: Date },
    miningSlots: { type: Number, default: 3 },
    warehouseCapacity: { type: Number, default: 3 },
    isBanned: { type: Boolean, default: false },
    avatarUrl: { type: String },
    purchasedRigIds: { type: [Number], default: [] },
    accountLevel: { type: Number, default: 1 },
    maxEnergy: { type: Number, default: 100 },
    marketFee: { type: Number, default: 10.0 }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);