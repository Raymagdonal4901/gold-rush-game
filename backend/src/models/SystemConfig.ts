import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
    receivingQrCode: string | null;
    usdtWalletAddress: string | null;
    isMaintenanceMode: boolean;
    isWithdrawalEnabled: boolean;
    dropRate: number;
}

const SystemConfigSchema: Schema = new Schema({
    receivingQrCode: { type: String, default: null },
    usdtWalletAddress: { type: String, default: '0xc523c42cb3dce0df59b998d8ae899fa4132b6de7' },
    isMaintenanceMode: { type: Boolean, default: false },
    isWithdrawalEnabled: { type: Boolean, default: true },
    dropRate: { type: Number, default: 0 }
}, {
    timestamps: true
});

// We only need one document, so no unique key logic strictly needed if we always findOne()
export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
