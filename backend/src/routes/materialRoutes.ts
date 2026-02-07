import express from 'express';
import { authenticate } from '../middleware/auth';
import { craftMaterial, sellMaterial, buyMaterial, getMarketStatus } from '../controllers/materialController';

const router = express.Router();

// Craft Material
router.post('/craft', authenticate, craftMaterial);

// Buy Material
router.post('/buy', authenticate, buyMaterial);

// Sell Material
router.post('/sell', authenticate, sellMaterial);

// Market Status
router.get('/market', authenticate, getMarketStatus);

export default router;
