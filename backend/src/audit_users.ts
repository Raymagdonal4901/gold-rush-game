import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected.');

        const users = await User.find({}).select('+passwordHash +email').lean();
        console.log(`Total Users: ${users.length}`);

        users.forEach(u => {
            console.log(`- Username: [${u.username}], Email: [${u.email}], Role: ${u.role}, Verified: ${u.isEmailVerified}`);
        });

        const targetEmail = 'raymagdonal4901@gmail.com';
        const user = await User.findOne({ email: targetEmail.toLowerCase() }).select('+passwordHash');
        if (user) {
            console.log(`\nTarget User [${targetEmail}] Details:`);
            console.log(`ID: ${user._id}`);
            console.log(`Role: ${user.role}`);
            console.log(`Verified: ${user.isEmailVerified}`);
            console.log(`Has Password Hash: ${!!user.passwordHash}`);
        } else {
            console.log(`\nTarget User [${targetEmail}] NOT FOUND`);
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
