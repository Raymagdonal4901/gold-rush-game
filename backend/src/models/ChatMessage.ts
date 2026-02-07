import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    userId: string;
    username: string;
    role: string;
    message: string;
    timestamp: Date;
    isVip: boolean;
}

const ChatMessageSchema = new Schema<IChatMessage>({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isVip: { type: Boolean, default: false }
});

// Index for fast retrieval of latest messages
ChatMessageSchema.index({ timestamp: -1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
