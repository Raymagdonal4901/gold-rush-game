import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUser() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected.');

    const User = mongoose.model('User', new mongoose.Schema({
        email: String,
        username: String,
        passwordHash: String,
        role: String,
        isEmailVerified: Boolean
    }));

    const email = 'raymagdonal4901@gmail.com';
    const user = await User.findOne({ email }).select('+passwordHash');

    if (user) {
        console.log('--- User Found ---');
        console.log('ID:', user._id);
        console.log('Username:', user.username);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('Verified:', user.isEmailVerified);
        console.log('Password Hash (prefix):', user.passwordHash?.substring(0, 10) + '...');
    } else {
        console.log('❌ User NOT found:', email);
    }

    await mongoose.disconnect();
}

checkUser();
