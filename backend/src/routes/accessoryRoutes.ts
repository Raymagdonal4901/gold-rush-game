import express from 'express';
import { buyAccessory, upgradeAccessory, repairEquipment } from '../controllers/accessoryController';
import { enhanceEquipment } from '../controllers/equipmentController';
import { authenticate } from '../middleware/auth';
import craftingRoutes from './craftingRoutes';

const router = express.Router();

router.post('/buy', authenticate, buyAccessory);
router.post('/upgrade', authenticate, upgradeAccessory);
router.post('/enhance', authenticate, enhanceEquipment);
router.post('/repair', authenticate, repairEquipment);

// Crafting sub-routes
router.use('/crafting', craftingRoutes);

export default router;

