import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    username: String,
    referralCode: String,
    referrerId: mongoose.Schema.Types.ObjectId,
    usedReferralCode: String,
    createdAt: Date
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function diagnostic() {
    try {
        console.log('📡 Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected.');

        console.log('🔍 Identifying users with usedReferralCode but NO referrerId...');
        const brokenLinks = await User.find({
            usedReferralCode: { $exists: true, $ne: null },
            $or: [
                { referrerId: { $exists: false } },
                { referrerId: null }
            ]
        }).select('username usedReferralCode createdAt');

        console.log(`📊 Found ${brokenLinks.length} broken links.`);

        for (const user of brokenLinks) {
            console.log(`--- [BROKEN] User: ${user.username} | Used Code: ${user.usedReferralCode} | Created: ${user.createdAt}`);

            // Try to find the intended referrer
            const code = user.usedReferralCode.trim();
            const intendedReferrer = await User.findOne({
                $or: [
                    { referralCode: { $regex: new RegExp(`^${code}$`, 'i') } },
                    { username: { $regex: new RegExp(`^${code}$`, 'i') } }
                ]
            });

            if (intendedReferrer) {
                console.log(`   ✅ Matched intended referrer: ${intendedReferrer.username} (${intendedReferrer._id})`);
            } else {
                console.log(`   ❌ Intended referrer NOT FOUND for code: ${code}`);
            }
        }

        // Summary of potential causes
        const codesUsed = brokenLinks.map(u => u.usedReferralCode);
        const uniqueCodes = [...new Set(codesUsed)];
        console.log(`\n📊 Unique codes that failed to link: ${uniqueCodes.length}`);
        for (const code of uniqueCodes) {
            const count = brokenLinks.filter(u => u.usedReferralCode === code).length;
            console.log(`   - ${code}: ${count} users`);
        }

        await mongoose.disconnect();
    } catch (e: any) {
        console.error('❌ Error:', e.message);
    }
}

diagnostic();
