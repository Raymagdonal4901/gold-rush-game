const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String },
    balance: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    role: { type: String, default: 'USER' },
    createdAt: { type: Date, default: Date.now },
    lastEnergyUpdate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const seedAdmin = async () => {
    try {
        // Force 127.0.0.1 to avoid IPv6 issues
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const bcrypt = require('bcryptjs');

        // Admin Credentials
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'bleach';
        const ADMIN_PIN = '4901';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
        const hashedPin = await bcrypt.hash(ADMIN_PIN, salt);

        // Delete existing admin if any
        await User.deleteOne({ username: ADMIN_USERNAME });
        console.log('Removed existing admin user (if any)');

        // Create new admin
        const admin = new User({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            pin: hashedPin,
            role: 'ADMIN',
            balance: 999999,
            energy: 100
        });
        await admin.save();

        console.log('');
        console.log('=================================');
        console.log('   ADMIN USER CREATED SUCCESS!');
        console.log('=================================');
        console.log('Username:', ADMIN_USERNAME);
        console.log('Password:', ADMIN_PASSWORD);
        console.log('PIN:', ADMIN_PIN);
        console.log('=================================');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedAdmin();
