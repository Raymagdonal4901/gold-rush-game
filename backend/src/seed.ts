import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import GameConfig from './models/GameConfig';
import { MINING_VOLATILITY_CONFIG, RIG_PRESETS } from './constants';

dotenv.config();

const seedDB = async () => {
    try {
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB at', uri);

        // --- SEED ADMIN ---
        const adminUsername = 'DevRay';
        const adminExists = await User.findOne({ username: adminUsername });
        if (adminExists) {
            console.log(`User ${adminUsername} already exists`);
            adminExists.role = 'ADMIN';
            adminExists.email = 'devray@goldrush.com';
            const salt = await bcrypt.genSalt(10);
            adminExists.passwordHash = await bcrypt.hash('bleach', salt);
            adminExists.pin = await bcrypt.hash('4901', salt);
            await adminExists.save();
            console.log(`Admin ${adminUsername} status updated`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('bleach', salt);
            const hashedPin = await bcrypt.hash('4901', salt);

            const admin = new User({
                username: adminUsername,
                email: 'devray@goldrush.com',
                passwordHash: hashedPassword,
                pin: hashedPin,
                role: 'ADMIN',
                balance: 10000,
                energy: 100
            });

            await admin.save();
            console.log(`Admin user created: ${adminUsername}`);
        }

        // --- SEED GAME CONFIG ---
        console.log('Seeding GameConfig...');
        await GameConfig.deleteMany({}); // Clear existing config

        const configEntries = Object.entries(MINING_VOLATILITY_CONFIG).map(([tierId, config]) => ({
            tierId: Number(tierId),
            name: (RIG_PRESETS.find(p => p.id === Number(tierId))?.name.en || 'Unknown'), // Add name if required
            price: RIG_PRESETS.find(p => p.id === Number(tierId))?.price || 0,
            hashrateDisplay: `${config.hashrateMin} - ${config.hashrateMax} MH/s`,
            stabilityLabel: config.stabilityLabel || `${config.stabilityStars} Stars`,
            yieldConfig: {
                baseAmount: config.baseValue,
                randomRange: config.maxRandom,
                jackpotChance: config.jackpotChance,
                jackpotMultiplier: config.jackpotMultiplier
            },
            durabilityDecay: config.durabilityDecay,
            durabilityMax: config.durabilityMax
        }));

        await GameConfig.insertMany(configEntries);
        console.log(`Successfully seeded ${configEntries.length} game configurations.`);

        console.log('--- Seeding Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDB();
