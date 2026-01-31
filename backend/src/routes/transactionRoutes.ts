import express from 'express';
import { authenticate } from '../middleware/auth';
import { createDepositRequest, getMyDeposits } from '../controllers/transactionController';

const router = express.Router();

router.use(authenticate);

router.post('/deposit', createDepositRequest);
router.get('/deposit/history', getMyDeposits);

export default router;
