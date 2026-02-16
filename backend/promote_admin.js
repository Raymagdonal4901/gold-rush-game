
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            email: String,
            role: String,
            isEmailVerified: Boolean
        }));

        const email = 'raymagdonal4901@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('USER_FOUND:', user.username);
            user.role = 'SUPER_ADMIN'; // SUPER_ADMIN has full access
            user.isEmailVerified = true;
            await user.save();
            console.log('USER_PROMOTED_AND_VERIFIED_SUCCESSFULLY');
        } else {
            console.log('USER_NOT_FOUND:', email);
            console.log('Checking for username Raymagdonal...');
            const userByUsername = await User.findOne({ username: 'Raymagdonal' });
            if (userByUsername) {
                console.log('USER_FOUND_BY_USERNAME:', userByUsername.email);
                userByUsername.role = 'SUPER_ADMIN';
                userByUsername.isEmailVerified = true;
                await userByUsername.save();
                console.log('USER_PROMOTED_AND_VERIFIED_SUCCESSFULLY');
            } else {
                console.log('USER_NOT_FOUND_BY_USERNAME_EITHER');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
