import mongoose, { Document, Schema } from 'mongoose';

export interface IDepositRequest extends Document {
    userId: string;
    username: string;
    amount: number;
    slipImage: string; // Base64
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
    processedAt?: Date;
}

const DepositRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    slipImage: { type: String, required: true }, // Store as base64 string for simplicity in MVP
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    processedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<IDepositRequest>('DepositRequest', DepositRequestSchema);
