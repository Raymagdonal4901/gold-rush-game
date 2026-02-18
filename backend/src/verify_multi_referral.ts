import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    username: String,
    referralCode: String,
    referrerId: mongoose.Schema.Types.ObjectId,
    balance: Number,
    referralStats: {
        totalInvited: Number,
        totalEarned: Number
    }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    amount: Number,
    description: String,
    timestamp: { type: Date, default: Date.now }
}, { strict: false });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function verify() {
    try {
        console.log('📡 Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected.');

        // 1. Create Chain: A -> B -> C -> D
        console.log('🧹 Cleaning up test users...');
        await User.deleteMany({ username: { $regex: /^TEST_REF_/ } });
        await Transaction.deleteMany({ description: { $regex: /TEST_REF_/ } });

        console.log('🏗️ Creating referral chain...');
        const userA = await User.create({ username: 'TEST_REF_A', balance: 0, referralCode: 'CODE_A' });
        const userB = await User.create({ username: 'TEST_REF_B', balance: 0, referralCode: 'CODE_B', referrerId: userA._id });
        const userC = await User.create({ username: 'TEST_REF_C', balance: 0, referralCode: 'CODE_C', referrerId: userB._id });
        const userD = await User.create({ username: 'TEST_REF_D', balance: 0, referrerId: userC._id });

        console.log('✅ Chain created: A <- B <- C <- D');

        // 2. Simulate Rig Purchase by D
        const investment = 1000;
        console.log(`\n🛒 Simulating Rig Purchase by D (Investment: ${investment})...`);

        // Manual simulation of rigController.ts logic
        const levelsBuy = [
            { id: userC._id, key: 'L1', name: 'C', percent: 0.05 },
            { id: userB._id, key: 'L2', name: 'B', percent: 0.02 },
            { id: userA._id, key: 'L3', name: 'A', percent: 0.01 }
        ];

        for (const level of levelsBuy) {
            const commission = Math.floor(investment * level.percent);
            if (commission > 0) {
                await User.findByIdAndUpdate(level.id, { $inc: { balance: commission, 'referralStats.totalEarned': commission } });
                await Transaction.create({
                    userId: level.id,
                    type: 'REFERRAL_BONUS_BUY',
                    amount: commission,
                    description: `TEST_REF_PURCHASE: Bonus ${level.key} from D`
                });
                console.log(`   💰 Paid ${commission} to ${level.name} (${level.key})`);
            }
        }

        // 3. Simulate Yield Claim by D
        const yieldAmount = 1000;
        console.log(`\n💎 Simulating Yield Claim by D (Amount: ${yieldAmount})...`);

        const levelsYield = [
            { id: userC._id, key: 'L1', name: 'C', percent: 0.01 },
            { id: userB._id, key: 'L2', name: 'B', percent: 0.005 },
            { id: userA._id, key: 'L3', name: 'A', percent: 0.002 }
        ];

        for (const level of levelsYield) {
            const commission = Math.floor(yieldAmount * level.percent);
            if (commission > 0) {
                await User.findByIdAndUpdate(level.id, { $inc: { balance: commission, 'referralStats.totalEarned': commission } });
                await Transaction.create({
                    userId: level.id,
                    type: 'REFERRAL_BONUS_YIELD',
                    amount: commission,
                    description: `TEST_REF_YIELD: Bonus ${level.key} from D`
                });
                console.log(`   💰 Paid ${commission} to ${level.name} (${level.key})`);
            }
        }

        // 4. Verify Final Balances
        console.log('\n📊 Final Results:');
        const finalA = await User.findById(userA._id);
        const finalB = await User.findById(userB._id);
        const finalC = await User.findById(userC._id);

        console.log(`   User A: ${finalA?.balance} THB (Expected: 10 + 2 = 12)`);
        console.log(`   User B: ${finalB?.balance} THB (Expected: 20 + 5 = 25)`);
        console.log(`   User C: ${finalC?.balance} THB (Expected: 50 + 10 = 60)`);

        if (finalA?.balance === 12 && finalB?.balance === 25 && finalC?.balance === 60) {
            console.log('\n🌟 VERIFICATION SUCCESSFUL! 🌟');
        } else {
            console.log('\n❌ VERIFICATION FAILED! ❌');
        }

        await mongoose.disconnect();
    } catch (e: any) {
        console.error('❌ Error:', e.message);
    }
}

verify();
