import express from 'express';
import { checkIn } from '../controllers/dailyBonusController';
import { getLeaderboard, unlockSlot } from '../controllers/userController';
import { activateOverclock, deactivateOverclock } from '../controllers/overclockController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/check-in', authenticate, checkIn);
router.post('/unlock-slot', authenticate, unlockSlot);
router.post('/overclock', authenticate, activateOverclock);
router.post('/overclock/deactivate', authenticate, deactivateOverclock);
router.post('/profile', authenticate, async (req: any, res) => {
    const { walletAddress } = req.body;
    try {
        const User = (await import('../models/User')).default;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (walletAddress) {
            user.walletAddress = walletAddress.toLowerCase();
        }

        await user.save();
        res.json({ success: true, user });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});
router.get('/leaderboard', getLeaderboard);

export default router;

