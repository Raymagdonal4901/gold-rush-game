import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'MINING_CLAIM' | 'CLAIM_YIELD' | 'BUY_RIG' | 'ASSET_PURCHASE' | 'REFUND' | 'ACCESSORY_PURCHASE' | 'ACCESSORY_SELL' | 'ACCESSORY_UPGRADE' | 'ACCESSORY_CRAFT' | 'EQUIPMENT_CLAIM' | 'RIG_RENEWAL' | 'REPAIR' | 'MATERIAL_SELL' | 'MATERIAL_BUY' | 'MATERIAL_CRAFT' | 'ENERGY_REFILL' | 'REFERRAL_BONUS' | 'DAILY_BONUS' | 'QUEST_REWARD' | 'LUCKY_DRAW' | 'SLOT_EXPANSION' | 'DUNGEON_ENTRY' | 'DUNGEON_REWARD' | 'RANK_REWARD' | 'GIFT_CLAIM' | 'COMPENSATION' | 'SYSTEM_ADJUSTMENT' | 'RIG_BUY' | 'WITHDRAW_FEE' | 'MARKET_FEE' | 'ITEM_BUY' | 'GAME_LOSS';
    amount: number;
    timestamp: Date;
    status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
    description: string;
    refId?: string;
    details?: {
        rigId?: string;
        isJackpot?: boolean;
        note?: string;
    };
}

const TransactionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'REJECTED', 'FAILED'], default: 'COMPLETED' },
    description: { type: String, required: true },
    refId: { type: Schema.Types.ObjectId },
    details: {
        type: {
            rigId: { type: String },
            isJackpot: { type: Boolean },
            note: { type: String }
        },
        default: undefined
    }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
