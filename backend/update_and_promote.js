
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

        const currentEmail = 'ray.itctb@gmail.com';
        const newEmail = 'raymagdonal4901@gmail.com';
        const newUsername = 'Raymagdonal';

        const result = await User.updateOne(
            { email: currentEmail },
            {
                $set: {
                    username: newUsername,
                    email: newEmail,
                    role: 'SUPER_ADMIN',
                    isEmailVerified: true
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log('ACCOUNT_UPDATED_AND_PROMOTED_SUCCESSFULLY');
        } else {
            console.log('CURRENT_ACCOUNT_NOT_FOUND:', currentEmail);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
