
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import SystemConfig from '../models/SystemConfig';

export const checkMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Skip check for login/admin routes if needed, but requirements say block API
        // actually, Admin should be able to bypass.
        // req.userId is set by authenticate middleware.

        // If it's a login request, we might not have userId yet.
        // We should check config first.

        const config = await SystemConfig.findOne();
        if (config && config.isMaintenanceMode) {
            // Allow Admin to bypass
            // Requirements: "Users (except Admin) will be blocked"

            // If user is already authenticated (req.role exists)
            if (req.role === 'ADMIN' || req.role === 'SUPER_ADMIN') {
                return next();
            }

            // If it's a login attempt, we might need to let them try to login to check if admin?
            // Or just block everyone at API level except specific admin endpoints?
            // "Login" is usually /api/auth/login.
            // If we block login, admins can't login to turn it off.
            // So we must allow /api/auth/login to proceed, but maybe handle logic there?
            // OR checks req.path?

            if (req.path.startsWith('/api/auth/login')) {
                return next();
            }

            return res.status(503).json({
                message: 'System is under maintenance.',
                maintenance: true
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance check error:', error);
        next(); // Fail open or closed? Fail open for now to avoid locking out if DB fails
    }
};
