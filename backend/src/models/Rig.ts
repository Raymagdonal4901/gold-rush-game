import mongoose, { Schema, Document } from 'mongoose';
export interface IRig extends Document {
    ownerId: string;
    name: string;
    investment: number;
    dailyProfit: number;
    bonusProfit: number;
    purchaseDate: Date;
    expiresAt: Date;
    slots: any[];
    rarity: string;
    repairCost: number;
    energyCostPerDay: number;
    energy: number;
    lastEnergyUpdate: Date;
    lastCollectionAt?: Date;
    lastClaimAt?: Date;
}
const RigSchema = new Schema<IRig>({
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    investment: { type: Number, required: true },
    dailyProfit: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    slots: { type: [String], default: [null, null, null, null, null] },
    rarity: { type: String, default: 'COMMON' },
    repairCost: { type: Number, default: 0 },
    energyCostPerDay: { type: Number, default: 0 },
    bonusProfit: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    lastEnergyUpdate: { type: Date, default: Date.now },
    lastCollectionAt: { type: Date },
    lastClaimAt: { type: Date }
});
export default mongoose.model<IRig>('Rig', RigSchema);