import express from 'express';
import { upgradeItem } from '../controllers/upgradeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, upgradeItem);

export default router;
