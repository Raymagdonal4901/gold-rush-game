import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const migrate = async () => {
    try {
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({ email: { $exists: false } });
        console.log(`Found ${users.length} users missing email`);

        for (const user of users) {
            user.email = `${user.username.toLowerCase()}@placeholder.com`;
            await user.save();
            console.log(`Updated user ${user.username} with email ${user.email}`);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrate();
