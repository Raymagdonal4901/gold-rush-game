import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import {
    getAllUsers, getAllRigs, getSystemConfig, updateSystemConfig,
    getPendingClaims, getPendingWithdrawals, getPendingDeposits, processDepositRequest, processWithdrawalRequest
} from '../controllers/adminController';

const router = express.Router();

// All routes require Authentification AND Admin Role
router.use(authenticate, authorizeAdmin);

router.get('/users', getAllUsers);
router.get('/rigs', getAllRigs);
router.get('/config', getSystemConfig);
router.post('/config', updateSystemConfig);

// Claims / Finance
router.get('/claims', getPendingClaims);
router.get('/withdrawals', getPendingWithdrawals);
router.post('/withdrawals/:id/process', processWithdrawalRequest);
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/process', processDepositRequest);

export default router;
