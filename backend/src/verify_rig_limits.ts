import mongoose from 'mongoose';
import User from './models/User';
import Rig from './models/Rig';
import { buyRig } from './controllers/rigController';
import { unlockSlot } from './controllers/userController';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const userId = '698c189cd3803ad7d0328446'; // same test user
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found.');
            return;
        }

        // Reset user for testing
        user.unlockedSlots = 3;
        user.miningSlots = 3;
        user.balance = 10000;
        await user.save();

        // Remove any existing rigs for this user
        await Rig.deleteMany({ ownerId: userId });
        console.log('Reset user data for testing.');

        // Mock Response Helper
        const mockRes = (label: string) => ({
            status: (code: number) => ({
                json: (data: any) => console.log(`[${label}] Status: ${code}, Message: ${data.message}`)
            }),
            json: (data: any) => console.log(`[${label}] Status: 200, Message: ${data.message}`)
        } as any);

        // Test 1: Buy 3 rigs (should work)
        console.log('\n--- TEST 1: BUYING 3 RIGS ---');
        for (let i = 1; i <= 3; i++) {
            await buyRig({
                userId,
                body: { name: `Rig ${i}`, investment: 1000, dailyProfit: 50, durationDays: 30 }
            } as any, mockRes(`BUY_${i}`));
        }

        // Test 2: Buy 4th rig (should fail)
        console.log('\n--- TEST 2: BUYING 4TH RIG (EXPECT FAILURE) ---');
        await buyRig({
            userId,
            body: { name: `Rig 4`, investment: 1000, dailyProfit: 50, durationDays: 30 }
        } as any, mockRes('BUY_4_FAIL'));

        // Test 3: Unlock Slot 4 (should work)
        console.log('\n--- TEST 3: UNLOCKING SLOT 4 ---');
        // Add materials for unlock if needed
        user.materials = { '3': 100, '4': 100 };
        user.inventory.push({ id: 'key_1', typeId: 'chest_key' });
        await user.save();

        await unlockSlot({
            userId,
            body: { targetSlot: 4 }
        } as any, mockRes('UNLOCK_4'));

        // Test 4: Buy 4th rig again (should work now)
        console.log('\n--- TEST 4: BUYING 4TH RIG (EXPECT SUCCESS) ---');
        await buyRig({
            userId,
            body: { name: `Rig 4`, investment: 1000, dailyProfit: 50, durationDays: 30 }
        } as any, mockRes('BUY_4_SUCCESS'));

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
