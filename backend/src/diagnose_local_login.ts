import axios from 'axios';

async function diagnose() {
    const API_URL = 'http://localhost:5002/api';
    const email = 'raymagdonal4901@gmail.com';
    const password = 'bleach4901';

    console.log(`Checking API at: ${API_URL}`);
    try {
        const resp = await axios.get(`${API_URL}/auth/config`);
        console.log('✅ API Config reachable:', resp.data);

        console.log(`\nAttempting login for ${email}...`);
        try {
            const loginResp = await axios.post(`${API_URL}/auth/login`, { email, password });
            console.log('✅ Login SUCCESS!');
            console.log('User Role:', loginResp.data.user.role);
            console.log('Token received:', !!loginResp.data.token);
        } catch (loginErr: any) {
            console.error('❌ Login FAILED');
            console.error('Status:', loginErr.response?.status);
            console.error('Message:', loginErr.response?.data?.message);
        }

    } catch (err: any) {
        console.error('❌ API UNREACHABLE at', API_URL);
        console.error('Error:', err.message);
    }
}

diagnose();
