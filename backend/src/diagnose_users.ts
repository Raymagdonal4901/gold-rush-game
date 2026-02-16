import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const diagnose = async () => {
    try {
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        users.forEach(u => {
            console.log(`User: ${u.username}, Role: ${u.role}, Email: ${u.email || 'MISSING'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Diagnosis error:', error);
        process.exit(1);
    }
};

diagnose();
