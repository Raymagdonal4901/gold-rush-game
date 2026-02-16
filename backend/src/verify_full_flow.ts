import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import User from './models/User';

dotenv.config();

const API_URL = 'http://localhost:5002/api';

const testFullFlow = async () => {
    try {
        const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gold-rush').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const testUser = {
            username: 'flowtest_' + Math.random().toString(36).substring(7),
            email: 'flow_' + Math.random().toString(36).substring(7) + '@example.com',
            password: 'Password123!'
        };

        console.log('1. Registering user...');
        await axios.post(`${API_URL}/auth/register`, testUser);

        console.log('2. Extracting token from DB...');
        const user = await User.findOne({ email: testUser.email }).select('+verificationToken');
        if (!user || !user.verificationToken) {
            throw new Error('User or token not found');
        }
        console.log('Token found:', user.verificationToken);

        console.log('3. Verifying email...');
        const verifyRes = await axios.get(`${API_URL}/auth/verify-email?token=${user.verificationToken}`);
        console.log('Verify response:', verifyRes.data.message);

        console.log('4. Logging in after verification...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login successful! Token received:', loginRes.data.token.substring(0, 10) + '...');

        console.log('Full flow test complete!');
        process.exit(0);
    } catch (error: any) {
        if (error.response) {
            console.error('Test failed with status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Test failed:', error.message);
        }
        process.exit(1);
    }
};

testFullFlow();
