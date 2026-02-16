import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { requestWithdraw, getWalletHistory, adminApproveWithdraw } from '../controllers/walletController';

const router = express.Router();

// User routes
router.post('/withdraw', authenticate, requestWithdraw);
router.get('/history', authenticate, getWalletHistory);

// Admin routes
router.post('/admin/approve', authenticate, authorizeAdmin, adminApproveWithdraw);

export default router;
