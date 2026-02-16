import mongoose, { Schema, Document } from 'mongoose';
export interface IRig extends Document {
    ownerId: string;
    name: any; // Can be string or { th: string, en: string }
    investment: number;
    dailyProfit: number;
    bonusProfit: number;
    purchaseDate: Date;
    expiresAt: Date;
    slots: any[];
    rarity: string;
    starLevel?: number;
    repairCost: number;
    energyCostPerDay: number;
    energy: number;
    lastEnergyUpdate: Date;
    lastCollectionAt?: Date;
    lastClaimAt?: Date;
    lastGiftAt?: Date;
    isDead?: boolean;
    lastRepairAt?: Date;
    // Dynamic Volatility Fields
    tierId?: number;
    currentDurability?: number;
    status?: 'ACTIVE' | 'BROKEN';
    totalMined?: number;
}
const RigSchema = new Schema<IRig>({
    ownerId: { type: String, required: true },
    name: { type: Schema.Types.Mixed, required: true },
    investment: { type: Number, required: true },
    dailyProfit: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    slots: { type: [String], default: [null, null, null, null, null] },
    rarity: { type: String, default: 'COMMON' },
    starLevel: { type: Number, default: 0 },
    repairCost: { type: Number, default: 0 },
    energyCostPerDay: { type: Number, default: 0 },
    bonusProfit: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    lastEnergyUpdate: { type: Date, default: Date.now },
    lastCollectionAt: { type: Date },
    lastClaimAt: { type: Date },
    lastGiftAt: { type: Date },
    isDead: { type: Boolean, default: false },
    lastRepairAt: { type: Date },
    // Dynamic Volatility Fields
    tierId: { type: Number },
    currentDurability: { type: Number, default: 3000 },
    status: { type: String, enum: ['ACTIVE', 'BROKEN'], default: 'ACTIVE' },
    totalMined: { type: Number, default: 0 }
});
export default mongoose.model<IRig>('Rig', RigSchema);