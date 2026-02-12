/**
 * Migration Script: Time-based Expiry → HP-based Durability
 * 
 * แปลงไอเทมในกระเป๋าผู้ใช้จากระบบ expireAt เป็น currentDurability/maxDurability
 * 
 * วิธีรัน: npx ts-node backend/src/scripts/migrate-durability.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// SHOP_ITEMS maxDurability mapping (1 day = 100 HP)
const DURABILITY_MAP: Record<string, number> = {
    'hat': 3000,       // 30 days
    'uniform': 3000,   // 30 days
    'bag': 4500,       // 45 days
    'boots': 4500,     // 45 days
    'glasses': 6000,   // 60 days
    'mobile': 9000,    // 90 days
    'pc': 9000,        // 90 days
    'auto_excavator': 12000, // 120 days
    'glove': 999900    // essentially infinite
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function migrate() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dormitory-tycoon';
    console.log(`🔌 Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
        console.error('❌ Database connection failed');
        process.exit(1);
    }
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({
        'inventory.0': { $exists: true }
    }).toArray();

    console.log(`📦 Found ${users.length} users with inventory items`);

    let totalItems = 0;
    let migratedItems = 0;
    let skippedItems = 0;

    for (const user of users) {
        const inventory = user.inventory || [];
        let modified = false;

        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i];
            totalItems++;

            // Skip if already migrated
            if (item.currentDurability !== undefined && item.maxDurability !== undefined) {
                skippedItems++;
                continue;
            }

            const typeId = item.typeId || '';
            const maxDurability = DURABILITY_MAP[typeId] || (item.lifespanDays ? item.lifespanDays * 100 : 3000);

            // Calculate current HP from remaining expiry time
            let currentDurability = maxDurability; // Default: full HP
            if (item.expireAt) {
                const now = Date.now();
                const remainingMs = Math.max(0, item.expireAt - now);
                const remainingDays = remainingMs / MS_PER_DAY;
                currentDurability = Math.round(remainingDays * 100);
                // Cap at maxDurability
                currentDurability = Math.min(currentDurability, maxDurability);
            }

            item.currentDurability = currentDurability;
            item.maxDurability = maxDurability;
            migratedItems++;
            modified = true;
        }

        if (modified) {
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { inventory } }
            );
        }
    }

    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   Total items scanned: ${totalItems}`);
    console.log(`   Migrated:           ${migratedItems}`);
    console.log(`   Already migrated:   ${skippedItems}`);
    console.log('');
    console.log('✅ Migration complete!');

    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
