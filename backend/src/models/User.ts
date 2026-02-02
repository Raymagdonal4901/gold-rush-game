import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    password: string;
    pin?: string;
    balance: number;
    energy: number;
    role: string;
    inventory: any[]; // Array of AccessoryItem
    weeklyStats: any; // Object for weekly progress
    claimedQuests: any[]; // Array of strings (Quest IDs)
    masteryPoints: number;
    lastQuestReset: Date;
    createdAt: Date;
    lastEnergyUpdate: Date;
}
const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String }, // 6-digit PIN
    balance: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    role: { type: String, default: 'USER' },
    inventory: { type: [], default: [] }, // Simplified for Mixed array
    weeklyStats: { type: Object, default: {} },
    claimedQuests: { type: [], default: [] },
    masteryPoints: { type: Number, default: 0 },
    lastQuestReset: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    lastEnergyUpdate: { type: Date, default: Date.now }
});
export default mongoose.model<IUser>('User', UserSchema);