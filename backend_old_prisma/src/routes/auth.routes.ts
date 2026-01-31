// Auth Routes

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-pin', authenticate, authController.verifyPin);
router.post('/set-pin', authenticate, authController.setPin);
router.get('/me', authenticate, authController.me);

export default router;
