import React from 'react';
import { User } from '../services/types';

interface AdminGuardProps {
    user: User | null;
    children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ user, children }) => {
    // Check if user exists and has admin role
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

    if (!isAdmin) {
        // Kick them out to dashboard if not admin
        console.warn('[AdminGuard] Access denied. Redirecting to dashboard.');
        return null;
    }

    return <>{children}</>;
};
