import mongoose, { Schema, Document } from 'mongoose';

export interface IGameConfig extends Document {
    tierId: number;
    name: string;
    price: number;
    hashrateDisplay: string;
    stabilityLabel: string;
    yieldConfig: {
        baseAmount: number;
        randomRange: number;
        jackpotChance: number;
        jackpotMultiplier: number;
    };
    durabilityDecay: number;
    durabilityMax: number;
}

const GameConfigSchema = new Schema<IGameConfig>({
    tierId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    hashrateDisplay: { type: String, required: true },
    stabilityLabel: { type: String, required: true },
    yieldConfig: {
        baseAmount: { type: Number, required: true },
        randomRange: { type: Number, required: true },
        jackpotChance: { type: Number, default: 0 },
        jackpotMultiplier: { type: Number, default: 1.0 }
    },
    durabilityDecay: { type: Number, default: 100 },
    durabilityMax: { type: Number, default: 3000 }
});

export default mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);
