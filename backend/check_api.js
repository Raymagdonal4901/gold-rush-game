
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function test() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        console.log('2. Testing Compensation...');
        const compRes = await axios.post(`${API_URL}/admin/users/compensation`, {
            userId: 'admin', // Test by username
            amount: 100,
            reason: 'Test Script'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Compensation Result:', compRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

test();
