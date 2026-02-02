import axios from 'axios';
export interface GlobalStats {
    onlineMiners: number;
    totalOreMined: number;
    marketVolume: number;
}
export interface UserStats {
    totalDeposits: number;
    totalWithdrawals: number;
}
import { User, OilRig, AccessoryItem, ClaimRequest, WithdrawalRequest, DepositRequest, Transaction } from './types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

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

    refillEnergy: async (): Promise<{ cost: number, balance: number, energy: number }> => {
        const res = await client.post('/auth/refill-energy');
        return res.data;
    },

    refillRigEnergy: async (rigId: string): Promise<{ cost: number, balance: number, energy: number }> => {
        const res = await client.post(`/rigs/${rigId}/refill`);
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

    buyRig: async (name: string, investment: number, dailyProfit: number, durationDays: number, repairCost?: number, energyCostPerDay?: number, bonusProfit?: number): Promise<{ rig: OilRig, glove: AccessoryItem }> => {
        const res = await client.post('/rigs/buy', { name, investment, dailyProfit, durationDays, repairCost, energyCostPerDay, bonusProfit });
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
    createWithdrawalRequest: async (amount: number, pin: string): Promise<any> => {
        const res = await client.post('/transactions/withdraw', { amount, pin });
        return res.data;
    },
    claimReward: async (rigId: string, amount: number): Promise<any> => {
        const res = await client.post('/transactions/claim', { rigId, amount });
        return res.data;
    },
    getMyHistory: async (): Promise<Transaction[]> => {
        const res = await client.get('/transactions/history');
        return res.data.map(mapBackendTransactionToFrontend);
    },
    getGlobalStats: async (): Promise<GlobalStats> => {
        const res = await client.get('/transactions/stats');
        return res.data;
    },


    // Quests
    getQuestStatus: async (): Promise<{ weeklyStats: any, lastQuestReset: number, claimedQuests: string[] }> => {
        const res = await client.get('/quests/status');
        return res.data;
    },

    claimQuestReward: async (questId: string): Promise<any> => {
        const res = await client.post('/quests/claim', { questId });
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
        getPendingClaims: async (): Promise<ClaimRequest[]> => {
            const res = await client.get('/admin/claims');
            return res.data.map(mapBackendClaimToFrontend);
        },
        getPendingWithdrawals: async (): Promise<WithdrawalRequest[]> => {
            const res = await client.get('/admin/withdrawals');
            return res.data.map(mapBackendWithdrawalToFrontend);
        },
        getPendingDeposits: async (): Promise<DepositRequest[]> => {
            const res = await client.get('/admin/deposits');
            return res.data.map(mapBackendDepositToFrontend);
        },
        processDeposit: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
            const res = await client.post(`/admin/deposits/${id}/process`, { status });
            return res.data;
        },
        processWithdrawal: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
            const res = await client.post(`/admin/withdrawals/${id}/process`, { status });
            return res.data;
        },
        getUserStats: async (userId: string): Promise<UserStats> => {
            const res = await client.get(`/admin/users/${userId}/stats`);
            return res.data;
        },
        giveCompensation: async (userId: string, amount: number, reason: string): Promise<any> => {
            const res = await client.post('/admin/users/compensation', { userId, amount, reason });
            return res.data;
        },
        addItem: async (userId: string, itemId: string, amount: number): Promise<any> => {
            const res = await client.post('/admin/users/items', { userId, itemId, amount });
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
        bonusProfit: backendRig.bonusProfit || 0,
        status: backendRig.status,
        slots: backendRig.slots || [],
        repairCost: backendRig.repairCost || 0,
        energyCostPerDay: backendRig.energyCostPerDay || 0,
        expiresAt: new Date(backendRig.expiresAt).getTime(),
        energy: backendRig.energy !== undefined ? backendRig.energy : 100,
        lastEnergyUpdate: backendRig.lastEnergyUpdate ? new Date(backendRig.lastEnergyUpdate).getTime() : new Date(backendRig.purchaseDate || backendRig.createdAt || Date.now()).getTime()
    } as OilRig;
};

const mapBackendGloveToFrontend = (backendGlove: any): AccessoryItem => {
    if (!backendGlove) return {} as AccessoryItem;
    return {
        id: backendGlove._id || backendGlove.id,
        typeId: backendGlove.typeId || backendGlove.type || 'glove_common',
        name: backendGlove.name,
        price: backendGlove.price || 0,
        dailyBonus: backendGlove.dailyBonus || 0,
        durationBonus: backendGlove.durationBonus || 0,
        rarity: backendGlove.rarity,
        purchasedAt: new Date(backendGlove.purchasedAt || Date.now()).getTime(),
        lifespanDays: backendGlove.lifespanDays || 30,
        expireAt: new Date(backendGlove.expireAt || Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(),
        level: backendGlove.level || 1,
        // Optional fields that might be in backendGlove or not
        isHandmade: backendGlove.isHandmade,
        specialEffect: backendGlove.specialEffect
    } as AccessoryItem;
};

const mapBackendDepositToFrontend = (d: any): DepositRequest => ({
    id: d._id || d.id,
    userId: d.userId,
    username: d.username,
    amount: d.amount,
    slipImage: d.slipImage,
    timestamp: new Date(d.createdAt || d.timestamp).getTime(),
    status: d.status,
    transactionId: d.transactionId
});

const mapBackendWithdrawalToFrontend = (w: any): WithdrawalRequest => ({
    id: w._id || w.id,
    userId: w.userId,
    username: w.username,
    amount: w.amount,
    timestamp: new Date(w.createdAt || w.timestamp).getTime(),
    status: w.status,
    transactionId: w.transactionId
});

const mapBackendClaimToFrontend = (c: any): ClaimRequest => ({
    id: c._id || c.id,
    userId: c.userId,
    username: c.username,
    rigId: c.rigId,
    rigName: c.rigName,
    amount: c.amount,
    timestamp: new Date(c.createdAt || c.timestamp).getTime(),
    status: c.status,
    transactionId: c.transactionId
});

const mapBackendTransactionToFrontend = (tx: any): Transaction => ({
    id: tx._id || tx.id,
    userId: tx.userId,
    type: tx.type,
    amount: tx.amount,
    timestamp: new Date(tx.createdAt || tx.timestamp).getTime(),
    status: tx.status === 'APPROVED' ? 'COMPLETED' : tx.status,
    description: tx.description || (
        tx.type === 'DEPOSIT' ? 'ฝากเงินเข้าระบบ' :
            tx.type === 'WITHDRAWAL' ? 'ถอนเงินออกจากระบบ' :
                tx.type === 'MINING_CLAIM' ? `รับรายได้จาก ${tx.rigName || 'เครื่องขุด'}` :
                    'รายการอื่นๆ'
    )
});
