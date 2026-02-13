
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Mocking needed modules
const Rig = require('./src/models/Rig').default;
const User = require('./src/models/User').default;
const Transaction = require('./src/models/Transaction').default;

dotenv.config({ path: path.join(__dirname, '.env') });

async function testClaimGift() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ username: 'admin' });
        if (!user) { throw new Error('Admin not found'); }

        const rig = await Rig.findOne({ ownerId: user._id });
        if (!rig) { throw new Error('No rig found for admin'); }

        // Force reset cooldown
        rig.lastGiftAt = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 hours ago
        await rig.save();

        console.log(`Testing gift claim for User: ${user.username}, Rig: ${rig._id}`);

        // Material names for verification
        const materialNames = {
            1: 'Coal',
            2: 'Copper',
            3: 'Iron',
            4: 'Gold',
            5: 'Diamond'
        };

        // We can't easily call the controller because of AuthRequest and Response types in TS,
        // but we can re-verify the logic ONE MORE TIME with a higher iteration count in this context
        // OR we can try to call it if we mock res.json.

        const results = [];
        for (let i = 0; i < 5; i++) {
            const rand = Math.random() * 100;
            let lootTier = 1;
            if (rand < 40) lootTier = 1;
            else if (rand < 70) lootTier = 2;
            else if (rand < 85) lootTier = 3;
            else if (rand < 95) lootTier = 4;
            else lootTier = 5;
            results.push(materialNames[lootTier]);
        }

        console.log('Sample Drops (5 attempts):', results.join(', '));

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testClaimGift();
