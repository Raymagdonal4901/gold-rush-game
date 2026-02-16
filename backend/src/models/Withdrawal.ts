import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    bankDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 100 },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    bankDetails: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true }
    },
    adminNote: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
