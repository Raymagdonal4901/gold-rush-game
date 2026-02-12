
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

async function verify() {
    console.log('--- Verifying Backend Data ---');
    try {
        const statsRes = await axios.get(`${API_URL}/auth/stats`);
        console.log('Public /auth/stats:', JSON.stringify(statsRes.data, null, 2));

        // Note: admin/users needs token, but we can see if it even returns 401/403 or what
        try {
            const adminRes = await axios.get(`${API_URL}/admin/users`);
            console.log('Admin /admin/users (Unauthorized?):', adminRes.data.length);
        } catch (e: any) {
            console.log('Admin /admin/users failed (as expected if no token):', e.response?.status);
        }

    } catch (error: any) {
        console.error('API Verification failed:', error.message);
    }
}

verify();
