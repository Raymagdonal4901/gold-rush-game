import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

const listAllUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to:', MONGODB_URI.split('@')[1]); // Log host safely

        const users = await User.find({}, 'username email role isEmailVerified createdAt');
        console.log(`Total users found: ${users.length}`);
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('List failed:', error);
        process.exit(1);
    }
};

listAllUsers();
