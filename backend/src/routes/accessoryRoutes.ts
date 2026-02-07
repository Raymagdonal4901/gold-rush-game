import express from 'express';
import { buyAccessory, upgradeAccessory } from '../controllers/accessoryController';
import { authenticate } from '../middleware/auth';
import craftingRoutes from './craftingRoutes';

const router = express.Router();

router.post('/buy', authenticate, buyAccessory);
router.post('/upgrade', authenticate, upgradeAccessory);

// Crafting sub-routes
router.use('/crafting', craftingRoutes);

export default router;
