import axios from 'axios';
import { User, OilRig, AccessoryItem } from './types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://192.168.100.234:5000/api';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    // Auth
    register: async (username: string, password?: string, pin?: string): Promise<User> => {
        const res = await client.post('/auth/register', { username, password });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data.user;
    },

    login: async (username: string, password?: string, pin?: string): Promise<User> => {
        const res = await client.post('/auth/login', { username, password, pin });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data.user;
    },

    getMe: async (): Promise<User> => {
        const res = await client.get('/auth/me');
        return res.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // Rigs
    getMyRigs: async (): Promise<OilRig[]> => {
        const res = await client.get('/rigs');
        return res.data.map(mapBackendRigToFrontend);
    },

    buyRig: async (name: string, investment: number, dailyProfit: number, durationDays: number): Promise<{ rig: OilRig, glove: AccessoryItem }> => {
        const res = await client.post('/rigs/buy', { name, investment, dailyProfit, durationDays });
        return {
            rig: mapBackendRigToFrontend(res.data.rig),
            glove: mapBackendGloveToFrontend(res.data.glove)
        };
    },

    // Transactions
    createDepositRequest: async (amount: number, slipImage: string): Promise<any> => {
        const res = await client.post('/transactions/deposit', { amount, slipImage });
        return res.data;
    },
    createWithdrawalRequest: async (amount: number): Promise<any> => {
        const res = await client.post('/transactions/withdraw', { amount });
        return res.data;
    },
    claimReward: async (rigId: string, amount: number): Promise<any> => {
        const res = await client.post('/transactions/claim', { rigId, amount });
        return res.data;
    },

    // Admin API
    admin: {
        getUsers: async (): Promise<User[]> => {
            const res = await client.get('/admin/users');
            return res.data;
        },
        getRigs: async (): Promise<OilRig[]> => {
            const res = await client.get('/admin/rigs');
            // We need to map rigs here too if format differs
            return res.data.map(mapBackendRigToFrontend);
        },
        getSystemConfig: async (): Promise<any> => {
            const res = await client.get('/admin/config');
            return res.data;
        },
        updateSystemConfig: async (data: { receivingQrCode?: string, isMaintenanceMode?: boolean }): Promise<any> => {
            const res = await client.post('/admin/config', data);
            return res.data;
        },
        getPendingClaims: async (): Promise<any[]> => {
            const res = await client.get('/admin/claims');
            return res.data;
        },
        getPendingWithdrawals: async (): Promise<any[]> => {
            const res = await client.get('/admin/withdrawals');
            return res.data;
        },
        getPendingDeposits: async (): Promise<any[]> => {
            const res = await client.get('/admin/deposits');
            return res.data;
        },
        processDeposit: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
            const res = await client.post(`/admin/deposits/${id}/process`, { status });
            return res.data;
        },
        processWithdrawal: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
            const res = await client.post(`/admin/withdrawals/${id}/process`, { status });
            return res.data;
        }
    }
};

// Helper to map backend rig to frontend rig
const mapBackendRigToFrontend = (backendRig: any): OilRig => {
    if (!backendRig) return {} as OilRig;
    return {
        id: backendRig._id || backendRig.id,
        ownerId: backendRig.ownerId,
        name: backendRig.name,
        investment: backendRig.investment,
        durationMonths: 1, // Default or calculate from expiresAt
        dailyProfit: backendRig.dailyProfit,
        ratePerSecond: backendRig.dailyProfit / 86400,
        purchasedAt: new Date(backendRig.purchasedAt || backendRig.createdAt).getTime(),
        lastClaimAt: Date.now(),
        rarity: backendRig.rarity as any,
        bonusProfit: 0,
        status: backendRig.status,
        slots: backendRig.slots || []
    } as OilRig;
};

const mapBackendGloveToFrontend = (backendGlove: any): AccessoryItem => {
    if (!backendGlove) return {} as AccessoryItem;
    return {
        id: backendGlove._id || backendGlove.id,
        name: backendGlove.name,
        type: backendGlove.type,
        effect: backendGlove.effect,
        value: backendGlove.value,
        rarity: backendGlove.rarity,
        durability: backendGlove.durability,
        maxDurability: backendGlove.maxDurability,
        level: backendGlove.level,
        equippedSlot: backendGlove.equippedSlot
    } as AccessoryItem;
};
