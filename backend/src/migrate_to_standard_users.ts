import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

const migrateUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for migration');

        const ADMIN_EMAILS = ['raymagdonal4901@gmail.com'];
        const ADMIN_USERNAMES = ['admin'];

        // Reset all users to role: 'USER' except for specific admins
        const result = await User.updateMany(
            {
                email: { $nin: ADMIN_EMAILS },
                username: { $nin: ADMIN_USERNAMES }
            },
            {
                $set: {
                    role: 'USER',
                    isEmailVerified: true // Also force verify all existing players for smoother transition
                }
            }
        );

        console.log(`Successfully updated ${result.modifiedCount} users to standard USER role.`);

        // Ensure primary admins are verified and have ADMIN role
        await User.updateMany(
            {
                $or: [
                    { email: { $in: ADMIN_EMAILS } },
                    { username: { $in: ADMIN_USERNAMES } }
                ]
            },
            {
                $set: {
                    role: 'ADMIN',
                    isEmailVerified: true
                }
            }
        );
        console.log('Primary admin accounts verified and role set to ADMIN.');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateUsers();
