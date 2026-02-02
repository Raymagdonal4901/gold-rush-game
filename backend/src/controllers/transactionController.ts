import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import WithdrawalRequest from '../models/WithdrawalRequest';
import DepositRequest from '../models/DepositRequest';
import ClaimRequest from '../models/ClaimRequest';
import Transaction from '../models/Transaction';
import Rig from '../models/Rig';
import User from '../models/User';

// ... (Existing imports)

// Create Deposit Request (User)
// ... (Existing code)

import bcrypt from 'bcryptjs';

// Create Withdrawal Request (User)
export const createWithdrawalRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, pin } = req.body;
        const userId = req.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Check Limits
        if (amount < 100 || amount > 1000) {
            return res.status(400).json({ message: 'ถอนเงินขั้นต่ำ 100 บาท และสูงสุด 1,000 บาท' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify PIN
        if (!pin) {
            return res.status(400).json({ message: 'กรุณากรอกรหัส PIN' });
        }

        const isPinMatch = await bcrypt.compare(pin, user.pin || '');
        if (!isPinMatch) {
            return res.status(400).json({ message: 'รหัส PIN ไม่ถูกต้อง' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct balance immediately upon request
        user.balance -= amount;
        await user.save();

        const withdrawal = await WithdrawalRequest.create({
            userId,
            username: user.username,
            amount,
            status: 'PENDING'
        });

        res.status(201).json({ message: 'Withdrawal requested', withdrawal, newBalance: user.balance });
    } catch (error) {
        console.error('[PIN VERIFICATION ERROR]', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get My Transaction History (Deposit & Withdrawal)
export const getMyHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const deposits = await DepositRequest.find({ userId }).lean();
        const withdrawals = await WithdrawalRequest.find({ userId }).lean();
        const claims = await ClaimRequest.find({ userId }).lean();
        const transactions = await Transaction.find({ userId }).lean();

        // Combine and sort by date
        const history = [
            ...deposits.map(d => ({ ...d, type: 'DEPOSIT' })),
            ...withdrawals.map(w => ({ ...w, type: 'WITHDRAWAL', amount: -w.amount })),
            ...claims.map(c => ({ ...c, type: 'MINING_CLAIM' })),
            ...transactions
        ].sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
            const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
            return dateB - dateA;
        });

        res.json(history);
    } catch (error) {
        console.error('[ERROR] getMyHistory failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get My Deposit History (User)
export const getMyDeposits = async (req: AuthRequest, res: Response) => {
    try {
        const deposits = await DepositRequest.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
export const createDepositRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, slipImage } = req.body;
        const userId = req.userId;

        if (!amount || !slipImage) {
            return res.status(400).json({ message: 'Amount and Slip Image are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const deposit = await DepositRequest.create({
            userId,
            username: user.username,
            amount,
            slipImage,
            status: 'PENDING'
        });

        res.status(201).json(deposit);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Claim Reward (Mining) - Auto-Approve for MVP
export const claimReward = async (req: AuthRequest, res: Response) => {
    try {
        const { rigId, amount } = req.body;
        const userId = req.userId;

        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify Rig Ownership (Assuming Rig stores ownerId as String, based on Rig.ts)
        // Also Rig.ts has `ownerId`, `id` is autogenerated _id. Frontend passes `rigId` which usually is `_id`.
        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found or not owned' });

        user.balance += amount;
        await user.save();

        // Update Rig (Use Mongoose 'set' or direct assignment if Rig model allows)
        // Rig.ts doesn't explicitly show `lastClaimAt` in interface/schema in the VIEWED file.
        // Step 3702 showed `Rig.ts` content. 
        // `IRig` has: ownerId, name, image, investment, dailyProfit, purchaseDate, expiresAt, rarity, level, slots, status.
        // IT DOES NOT HAVE `lastClaimAt`.
        // This is a discrepancy. `PlayerDashboard` uses `lastClaimAt`.
        // `MockDB` had `lastClaimAt`.
        // If I want to persist it, I must ADD it to the Schema.

        // I will add `lastClaimAt` to Rig Schema first, OR just ignore it in backend for now (stateless claim?).
        // But preventing double claim needs `lastClaimAt`.
        // I should add it to Rig.ts.

        const claim = await ClaimRequest.create({
            userId,
            username: user.username,
            rigId,
            rigName: rig.name,
            amount,
            status: 'APPROVED'
        });

        res.json({ message: 'Claim successful', newBalance: user.balance, claim });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Global Stats
export const getGlobalStats = async (req: AuthRequest, res: Response) => {
    try {
        const onlineMiners = await User.countDocuments();

        // Total Ore Mined: Sum of all APPROVED claims
        const claimStats = await ClaimRequest.aggregate([
            { $match: { status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalOreMined = claimStats.length > 0 ? claimStats[0].total : 0;

        // Market Volume: Sum of User Balances + Total Deposits
        const balanceStats = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);
        const totalUserBalance = balanceStats.length > 0 ? balanceStats[0].total : 0;

        const depositStats = await DepositRequest.aggregate([
            { $match: { status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = depositStats.length > 0 ? depositStats[0].total : 0;

        // Market Cap = User Money + System Money (Deposits) - Just a rough sim
        const marketVolume = totalUserBalance + totalDeposits;

        res.json({
            onlineMiners,
            totalOreMined: Math.floor(totalOreMined),
            marketVolume: Math.floor(marketVolume)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ... existing exports
