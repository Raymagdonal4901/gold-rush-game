
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from backend directory
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const WithdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.Mixed, ref: 'User' }, // Use Mixed to see raw data
    username: String,
    amount: Number,
    status: String,
    createdAt: Date
}, { strict: false });

const UserSchema = new mongoose.Schema({
    username: String,
    email: String
}, { strict: false });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
const User = mongoose.model('User', UserSchema);

async function main() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fetch last 20
        const requests = await WithdrawalRequest.find({}).sort({ createdAt: -1 }).limit(20);

        console.log(`Found ${requests.length} withdrawal requests.`);

        for (const req of requests) {
            console.log('------------------------------------------------');
            console.log(`ID: ${req._id}`);
            console.log(`Date: ${req.createdAt}`);
            console.log(`UserId (Raw): ${req.userId} (Type: ${typeof req.userId})`);
            console.log(`Username (Raw): '${req.username}'`);

            // Try explicit lookup
            if (req.userId) {
                let userStart = Date.now();
                // Handle both ObjectId and String
                try {
                    const user = await User.findById(req.userId);
                    console.log(`Linked User Found: ${user ? 'YES' : 'NO'}`);
                    if (user) {
                        console.log(`-> Linked Username: '${user.username}'`);
                    } else {
                        console.log(`-> User not found for ID: ${req.userId}`);
                    }
                } catch (e) {
                    console.log(`-> Lookup error for ID ${req.userId}: ${e.message}`);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done');
        process.exit(0);
    }
}

main();
