import { ethers } from 'ethers';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

console.log('🏁 Starting Monitor Script...');

dotenv.config();

console.log('📂 Environment loaded.');
console.log('   - Hot Wallet:', process.env.PROJECT_HOT_WALLET);
console.log('   - MongoDB URI:', process.env.MONGODB_URI ? 'Defined' : 'Missing');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';
const BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955';
const PROJECT_HOT_WALLET = process.env.PROJECT_HOT_WALLET;

if (!PROJECT_HOT_WALLET) {
    console.error('❌ ERROR: PROJECT_HOT_WALLET is not defined in .env file.');
    process.exit(1);
}

// Minimal Schemas to avoid importing from Backend folder
const UserSchema = new mongoose.Schema({
    username: String,
    balance: Number,
    walletAddress: { type: String, sparse: true }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DepositRequestSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    amount: Number,
    slipImage: String,
    status: String,
    processedAt: Date
}, { timestamps: true });
const DepositRequest = mongoose.models.DepositRequest || mongoose.model('DepositRequest', DepositRequestSchema);

// ERC20 ABI (Minimal for Transfer event)
const USDT_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

async function startMonitor() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
        const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);

        console.log(`🚀 Monitoring USDT (BSC) transfers to ${PROJECT_HOT_WALLET}...`);

        contract.on("Transfer", async (from, to, value, event) => {
            if (to.toLowerCase() === (PROJECT_HOT_WALLET as string).toLowerCase()) {
                const amount = parseFloat(ethers.formatUnits(value, 18));
                console.log(`[DEPOSIT DETECTED] From: ${from}, Amount: ${amount} USDT`);

                // 1. Find user by wallet address
                const user = await User.findOne({ walletAddress: from.toLowerCase() });

                if (user) {
                    console.log(`[MATCH FOUND] User: ${user.username} (${user._id})`);

                    // 2. Update user balance
                    user.balance = (user.balance || 0) + amount;
                    await user.save();

                    // 3. Create a record in DepositRequest for history
                    const deposit = new DepositRequest({
                        userId: user._id,
                        username: user.username,
                        amount: amount,
                        slipImage: 'CRYPTO_USDT_BSC',
                        status: 'APPROVED',
                        processedAt: new Date()
                    });
                    await deposit.save();

                    console.log(`✅ Successfully credited ${amount} USDT to ${user.username}`);
                } else {
                    console.log(`[NO MATCH] Wallet ${from} is not bound to any user.`);
                }
            }
        });

    } catch (error) {
        console.error('❌ Monitor Error:', error);
        setTimeout(startMonitor, 10000); // Retry after 10 seconds
    }
}

startMonitor();
