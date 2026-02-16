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
            const hashedPassword = await bcrypt.hash('bleach4901', 10);
            const newUser = await User.create({
                username: 'raymagdonal',
                email: email.toLowerCase(),
                passwordHash: hashedPassword,
                role: 'ADMIN',
                isEmailVerified: true,
                balance: 1000,
                energy: 100
            });
            console.log('✅ Created new ADMIN user:', newUser.username);
            console.log('Password: bleach4901');
        } else {
            console.log(`User ${email} found. Promoting to ADMIN...`);
            user.role = 'ADMIN';
            user.isEmailVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
            console.log('✅ User promoted to ADMIN and verified.');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
