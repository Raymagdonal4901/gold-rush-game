
import express from 'express';
import { getQuestStatus, claimQuestReward } from '../controllers/questController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/status', authenticate, getQuestStatus);
router.post('/claim', authenticate, claimQuestReward);

export default router;
