import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
    receivingQrCode: string | null;
    isMaintenanceMode: boolean;
    // Add other global configs here later (tax, dropRate, etc.)
}

const SystemConfigSchema: Schema = new Schema({
    receivingQrCode: { type: String, default: null },
    isMaintenanceMode: { type: Boolean, default: false }
}, {
    timestamps: true
});

// We only need one document, so no unique key logic strictly needed if we always findOne()
export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
