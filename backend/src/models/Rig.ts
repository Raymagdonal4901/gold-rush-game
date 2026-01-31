import mongoose, { Schema, Document } from 'mongoose';

export interface IRig extends Document {
    ownerId: string;
    name: string;
    image: string; // Add image path/url
    investment: number;
    dailyProfit: number;
    purchaseDate: Date;
    expiresAt: Date;
    rarity: string;
    level: number;
    slots: string[]; // IDs of equipped items/gloves
    status: 'ACTIVE' | 'EXPIRED' | 'MAINTENANCE';
}

const RigSchema = new Schema<IRig>({
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    investment: { type: Number, required: true },
    dailyProfit: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    rarity: { type: String, default: 'COMMON' },
    level: { type: Number, default: 1 },
    slots: { type: [String], default: [] },
    status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'EXPIRED', 'MAINTENANCE'] }
});

export default mongoose.model<IRig>('Rig', RigSchema);
