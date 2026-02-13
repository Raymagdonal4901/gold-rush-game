import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import {
    getAllUsers, getAllRigs, getSystemConfig, updateSystemConfig,
    getPendingClaims, getPendingWithdrawals, getPendingDeposits, processDepositRequest, processWithdrawalRequest, getUserStats,
    adminGiveCompensation, adminGiveCompensationAll, adminAddItem, getGlobalRevenueStats, deleteUser, clearRevenueStats, adminConvertCurrencyToUSD, resetAllBalances, deleteRig, adminAdjustRevenue,
    resetUser, removeVip
} from '../controllers/adminController';

const router = express.Router();

// All routes require Authentification AND Admin Role
router.use(authenticate, authorizeAdmin);

router.get('/users', getAllUsers);
router.get('/users/:userId/stats', getUserStats);
router.post('/users/compensation', adminGiveCompensation);
router.post('/users/compensation-all', adminGiveCompensationAll);
router.post('/users/items', adminAddItem);
router.get('/rigs', getAllRigs);
router.get('/config', getSystemConfig);
router.post('/config', updateSystemConfig);

// Claims / Finance
router.get('/claims', getPendingClaims);
router.get('/withdrawals', getPendingWithdrawals);
router.post('/withdrawals/:id/process', processWithdrawalRequest);
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/process', processDepositRequest);
router.delete('/users/:userId', deleteUser);
router.delete('/rigs/:rigId', deleteRig);
router.post('/revenue/clear', clearRevenueStats);
router.post('/revenue/adjust', adminAdjustRevenue);
router.get('/revenue', getGlobalRevenueStats);

router.post('/users/reset-balances', resetAllBalances);
router.post('/convert-currency', adminConvertCurrencyToUSD);
router.post('/users/:userId/reset', resetUser);
router.post('/users/:userId/remove-vip', removeVip);


export default router;
