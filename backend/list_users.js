
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            email: String,
            role: String
        }));

        const users = await User.find({});
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`Username: ${u.username} | Email: ${u.email} | Role: ${u.role}`);
        });
        console.log('-----------------');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
