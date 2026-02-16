
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            isEmailVerified: Boolean
        }));

        const result = await User.updateOne(
            { email: 'ray.itctb@gmail.com' },
            { $set: { isEmailVerified: true } }
        );

        if (result.modifiedCount > 0) {
            console.log('USER_VERIFIED_SUCCESSFULLY');
        } else {
            console.log('USER_NOT_FOUND_OR_ALREADY_VERIFIED');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
