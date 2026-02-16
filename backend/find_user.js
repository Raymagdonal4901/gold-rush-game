
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            isEmailVerified: Boolean,
            verificationToken: String
        }));

        const user = await User.findOne({ email: 'ray.itctb@gmail.com' });
        if (user) {
            console.log('USER_FOUND');
            console.log('Verified:', user.isEmailVerified);
            console.log('Token:', user.verificationToken);
        } else {
            console.log('USER_NOT_FOUND');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
