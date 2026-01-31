import mongoose, { Document, Schema } from 'mongoose';

export interface IClaimRequest extends Document {
    userId: string;
    username: string;
    rigId: string;
    rigName: string;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    processedAt?: Date;
    createdAt: Date;
}

const ClaimRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    rigId: { type: String, required: true },
    rigName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' }, // Default to APPROVED for instant claims
    processedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IClaimRequest>('ClaimRequest', ClaimRequestSchema);
