import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

const checkUser = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const email = 'atipat.csi@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`[USER CHECK] User: ${user.username}`);
            console.log(`[USER CHECK] Email: ${user.email}`);
            console.log(`[USER CHECK] Verified: ${user.isEmailVerified}`);
            console.log(`[USER CHECK] Role: ${user.role}`);
            console.log(`[USER CHECK] Token: ${user.verificationToken ? 'Exists' : 'None'}`);
        } else {
            console.log(`[USER CHECK] User ${email} not found.`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkUser();
