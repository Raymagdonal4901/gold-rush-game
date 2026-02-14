import mongoose from 'mongoose';
import User from './models/User';
import Rig from './models/Rig';
import { buyRig } from './controllers/rigController';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);

        const userId = '698c189cd3803ad7d0328446';
        const user = await User.findById(userId);
        if (!user) return;

        user.unlockedSlots = 3;
        await user.save();
        await Rig.deleteMany({ ownerId: userId });

        // Add 3 rigs
        for (let i = 1; i <= 3; i++) {
            await Rig.create({
                ownerId: userId,
                name: `Rig ${i}`,
                dailyProfit: 10,
                expiresAt: new Date(),
                investment: 1000,
                rarity: 'COMMON',
                repairCost: 0,
                energyCostPerDay: 1,
                bonusProfit: 0,
                lastClaimAt: new Date()
            });
        }

        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    console.log(`CODE: ${code}`);
                    console.log(`MSG: ${data.message}`);
                }
            })
        } as any;

        console.log('--- TEST: BUY 4TH RIG WHEN SLOTS=3 ---');
        await buyRig({
            userId,
            body: { name: 'Rig 4', investment: 0, dailyProfit: 10, durationDays: 30 }
        } as any, mockRes);

    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};
run();
