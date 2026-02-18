import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Rig from '../models/Rig';

dotenv.config();

/**
 * Diagnostic script to audit and verify referral data integrity.
 * Run this to identify missing links caused by case-sensitivity or typos.
 */
async function verifyReferrals() {
    try {
        console.log('--- STARTING REFERRAL AUDIT ---');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to Database');

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);

        let inconsistentInvites = 0;
        let orphanedReferrals = 0;
        let caseSentivityIssues = 0;

        for (const user of users) {
            // 1. Check if user's referrerId actually exists
            if (user.referrerId) {
                const referrer = await User.findById(user.referrerId);
                if (!referrer) {
                    console.warn(`[ORPHAN] User ${user.username} has missing referrerId: ${user.referrerId}`);
                    orphanedReferrals++;
                }
            }

            // 2. Audit totalInvited count
            const actualL1Count = await User.countDocuments({ referrerId: user._id });
            const storedL1Count = user.referralStats?.totalInvited || 0;

            if (actualL1Count !== storedL1Count) {
                console.log(`[MISMATCH] User ${user.username}: Stored L1=${storedL1Count}, Actual L1=${actualL1Count}`);
                inconsistentInvites++;

                // Fix option:
                // user.referralStats.totalInvited = actualL1Count;
                // await user.save();
            }

            // 3. Detect potentially missed referrals (Case sensitivity check)
            // This is hard to do perfectly, but we can look for users with no referrerId who might have tried to enter a code
            // Note: We don't store the "failed" code in the database usually, 
            // so we'd need to check registration logs if available.
            // However, we can check if any referralCode exists that is only different by case.
        }

        console.log('\n--- AUDIT SUMMARY ---');
        console.log(`Inconsistent Invite Counts: ${inconsistentInvites}`);
        console.log(`Orphaned Referrers: ${orphanedReferrals}`);
        console.log('--- AUDIT COMPLETE ---');

        process.exit(0);
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
}

verifyReferrals();
