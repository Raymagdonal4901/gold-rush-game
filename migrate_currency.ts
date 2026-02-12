import mongoose from 'mongoose';
import User from './backend/src/models/User';
import Rig from './backend/src/models/Rig';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';
const SCALE_FACTOR = 35; // The user was using ~35 (e.g. 100/35 = 2.85...)

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Scale User Balances
        const users = await User.find({});
        console.log(`Found ${users.length} users. Scaling balances...`);
        for (const user of users) {
            const oldBalance = user.balance;
            user.balance = oldBalance * SCALE_FACTOR;

            // Scale inventory items (bonuses)
            if (user.inventory) {
                user.inventory = user.inventory.map((item: any) => {
                    if (item.dailyBonus) {
                        item.dailyBonus = item.dailyBonus * SCALE_FACTOR;
                    }
                    return item;
                });
            }

            user.markModified('inventory');
            await user.save();
        }
        console.log('User balances and inventory bonuses scaled.');

        // 2. Scale Rig Profits and Costs
        const rigs = await Rig.find({});
        console.log(`Found ${rigs.length} rigs. Scaling profits and costs...`);
        for (const rig of rigs) {
            rig.dailyProfit = rig.dailyProfit * SCALE_FACTOR;
            rig.bonusProfit = (rig.bonusProfit || 0) * SCALE_FACTOR;
            rig.repairCost = (rig.repairCost || 0) * SCALE_FACTOR;
            rig.energyCostPerDay = (rig.energyCostPerDay || 0) * SCALE_FACTOR;
            rig.investment = rig.investment * SCALE_FACTOR;

            await rig.save();
        }
        console.log('Rig data scaled.');

        console.log('Migration COMPLETED successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration FAILED:', error);
        process.exit(1);
    }
}

migrate();
