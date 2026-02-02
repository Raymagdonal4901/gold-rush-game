import express from 'express';
import { register, login, seedAdmin, getProfile, refillEnergy } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.post('/refill-energy', authenticate, refillEnergy);
router.get('/seed-admin', seedAdmin);

export default router;