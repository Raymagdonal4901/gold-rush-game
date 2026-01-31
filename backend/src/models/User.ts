import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    password: string;
    pin?: string;
    balance: number;
    energy: number;
    role: string;
    createdAt: Date;
    lastEnergyUpdate: Date;
}
const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String }, // 6-digit PIN
    balance: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    role: { type: String, default: 'USER' },
    createdAt: { type: Date, default: Date.now },
    lastEnergyUpdate: { type: Date, default: Date.now }
});
export default mongoose.model<IUser>('User', UserSchema);