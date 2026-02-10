import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
    receivingQrCode: string | null;
    isMaintenanceMode: boolean;
    dropRate: number;
}

const SystemConfigSchema: Schema = new Schema({
    receivingQrCode: { type: String, default: null },
    isMaintenanceMode: { type: Boolean, default: false },
    dropRate: { type: Number, default: 0 }
}, {
    timestamps: true
});

// We only need one document, so no unique key logic strictly needed if we always findOne()
export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
