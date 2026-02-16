import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ message: 'Admins only' });
    }
    next();
};
