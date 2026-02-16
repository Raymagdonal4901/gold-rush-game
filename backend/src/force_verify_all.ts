import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

const verifyAll = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const result = await User.updateMany({}, { $set: { isEmailVerified: true } });
        console.log(`[VERIFY ALL] Updated ${result.modifiedCount} users to verified.`);

        const allUsers = await User.find({}, 'username email isEmailVerified role');
        console.log('[USER LIST]:');
        allUsers.forEach(u => {
            console.log(` - ${u.username} (${u.email}) | Verified: ${u.isEmailVerified} | Role: ${u.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Verify failed:', error);
        process.exit(1);
    }
};

verifyAll();
