import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

const OVERCLOCK_COST = 50; // Baht
const OVERCLOCK_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

export const activateOverclock = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if overclock is already active
        if (user.overclockExpiresAt && new Date(user.overclockExpiresAt).getTime() > Date.now()) {
            return res.status(400).json({ message: 'Overclock is already active' });
        }

        // Check balance
        if (user.balance < OVERCLOCK_COST) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct cost
        user.balance -= OVERCLOCK_COST;

        // Set expiration
        const expiresAt = new Date(Date.now() + OVERCLOCK_DURATION_MS);
        user.overclockExpiresAt = expiresAt;
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

        res.json({
            success: true,
            overclockExpiresAt: expiresAt.getTime(),
            newBalance: user.balance
        });

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

        // Check if overclock is actually active
        const expiryTime = user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() : 0;
        console.log('[Deactivate Overclock] userId:', userId, 'overclockExpiresAt:', user.overclockExpiresAt, 'expiryTime:', expiryTime, 'now:', Date.now());

        if (!expiryTime || expiryTime <= Date.now()) {
            // Already inactive, just return success to maintain idempotent behavior
            return res.json({
                success: true,
                overclockExpiresAt: null,
                newBalance: user.balance
            });
        }

        // Clear expiration (no refund)
        user.overclockExpiresAt = undefined;
        await user.save();

        res.json({
            success: true,
            overclockExpiresAt: null,
            newBalance: user.balance
        });

    } catch (error) {
        console.error('[Deactivate Overclock Error]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
