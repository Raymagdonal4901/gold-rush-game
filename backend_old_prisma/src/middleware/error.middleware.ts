// Error Handling Middleware

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors,
        });
    }

    // Prisma Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Unique constraint violation',
                field: (err.meta?.target as string[])?.join(', '),
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'Record not found',
            });
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            error: 'Invalid data provided',
        });
    }

    // Default Error
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};
