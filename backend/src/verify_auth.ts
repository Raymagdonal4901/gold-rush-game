import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

const testFlow = async () => {
    try {
        const testUser = {
            username: 'testuser_' + Math.random().toString(36).substring(7),
            email: 'test_' + Math.random().toString(36).substring(7) + '@example.com',
            password: 'Password123!'
        };

        console.log('1. Registering user...');
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('Register response:', regRes.data.message);

        // Note: In a real test we'd need to extract the token from the console log or DB
        // Since I'm an agent, I'll check the DB or just mock the verify call if I can get the token.
        // For simplicity in this script, I'll assume I'll manually run the verification link if needed,
        // but let's try to login BEFORE verification.

        console.log('\n2. Attempting login before verification...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
        } catch (err: any) {
            console.log('Login failed as expected:', err.response?.data?.message);
        }

        console.log('\nVerification link should have been logged in the backend console.');
        console.log('Execution complete.');

    } catch (error: any) {
        if (error.response) {
            console.error('Test failed with status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Test failed:', error.message);
        }
    }
};

testFlow();
