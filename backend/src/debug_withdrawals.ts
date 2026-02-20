
require('ts-node/register');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

// Define Schemas locally to avoid import issues
const WithdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    amount: Number,
    status: String,
    method: String
}, { strict: false });

const UserSchema = new mongoose.Schema({
    username: String,
    email: String
}, { strict: false });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
const User = mongoose.model('User', UserSchema);

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const requests = await WithdrawalRequest.find({}).sort({ _id: -1 }).limit(10);

        console.log(`Found ${requests.length} withdrawal requests. Inspecting last 10...`);

        for (const req of requests) {
            console.log('------------------------------------------------');
            console.log(`ID: ${req._id}`);
            console.log(`UserId (Raw): ${req.userId} (Type: ${typeof req.userId})`);
            console.log(`Username (Raw): ${req.username}`);

            // Try to find user manually
            if (req.userId) {
                const user = await User.findById(req.userId);
                console.log(`Linked User Found: ${user ? 'YES' : 'NO'}`);
                if (user) {
                    console.log(`Linked Username: ${user.username}`);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
