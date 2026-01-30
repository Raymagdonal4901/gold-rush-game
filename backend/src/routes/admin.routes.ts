// Admin Routes

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);

// Item Management
router.post('/give-item', adminController.giveItem);
router.post('/remove-item', adminController.removeItem);

// Balance Management
router.post('/adjust-balance', adminController.adjustBalance);

// Game Config (Super Admin only for critical changes)
router.get('/config', adminController.getAllConfig);
router.get('/config/:key', adminController.getConfig);
router.put('/config/:key', requireSuperAdmin, adminController.updateConfig);

// Logs & Analytics
router.get('/transactions', adminController.getTransactionLogs);
router.get('/admin-logs', requireSuperAdmin, adminController.getAdminLogs);
router.get('/stats', adminController.getSystemStats);

export default router;
