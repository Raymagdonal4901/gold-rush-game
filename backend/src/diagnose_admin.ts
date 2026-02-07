
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function diagnose() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected.');

        const admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            console.error('❌ ERROR: Admin user "admin" NOT FOUND in database.');
            return;
        }

        console.log('--- ADMIN DIAGNOSTICS ---');
        console.log('Username:', admin.username);
        console.log('Role:', admin.role);
        console.log('Role Match:', admin.role === 'ADMIN' ? '✅ OK' : '❌ WRONG (Expected ADMIN)');

        const isPasswordMatch = await bcrypt.compare('bleach', admin.password);
        console.log('Password ("bleach") Match:', isPasswordMatch ? '✅ OK' : '❌ FAILED');

        if (admin.pin) {
            const isPinMatch = await bcrypt.compare('4901', admin.pin);
            console.log('PIN ("4901") Match:', isPinMatch ? '✅ OK' : '❌ FAILED');
        } else {
            console.log('PIN:', '❌ NOT SET (This will cause login failure if frontend sends PIN)');
        }

        console.log('Balance:', admin.balance);
        console.log('--------------------------');

        if (admin.role !== 'ADMIN') {
            console.log('Fixing role to ADMIN...');
            admin.role = 'ADMIN';
            await admin.save();
            console.log('✅ Role fixed.');
        }

    } catch (error) {
        console.error('DIAGNOSE ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
