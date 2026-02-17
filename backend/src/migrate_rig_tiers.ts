import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rig from './models/Rig';
import { getRigPresetId } from './controllers/rigController';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const rigs = await Rig.find({ tierId: { $exists: false } });
        console.log(`Found ${rigs.length} rigs needing tierId migration.`);

        let count = 0;
        for (const rig of rigs) {
            const presetId = getRigPresetId(rig);
            rig.tierId = presetId;
            await rig.save();
            count++;
            if (count % 10 === 0) console.log(`Migrated ${count} rigs...`);
        }

        console.log(`Successfully migrated ${count} rigs.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
