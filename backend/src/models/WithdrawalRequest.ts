import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawalRequest extends Document {
    userId: string;
    username: string;
    amount: number;
    bankQrCode?: string; // Snapshot of user's receiving QR code
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
    processedAt?: Date;
}

const WithdrawalRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    bankQrCode: { type: String },
    processedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
