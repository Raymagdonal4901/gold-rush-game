// Authentication Middleware

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface JwtPayload {
    id: string;
    username: string;
    role: UserRole;
}

// ============================================
// AUTHENTICATE JWT
// ============================================

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Verify user still exists and is not banned
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, role: true, isBanned: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.isBanned) {
            return res.status(403).json({ error: 'Account banned' });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        next(error);
    }
};

// ============================================
// REQUIRE ADMIN ROLE
// ============================================

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};

// ============================================
// REQUIRE SUPER ADMIN ROLE
// ============================================

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Super Admin access required' });
    }

    next();
};

// ============================================
// REQUIRE MODERATOR OR HIGHER
// ============================================

export const requireModerator = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const allowedRoles = [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];
    if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Moderator access required' });
    }

    next();
};
