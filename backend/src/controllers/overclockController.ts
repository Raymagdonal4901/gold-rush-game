import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

const EXCHANGE_RATE = 1;
const OVERCLOCK_COST_THB = 50;
const OVERCLOCK_COST = OVERCLOCK_COST_THB; // 1:1 direct Baht
const OVERCLOCK_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

export const activateOverclock = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Check if already active
        if (user.isOverclockActive) {
            return res.status(400).json({ message: 'Overclock is already active' });
        }

        // 2. Decide if Resume or Purchase
        let expiresAt: Date;
        if (user.overclockRemainingMs > 0) {
            // RESUME
            expiresAt = new Date(Date.now() + user.overclockRemainingMs);
            user.isOverclockActive = true;
            user.overclockExpiresAt = expiresAt;
            // Clear remainingMs as it's now live in ExpiresAt
            user.overclockRemainingMs = 0;
            await user.save();

            return res.json({
                success: true,
                message: 'Overclock resumed',
                overclockExpiresAt: expiresAt.getTime(),
                newBalance: user.balance,
                isResume: true
            });
        } else {
            // PURCHASE
            if (user.balance < OVERCLOCK_COST) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Deduct cost
            user.balance -= OVERCLOCK_COST;

            // Set expiration
            expiresAt = new Date(Date.now() + OVERCLOCK_DURATION_MS);
            user.overclockExpiresAt = expiresAt;
            user.isOverclockActive = true;
            user.overclockRemainingMs = 0;
            await user.save();

            // Log transaction
            await Transaction.create({
                userId,
                type: 'ENERGY_REFILL',
                amount: OVERCLOCK_COST,
                description: 'เร่งพลังการผลิต (Overclock 48 ชม.)',
                status: 'COMPLETED',
                timestamp: new Date()
            });

            return res.json({
                success: true,
                overclockExpiresAt: expiresAt.getTime(),
                newBalance: user.balance,
                isResume: false
            });
        }

    } catch (error) {
        console.error('[Overclock Error]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deactivateOverclock = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If already inactive/paused, return
        if (!user.isOverclockActive) {
            return res.json({
                success: true,
                overclockExpiresAt: null,
                overclockRemainingMs: user.overclockRemainingMs,
                newBalance: user.balance
            });
        }

        // Calculate remaining time
        const now = Date.now();
        const expiryTime = user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() : 0;
        const remainingMs = Math.max(0, expiryTime - now);

        // Pause
        user.isOverclockActive = false;
        user.overclockRemainingMs = remainingMs;
        user.overclockExpiresAt = undefined;
        await user.save();

        res.json({
            success: true,
            overclockExpiresAt: null,
            overclockRemainingMs: remainingMs,
            newBalance: user.balance
        });

    } catch (error) {
        console.error('[Deactivate Overclock Error]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
