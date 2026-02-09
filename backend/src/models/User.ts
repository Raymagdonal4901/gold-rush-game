import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    password: string;
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
    walletAddress?: string; // BSC Wallet Address for USDT
    createdAt: Date;
    lastEnergyUpdate: Date;
}
const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String }, // 6-digit PIN
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
    lastQuestReset: { type: Date, default: Date.now },
    activeExpedition: { type: Object, default: null }, // Added for persistence
    craftingQueue: { type: [], default: [] },
    createdAt: { type: Date, default: Date.now },
    lastEnergyUpdate: { type: Date, default: Date.now }
});
export default mongoose.model<IUser>('User', UserSchema);