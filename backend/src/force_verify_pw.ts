import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyPassword() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);

    const User = mongoose.model('User', new mongoose.Schema({
        email: String,
        passwordHash: String,
    }));

    const email = 'raymagdonal4901@gmail.com';
    const rawPassword = 'bleach4901';

    const user: any = await User.findOne({ email }).select('+passwordHash');

    if (user) {
        console.log(`Checking password for ${email}...`);
        const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
        console.log(`Match Result: ${isMatch}`);

        if (!isMatch) {
            console.log('Generating NEW hash for "bleach4901"...');
            const newHash = await bcrypt.hash(rawPassword, 10);
            user.passwordHash = newHash;
            await user.save();
            console.log('✅ Password has been force-reset to "bleach4901" again.');
        }
    } else {
        console.log('❌ User not found');
    }

    await mongoose.disconnect();
}

verifyPassword();
