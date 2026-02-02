import express from 'express';
import { authenticate } from '../middleware/auth';
import { createDepositRequest, getMyDeposits, createWithdrawalRequest, claimReward, getMyHistory, getGlobalStats } from '../controllers/transactionController';

const router = express.Router();

router.use(authenticate);

router.post('/deposit', createDepositRequest);
router.get('/deposit/history', getMyDeposits);
router.post('/withdraw', createWithdrawalRequest);
router.post('/claim', claimReward);
router.get('/history', getMyHistory);
router.get('/stats', getGlobalStats);

export default router;
