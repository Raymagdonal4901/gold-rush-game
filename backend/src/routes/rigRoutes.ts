import express from 'express';
import { getMyRigs, buyRig } from '../controllers/rigController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getMyRigs);
router.post('/buy', authenticate, buyRig);

export default router;
