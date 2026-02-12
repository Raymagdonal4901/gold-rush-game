import express from 'express';
import { getCraftingQueue, startCrafting, claimCraftedItem, useTimeSkip } from '../controllers/craftingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/queue', authenticate, getCraftingQueue);
router.post('/start', authenticate, startCrafting);
router.post('/claim/:queueId', authenticate, claimCraftedItem);
router.post('/use-skip', authenticate, useTimeSkip);

export default router;

