import mongoose, { Schema, Document } from 'mongoose';
export interface IRig extends Document {
    ownerId: string;
    name: string;
    investment: number;
    dailyProfit: number;
    purchaseDate: Date;
    expiresAt: Date;
}
const RigSchema = new Schema<IRig>({
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    investment: { type: Number, required: true },
    dailyProfit: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});
export default mongoose.model<IRig>('Rig', RigSchema);