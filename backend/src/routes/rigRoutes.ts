import express from 'express';
import { getMyRigs, buyRig, refillRigEnergy } from '../controllers/rigController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getMyRigs);
router.post('/buy', authenticate, buyRig);
router.post('/:id/refill', authenticate, refillRigEnergy);

export default router;
