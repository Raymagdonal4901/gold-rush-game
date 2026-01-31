// Admin Controller - Full Control Over Game Economy

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, TransactionType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const GiveItemSchema = z.object({
    userId: z.string(),
    itemId: z.string(),
    quantity: z.number().int().positive(),
    itemType: z.enum(['MATERIAL', 'CONSUMABLE', 'EQUIPMENT', 'BLUEPRINT', 'SPECIAL']),
});

const AdjustBalanceSchema = z.object({
    userId: z.string(),
    amount: z.number(),
    currency: z.enum(['cash', 'coin']),
    reason: z.string().optional(),
});

const UpdateConfigSchema = z.object({
    value: z.any(),
    description: z.string().optional(),
});

const BanUserSchema = z.object({
    reason: z.string().optional(),
});

// ============================================
// HELPER: Log Admin Action
// ============================================

async function logAdminAction(
    adminId: string,
    action: string,
    targetUserId: string | null,
    details: any,
    ipAddress?: string
) {
    await prisma.adminLog.create({
        data: {
            adminId,
            action,
            targetUserId,
            details,
            ipAddress,
        },
    });
}

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 50, search, role, banned } = req.query;

        const where: any = {};
        if (search) {
            where.OR = [
                { username: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
            ];
        }
        if (role) where.role = role;
        if (banned !== undefined) where.isBanned = banned === 'true';

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    wallet: true,
                    _count: { select: { machines: true, inventory: true } },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users: users.map(u => ({
                ...u,
                passwordHash: undefined,
                pinHash: undefined,
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                wallet: true,
                machines: true,
                inventory: true,
                transactions: { take: 50, orderBy: { createdAt: 'desc' } },
                marketListings: { take: 20, orderBy: { createdAt: 'desc' } },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            ...user,
            passwordHash: undefined,
            pinHash: undefined,
        });
    } catch (error) {
        next(error);
    }
};

export const banUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = BanUserSchema.parse(req.body);
        const adminId = (req as any).user.id;

        const user = await prisma.user.update({
            where: { id },
            data: {
                isBanned: true,
                banReason: reason || 'No reason provided',
            },
        });

        await logAdminAction(adminId, 'BAN_USER', id, { reason }, req.ip);

        res.json({ success: true, message: `User ${user.username} has been banned` });
    } catch (error) {
        next(error);
    }
};

export const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user.id;

        const user = await prisma.user.update({
            where: { id },
            data: {
                isBanned: false,
                banReason: null,
            },
        });

        await logAdminAction(adminId, 'UNBAN_USER', id, {}, req.ip);

        res.json({ success: true, message: `User ${user.username} has been unbanned` });
    } catch (error) {
        next(error);
    }
};

// ============================================
// ITEM MANAGEMENT
// ============================================

export const giveItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = GiveItemSchema.parse(req.body);
        const adminId = (req as any).user.id;

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: data.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create or update inventory item
        const existingItem = await prisma.inventoryItem.findFirst({
            where: {
                ownerId: data.userId,
                itemId: data.itemId,
                itemType: data.itemType as any,
            },
        });

        if (existingItem) {
            await prisma.inventoryItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + data.quantity },
            });
        } else {
            await prisma.inventoryItem.create({
                data: {
                    ownerId: data.userId,
                    itemId: data.itemId,
                    itemType: data.itemType as any,
                    quantity: data.quantity,
                },
            });
        }

        await logAdminAction(adminId, 'GIVE_ITEM', data.userId, data, req.ip);

        res.json({ success: true, message: `Gave ${data.quantity}x ${data.itemId} to user` });
    } catch (error) {
        next(error);
    }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, itemId, quantity } = req.body;
        const adminId = (req as any).user.id;

        const item = await prisma.inventoryItem.findFirst({
            where: { ownerId: userId, itemId },
        });

        if (!item) {
            return res.status(404).json({ error: 'Item not found in inventory' });
        }

        if (item.quantity <= quantity) {
            await prisma.inventoryItem.delete({ where: { id: item.id } });
        } else {
            await prisma.inventoryItem.update({
                where: { id: item.id },
                data: { quantity: item.quantity - quantity },
            });
        }

        await logAdminAction(adminId, 'REMOVE_ITEM', userId, { itemId, quantity }, req.ip);

        res.json({ success: true, message: `Removed ${quantity}x ${itemId} from user` });
    } catch (error) {
        next(error);
    }
};

// ============================================
// BALANCE MANAGEMENT
// ============================================

export const adjustBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = AdjustBalanceSchema.parse(req.body);
        const adminId = (req as any).user.id;

        const wallet = await prisma.wallet.findUnique({
            where: { userId: data.userId },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'User wallet not found' });
        }

        const balanceBefore = data.currency === 'cash' ? wallet.cashBalance : wallet.coinBalance;

        const updatedWallet = await prisma.wallet.update({
            where: { userId: data.userId },
            data: data.currency === 'cash'
                ? { cashBalance: { increment: data.amount } }
                : { coinBalance: { increment: data.amount } },
        });

        const balanceAfter = data.currency === 'cash' ? updatedWallet.cashBalance : updatedWallet.coinBalance;

        // Log transaction
        await prisma.transaction.create({
            data: {
                userId: data.userId,
                type: TransactionType.ADMIN_ADJUSTMENT,
                amount: data.amount,
                balanceBefore,
                balanceAfter,
                description: data.reason || `Admin adjustment by ${adminId}`,
                metadata: { adminId, currency: data.currency },
            },
        });

        await logAdminAction(adminId, 'ADJUST_BALANCE', data.userId, data, req.ip);

        res.json({ success: true, newBalance: balanceAfter });
    } catch (error) {
        next(error);
    }
};

// ============================================
// GAME CONFIG MANAGEMENT
// ============================================

export const getAllConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.query;

        const where: any = {};
        if (category) where.category = category;

        const configs = await prisma.gameConfig.findMany({
            where,
            orderBy: { category: 'asc' },
        });

        res.json(configs);
    } catch (error) {
        next(error);
    }
};

export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key } = req.params;

        const config = await prisma.gameConfig.findUnique({
            where: { key },
        });

        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
};

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key } = req.params;
        const data = UpdateConfigSchema.parse(req.body);
        const adminId = (req as any).user.id;

        const oldConfig = await prisma.gameConfig.findUnique({ where: { key } });

        const config = await prisma.gameConfig.upsert({
            where: { key },
            update: {
                value: data.value,
                description: data.description,
                updatedBy: adminId,
            },
            create: {
                key,
                value: data.value,
                category: 'custom',
                description: data.description,
                updatedBy: adminId,
            },
        });

        await logAdminAction(adminId, 'UPDATE_CONFIG', null, {
            key,
            oldValue: oldConfig?.value,
            newValue: data.value,
        }, req.ip);

        res.json({ success: true, config });
    } catch (error) {
        next(error);
    }
};

// ============================================
// LOGS & ANALYTICS
// ============================================

export const getTransactionLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 100, type, userId, startDate, endDate } = req.query;

        const where: any = {};
        if (type) where.type = type;
        if (userId) where.userId = userId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) where.createdAt.lte = new Date(endDate as string);
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: { user: { select: { id: true, username: true } } },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json({
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 100, action, adminId } = req.query;

        const where: any = {};
        if (action) where.action = action;
        if (adminId) where.adminId = adminId;

        const [logs, total] = await Promise.all([
            prisma.adminLog.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.adminLog.count({ where }),
        ]);

        res.json({
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            totalUsers,
            totalMachines,
            activeListings,
            todayTransactions,
            totalCashInCirculation,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.machine.count({ where: { isActive: true } }),
            prisma.marketListing.count({ where: { status: 'ACTIVE' } }),
            prisma.transaction.count({
                where: {
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
            }),
            prisma.wallet.aggregate({ _sum: { cashBalance: true } }),
        ]);

        res.json({
            totalUsers,
            totalMachines,
            activeListings,
            todayTransactions,
            totalCashInCirculation: totalCashInCirculation._sum.cashBalance || 0,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
};
