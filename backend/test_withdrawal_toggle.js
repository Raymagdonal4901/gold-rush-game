const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:5002/api';
const ADMIN_TOKEN = 'INSERT_ADMIN_TOKEN_HERE'; // User needs to provide this or I attempt to login
const USER_TOKEN = 'INSERT_USER_TOKEN_HERE';

async function testWithdrawalToggle() {
    try {
        console.log('--- Testing Withdrawal Toggle ---');

        // 1. Enable Withdrawals
        console.log('Step 1: Enabling withdrawals...');
        await axios.post(`${API_URL}/admin/config`,
            { isWithdrawalEnabled: true },
            { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
        );

        // 2. Disable Withdrawals
        console.log('Step 2: Disabling withdrawals...');
        const disableRes = await axios.post(`${API_URL}/admin/config`,
            { isWithdrawalEnabled: false },
            { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
        );
        console.log('Withdrawal Status (Backend):', disableRes.data.isWithdrawalEnabled);

        // 3. Attempt Withdrawal as User (Should fail)
        console.log('Step 3: Attempting withdrawal (should be blocked)...');
        try {
            await axios.post(`${API_URL}/transactions/withdraw`,
                { amount: 100, pin: '123456', method: 'BANK' },
                { headers: { Authorization: `Bearer ${USER_TOKEN}` } }
            );
            console.error('FAILED: Withdrawal succeeded but should have been blocked.');
        } catch (error) {
            console.log('SUCCESS: Withdrawal blocked correctly. Message:', error.response?.data?.message);
        }

        // 4. Re-enable Withdrawals
        console.log('Step 4: Re-enabling withdrawals...');
        await axios.post(`${API_URL}/admin/config`,
            { isWithdrawalEnabled: true },
            { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
        );

        console.log('--- Test Complete ---');
    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

// Note: This script requires valid tokens to run.
// testWithdrawalToggle();
