
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function findTestData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
        const Rig = mongoose.model('Rig', new mongoose.Schema({}, { strict: false }), 'rigs');

        const user = await User.findOne({ balance: { $gt: 0 } });
        if (!user) {
            console.log('No user found');
            return;
        }

        const rig = await Rig.findOne({ ownerId: user._id.toString() });
        if (!rig) {
            console.log(`No rig found for user ${user._id}`);
            return;
        }

        console.log(`Test DataFound:`);
        console.log(`User ID: ${user._id}`);
        console.log(`Rig ID: ${rig._id}`);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

findTestData();
