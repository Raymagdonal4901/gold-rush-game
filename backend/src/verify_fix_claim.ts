import mongoose from 'mongoose';
import User from './models/User';
import Rig from './models/Rig';
import { claimReward } from './controllers/transactionController';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const userId = '698c189cd3803ad7d0328446'; // user 'jjjj'
        let user = await User.findById(userId);
        if (!user) {
            console.log('User jjjj not found. Listing all users...');
            const all = await User.find({}, 'username _id').limit(1);
            if (all.length > 0) {
                user = all[0];
                console.log(`Using replacement user: ${user.username} (${user._id})`);
            } else {
                console.log('No users found in database.');
                return;
            }
        }

        const activeUserId = user._id.toString();

        let rig = await Rig.findOne({ ownerId: activeUserId });
        if (!rig) {
            console.log('No rig found. Creating a dummy rig for testing...');
            rig = await Rig.create({
                ownerId: activeUserId,
                name: 'Security Test Rig',
                investment: 500,
                dailyProfit: 50,
                bonusProfit: 0,
                purchaseDate: new Date(Date.now() - 3600000), // 1 hour ago
                expiresAt: new Date(Date.now() + 864000000),
                rarity: 'COMMON'
            });
        } else {
            // Reset lastClaimAt to 1 hour ago for testing
            rig.lastClaimAt = new Date(Date.now() - 3600000);
            await rig.save();
        }

        console.log(`Testing with Rig: ${rig.name}, DailyProfit: ${rig.dailyProfit}, LastClaim (simulated): ${rig.lastClaimAt}`);

        // Mock Response Helper
        const mockRes = (label: string) => ({
            status: (code: number) => ({
                json: (data: any) => console.log(`[${label}] Status: ${code}, Message: ${data.message}, Reason: ${data.reason || 'N/A'}`)
            }),
            json: (data: any) => console.log(`[${label}] Status: 200, Message: ${data.message}, NewBalance: ${data.newBalance}`)
        } as any);

        // Test Scenario 1: Exploit attempt (Claim 10000 instantly)
        console.log('\n--- SCENARIO 1: EXPLOIT ATTEMPT (Claim 10,000 THB) ---');
        await claimReward({
            userId: activeUserId,
            body: { rigId: rig._id, amount: 10000 }
        } as any, mockRes('EXPLOIT'));

        // Test Scenario 2: Legitimate claim (Claim 1 THB)
        // Max for 1 hour at 50/day is approx 2.08
        console.log('\n--- SCENARIO 2: LEGITIMATE CLAIM (Claim 1 THB) ---');
        await claimReward({
            userId: activeUserId,
            body: { rigId: rig._id, amount: 1 }
        } as any, mockRes('LEGIT'));

        // Test Scenario 3: Double claim attempt (Immediate second claim)
        console.log('\n--- SCENARIO 3: DOUBLE CLAIM ATTEMPT (Claiming again immediately) ---');
        await claimReward({
            userId: activeUserId,
            body: { rigId: rig._id, amount: 1 }
        } as any, mockRes('DOUBLE_CLAIM'));

        // Clean up dummy rig if we created it
        if (rig.name === 'Security Test Rig') {
            await Rig.deleteOne({ _id: rig._id });
            console.log('\nDeleted dummy test rig.');
        }

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
