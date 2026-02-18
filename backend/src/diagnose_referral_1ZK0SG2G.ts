import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const TARGET_CODE = '1ZK0SG2G';

const UserSchema = new mongoose.Schema({
    username: String,
    referralCode: String,
    referrerId: mongoose.Schema.Types.ObjectId,
    referralStats: {
        totalInvited: Number,
        totalEarned: Number
    }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function diagnose() {
    try {
        console.log(`📡 Connecting to DB...`);
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log(`✅ Connected.`);

        console.log(`🔍 Searching for owner with referralCode: ${TARGET_CODE}`);
        // Try case-insensitive just in case
        const owner = await User.findOne({
            referralCode: { $regex: new RegExp(`^${TARGET_CODE}$`, 'i') }
        });

        if (!owner) {
            console.log(`❌ Owner not found!`);

            // Try searching by username as well
            const ownerByUsername = await User.findOne({
                username: { $regex: new RegExp(`^${TARGET_CODE}$`, 'i') }
            });

            if (ownerByUsername) {
                console.log(`✅ Found user by username instead: ${ownerByUsername.username} (${ownerByUsername._id})`);
                console.log(`Referral Code: ${ownerByUsername.referralCode}`);
                await checkReferrals(ownerByUsername);
            } else {
                console.log(`🔍 Searching for ANY user with a similar code...`);
                const allCodes = await User.find({ referralCode: { $exists: true } }).select('referralCode username').limit(5);
                console.log(`Sample codes:`, allCodes.map(u => `${u.username}: ${u.referralCode}`));
            }
        } else {
            console.log(`✅ Found owner: ${owner.username} (${owner._id})`);
            await checkReferrals(owner);
        }

        await mongoose.disconnect();
    } catch (e: any) {
        console.error(`❌ Error:`, e.message);
    }
}

async function checkReferrals(owner: any) {
    const l1Count = await User.countDocuments({ referrerId: owner._id });
    console.log(`📊 Actual L1 Referrals: ${l1Count}`);

    if (l1Count > 0) {
        const samples = await User.find({ referrerId: owner._id }).select('username createdAt').limit(5);
        console.log(`Sample L1 users:`, samples.map(u => u.username));
    } else {
        console.log(`🔍 Searching for users with referrerId as STRING version of ID...`);
        const stringCount = await User.countDocuments({ referrerId: owner._id.toString() });
        console.log(`📊 Count with string referrerId: ${stringCount}`);

        console.log(`🔍 Searching for users with referralCode in some other field...`);
        // Sometimes people store referrer name instead of ID
        const byUsernameCount = await User.countDocuments({ referrerUsername: owner.username });
        console.log(`📊 Count by referrerUsername: ${byUsernameCount}`);
    }
}

diagnose();
