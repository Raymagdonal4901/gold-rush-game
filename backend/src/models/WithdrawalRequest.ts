import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawalRequest extends Document {
    userId: string;
    username: string;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    bankDetails?: string; // Optional: Store bank info/QR snapshot if needed
    createdAt: Date;
    processedAt?: Date;
}

const WithdrawalRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    bankDetails: { type: String },
    processedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
