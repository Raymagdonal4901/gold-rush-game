import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB at', uri);

        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            // Update to ensure role is ADMIN
            adminExists.role = 'ADMIN';
            // Force reset password to 123456
            const salt = await bcrypt.genSalt(10);
            adminExists.password = await bcrypt.hash('123456', salt);
            await adminExists.save();
            console.log('Admin password reset to: 123456');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            const admin = new User({
                username: 'admin',
                password: hashedPassword,
                role: 'ADMIN',
                balance: 999999,
                energy: 100
            });

            await admin.save();
            console.log('Admin user created: username="admin", password="123456"');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedAdmin();
