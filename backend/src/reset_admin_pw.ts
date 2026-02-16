import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected.');

        const email = 'raymagdonal4901@gmail.com';
        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        if (!user) {
            console.log(`User ${email} not found. Creating a new admin user...`);
        } else {
            console.log(`User ${email} found. Resetting password to bleach4901 and ensuring ADMIN...`);
            const hashedPassword = await bcrypt.hash('bleach4901', 10);
            user.passwordHash = hashedPassword;
            user.role = 'ADMIN';
            user.isEmailVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
            console.log('✅ Password reset to: bleach4901');
            console.log('✅ User role ensured: ADMIN');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
