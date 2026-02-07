import express from 'express';
import { getCraftingQueue, startCrafting, claimCraftedItem } from '../controllers/craftingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/queue', authenticate, getCraftingQueue);
router.post('/start', authenticate, startCrafting);
router.post('/claim/:queueId', authenticate, claimCraftedItem);

export default router;
