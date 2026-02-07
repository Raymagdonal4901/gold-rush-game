import express from 'express';
import { startExpedition, claimExpedition, skipExpeditionTime } from '../controllers/dungeonController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/start', authenticate, startExpedition);
router.post('/claim', authenticate, claimExpedition);
router.post('/skip', authenticate, skipExpeditionTime);

export default router;
