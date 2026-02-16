import mongoose, { Schema, Document } from 'mongoose';

export interface IMinesGame extends Document {
    userId: mongoose.Types.ObjectId;
    betAmount: number;
    minesCount: number;
    status: 'ACTIVE' | 'CASHED_OUT' | 'EXPLODED';
    mines: number[]; // Array of indices (0-24), hidden by select: false
    revealed: number[]; // Array of indices user has clicked
    currentMultiplier: number;
    potentialWin: number;
    createdAt: Date;
}

const MinesGameSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    betAmount: { type: Number, required: true },
    minesCount: { type: Number, required: true, min: 1, max: 24 },
    status: { type: String, enum: ['ACTIVE', 'CASHED_OUT', 'EXPLODED'], default: 'ACTIVE' },
    mines: { type: [Number], select: false, required: true },
    revealed: { type: [Number], default: [] },
    currentMultiplier: { type: Number, default: 1.0 },
    potentialWin: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMinesGame>('MinesGame', MinesGameSchema);
