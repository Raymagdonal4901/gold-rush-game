import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listUsers() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const User = mongoose.model('User', new mongoose.Schema({
        email: String,
        username: String,
        role: String
    }));

    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(u => {
        console.log(`- Email: "${u.email}", Username: "${u.username}", Role: ${u.role}`);
    });

    await mongoose.disconnect();
}

listUsers();
