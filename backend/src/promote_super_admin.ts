import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const promote = async () => {
    try {
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'raymagdonal4901@gmail.com';
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'ADMIN';
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();
        console.log(`User ${user.username} (${email}) has been promoted to ADMIN and verified.`);

        process.exit(0);
    } catch (error) {
        console.error('Promotion error:', error);
        process.exit(1);
    }
};

promote();
