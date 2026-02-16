
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rig from './models/Rig';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

const checkRigs = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const rigs = await Rig.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(10);

        console.log('--- Latest 10 Active Rigs ---');
        rigs.forEach(r => {
            console.log(`ID: ${r._id}`);
            console.log(`Name: ${JSON.stringify(r.name)}`);
            console.log(`TierID: ${r.tierId}`);
            console.log(`Rarity: ${r.rarity}`);
            console.log(`StarLevel: ${r.starLevel}`);
            console.log(`Investment: ${r.investment}`);
            console.log('---------------------------');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkRigs();
