import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import {
    getAllUsers, getAllRigs, getSystemConfig, updateSystemConfig,
    getPendingClaims, getPendingWithdrawals, getPendingDeposits, processDepositRequest, getUserStats,
    adminGiveCompensation, adminGiveCompensationAll, adminAddItem, getGlobalRevenueStats, deleteUser, clearRevenueStats, adminConvertCurrencyToUSD, resetAllPlayerData, deleteRig, adminAdjustRevenue, adminAddRig,
    resetUser, removeVip, getDashboardStats, processWithdrawal, processLegacyWithdrawalRequest, getRevenueStats, deleteAllUsers, toggleBan
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
router.put('/withdrawals/:id', processWithdrawal); // NEW for Part 6
router.post('/withdrawals/:id/process', processLegacyWithdrawalRequest); // Keep legacy if needed
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/process', processDepositRequest);
router.delete('/users/:userId', deleteUser);
router.delete('/rigs/:rigId', deleteRig);
router.post('/revenue/clear', clearRevenueStats);
router.post('/revenue/adjust', adminAdjustRevenue);
router.get('/revenue', getGlobalRevenueStats);
router.get('/revenue-stats', getRevenueStats);
router.get('/stats', getDashboardStats); // NEW for Part 6

router.post('/users/reset-all', resetAllPlayerData);
router.post('/users/delete-all', deleteAllUsers);
router.post('/convert-currency', adminConvertCurrencyToUSD);
router.post('/users/:userId/reset', resetUser);
router.post('/users/:userId/remove-vip', removeVip);
router.post('/users/:userId/toggle-ban', toggleBan);
router.post('/users/:userId/rigs', adminAddRig);


export default router;
