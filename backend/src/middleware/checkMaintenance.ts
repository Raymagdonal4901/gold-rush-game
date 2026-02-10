
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

        // Bypass for Auth and Admin routes
        if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
            return next();
        }

        const config = await SystemConfig.findOne();
        if (config && config.isMaintenanceMode) {
            // Additional check: If user is authenticated via header manually (since this runs before auth middleware)
            // We can try to decode strictly for other routes if needed, but for now blocking all NON-ADMIN routes is the goal.
            // Since we allowed /api/admin, admins can use the dashboard.
            // Game routes (/api/rigs, etc.) will be blocked.

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
