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
router.get('/leaderboard', getLeaderboard);

export default router;

