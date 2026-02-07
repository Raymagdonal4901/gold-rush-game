import express from 'express';
import { getQuestStatus, claimQuestReward, claimAchievement, claimRankReward } from '../controllers/questController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/status', authenticate, getQuestStatus);
router.post('/claim', authenticate, claimQuestReward);
router.post('/achievement/claim', authenticate, claimAchievement);
router.post('/rank/claim', authenticate, claimRankReward);

export default router;
