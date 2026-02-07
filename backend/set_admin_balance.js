const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User').default;

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Try by ID from screenshot
        const result = await User.updateOne(
            { _id: '697dafa1400c435cf1d43803' },
            { $set: { balance: 0 } }
        );
        console.log('Updated by ID:', result);

        // Also try case-insensitive username match
        const result2 = await User.updateOne(
            { username: { $regex: /^admin$/i } },
            { $set: { balance: 0 } }
        );
        console.log('Updated by username (regex):', result2);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
})();
