import express from 'express';
import { register, login, seedAdmin, getProfile, refillEnergy, updateBankQr, getPublicConfig, getLandingStats } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/config', getPublicConfig);
router.get('/stats', getLandingStats);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.post('/refill-energy', authenticate, refillEnergy);
router.get('/seed-admin', seedAdmin);
router.post('/update-bank-qr', authenticate, updateBankQr);

export default router;