import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                await api.getMe();
                setIsAuthenticated(true);
            } catch (error) {
                console.error('[AUTH_GUARD] Session invalid', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                <div className="text-yellow-500 font-black animate-pulse text-xs tracking-[0.4em] uppercase">
                    Verifying Credentials...
                </div>
            </div>
        );
    }

    if (isAuthenticated === false) {
        // We handle redirection in App.tsx by switching views, 
        // but for a strict guard, we could force a refresh or similar.
        // For now, we rely on App.tsx observing the lack of user.
        return null;
    }

    return <>{children}</>;
};
