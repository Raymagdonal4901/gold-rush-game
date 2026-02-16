import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    userId?: string;
    username?: string;
    role?: string;
    user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Fetch full user and attach to request
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.userId = decoded.userId;
        req.username = decoded.username;
        req.role = user.role; // Use role from DB for security

        if (user.isBanned) {
            return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
