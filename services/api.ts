import axios from 'axios';
export interface GlobalStats {
    onlineMiners: number;
    totalOreMined: number;
    marketVolume: number;
}
export interface UserStats {
    totalDeposits: number;
    totalWithdrawals: number;
    withdrawalHistory?: WithdrawalRequest[];
    depositHistory?: DepositRequest[];
}
import { User, OilRig, AccessoryItem, ClaimRequest, WithdrawalRequest, DepositRequest, Transaction, ChatMessage, MarketState, CraftingQueueItem } from './types';

const isProd = (import.meta as any).env.PROD;
const API_URL = (import.meta as any).env.VITE_API_URL ||
    (import.meta as any).env.NEXT_PUBLIC_API_URL ||
    (isProd ? '/api' : 'http://localhost:5001/api');

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
    register: async (username: string, password?: string, pin?: string, referralCode?: string): Promise<User> => {
        const res = await client.post('/auth/register', { username, password, pin, referralCode });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        const user = res.data.user;
        return {
            ...user,
            id: user.id || user._id,
            inventory: user.inventory || [],
            notifications: user.notifications || [],
            claimedRanks: user.claimedRanks || [],
            stats: user.stats || {
                totalMaterialsMined: 0,
                totalMoneySpent: 0,
                totalLogins: 0,
                luckyDraws: 0,
                questsCompleted: 0
            }
        } as User;
    },

    login: async (username: string, password?: string, pin?: string): Promise<User> => {
        const res = await client.post('/auth/login', { username, password, pin });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }

        // Ensure user object has all required fields to satisfy the 'User' interface
        const user = res.data.user;
        return {
            ...user,
            id: user.id || user._id,
            inventory: user.inventory || [],
            notifications: user.notifications || [],
            claimedRanks: user.claimedRanks || [],
            stats: user.stats || {
                totalMaterialsMined: 0,
                totalMoneySpent: 0,
                totalLogins: 0,
                luckyDraws: 0,
                questsCompleted: 0
            }
        } as User;
    },

    getMe: async (): Promise<User> => {
        const res = await client.get('/auth/me');
        const user = res.data;
        return {
            ...user,
            id: user.id || user._id,
            inventory: user.inventory || [],
            notifications: user.notifications || [],
            claimedRanks: user.claimedRanks || [],
            stats: user.stats || {
                totalMaterialsMined: 0,
                totalMoneySpent: 0,
                totalLogins: 0,
                luckyDraws: 0,
                questsCompleted: 0
            }
        } as User;
    },

    refillEnergy: async (): Promise<{ cost: number, balance: number, energy: number }> => {
        const res = await client.post('/auth/refill-energy');
        return res.data;
    },

    refillRigEnergy: async (rigId: string): Promise<{ cost: number, balance: number, energy: number }> => {
        const res = await client.post(`/rigs/${rigId}/refill`);
        return res.data;
    },
    repairRig: async (rigId: string): Promise<{ cost: number, balance: number, message: string }> => {
        const res = await client.post(`/rigs/${rigId}/repair`);
        return res.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // System
    getSystemConfig: async (): Promise<{ isMaintenanceMode: boolean, receivingQrCode: string | null }> => {
        const res = await client.get('/auth/config');
        return res.data;
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
    craftRig: async (name: string): Promise<{ rig: OilRig, glove?: AccessoryItem, success: boolean }> => {
        const res = await client.post('/rigs/craft', { name });
        return {
            rig: mapBackendRigToFrontend(res.data.rig),
            glove: res.data.glove ? mapBackendGloveToFrontend(res.data.glove) : undefined,
            success: res.data.success
        };
    },

    // Transactions
    createDepositRequest: async (amount: number, slipImage: string): Promise<any> => {
        const res = await client.post('/transactions/deposit', { amount, slipImage });
        return res.data;
    },
    createWithdrawalRequest: async (amount: number, pin: string, method?: 'BANK' | 'USDT', walletAddress?: string): Promise<any> => {
        const res = await client.post('/transactions/withdraw', { amount, pin, method, walletAddress });
        return res.data;
    },
    claimReward: async (rigId: string, amount: number): Promise<any> => {
        const res = await client.post(`/rigs/${rigId}/claim`, { amount });
        return res.data;
    },
    collectMaterials: async (rigId: string, amount: number, tier: number): Promise<any> => {
        const res = await client.post(`/rigs/${rigId}/collect`, { amount, tier });
        return res.data;
    },
    claimRigGift: async (rigId: string): Promise<any> => {
        const res = await client.post(`/rigs/${rigId}/claim-gift`);
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

    getMarketStatus: async (): Promise<MarketState> => {
        const res = await client.get('/transactions/market');
        return res.data;
    },


    // Accessories
    buyAccessory: async (item: Partial<AccessoryItem>): Promise<any> => {
        const response = await client.post('/accessories/buy', item);
        return response.data;
    },

    equipAccessory: async (rigId: string, itemId: string, slotIndex: number): Promise<any> => {
        const response = await client.post(`/rigs/${rigId}/equip`, { itemId, slotIndex });
        return response.data;
    },

    unequipAccessory: async (rigId: string, slotIndex: number): Promise<any> => {
        const response = await client.post(`/rigs/${rigId}/unequip`, { slotIndex });
        return response.data;
    },
    destroyRig: async (rigId: string): Promise<any> => {
        const response = await client.post(`/rigs/${rigId}/destroy`);
        return response.data;
    },

    upgradeAccessory: async (itemId: string, useInsurance: boolean): Promise<any> => {
        const response = await client.post('/accessories/upgrade', { itemId, useInsurance });
        return response.data;
    },
    inventory: {
        sell: async (itemId: string): Promise<any> => {
            const res = await client.post(`/accessories/sell/${itemId}`);
            return res.data;
        },
        upgrade: async (itemId: string, useInsurance: boolean): Promise<any> => {
            const res = await client.post(`/accessories/upgrade`, { itemId, useInsurance });
            return res.data;
        }
    },
    craftMaterial: async (sourceTier: number): Promise<any> => {
        const res = await client.post('/materials/craft', { sourceTier });
        return res.data;
    },
    sellMaterial: async (tier: number, amount: number): Promise<any> => {
        const res = await client.post('/materials/sell', { tier, amount });
        return res.data;
    },
    buyMaterial: async (tier: number, amount: number): Promise<any> => {
        const res = await client.post('/materials/buy', { tier, amount });
        return res.data;
    },
    playLuckyDraw: async (): Promise<any> => {
        const res = await client.post('/users/lucky-draw');
        return res.data;
    },
    crafting: {
        getQueue: async (): Promise<CraftingQueueItem[]> => {
            const res = await client.get('/accessories/crafting/queue');
            return res.data.queue || []; // Backend returns { queue: [...] }
        },
        start: async (itemId: string): Promise<any> => {
            const res = await client.post('/accessories/crafting/start', { itemId });
            return res.data;
        },
        claim: async (queueId: string): Promise<any> => {
            const res = await client.post(`/accessories/crafting/claim/${queueId}`);
            return res.data;
        }
    },


    // Quests
    getQuestStatus: async (): Promise<{ weeklyStats: any, lastQuestReset: number, nextResetAt: number, claimedQuests: string[] }> => {
        const res = await client.get('/quests/status');
        return res.data;
    },

    claimQuestReward: async (questId: string): Promise<any> => {
        const res = await client.post('/quests/claim', { questId });
        return res.data;
    },
    claimAchievement: async (achId: string): Promise<any> => {
        const res = await client.post('/quests/achievement/claim', { achId });
        return res.data;
    },
    claimRankReward: async (rankId: string): Promise<any> => {
        const res = await client.post('/quests/rank/claim', { rankId });
        return res.data;
    },

    getLeaderboard: async (): Promise<any[]> => {
        const res = await client.get('/users/leaderboard');
        return res.data;
    },

    // Admin API
    admin: {
        getUsers: async (): Promise<User[]> => {
            const res = await client.get('/admin/users');
            // Ensure every user in the list has required fields
            return res.data.map((user: any) => ({
                ...user,
                id: user.id || user._id,
                inventory: user.inventory || [],
                notifications: user.notifications || [],
                claimedRanks: user.claimedRanks || [],
                stats: user.stats || {
                    totalMaterialsMined: 0,
                    totalMoneySpent: 0,
                    totalLogins: 0,
                    luckyDraws: 0,
                    questsCompleted: 0
                }
            })) as User[];
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
            const data = res.data;
            if (data.withdrawalHistory) {
                data.withdrawalHistory = data.withdrawalHistory.map(mapBackendWithdrawalToFrontend);
            }
            if (data.depositHistory) {
                data.depositHistory = data.depositHistory.map(mapBackendDepositToFrontend);
            }
            return data;
        },
        giveCompensation: async (userId: string, amount: number, reason: string): Promise<any> => {
            const res = await client.post('/admin/users/compensation', { userId, amount, reason });
            return res.data;
        },
        giveCompensationAll: async (amount: number, reason: string): Promise<any> => {
            const res = await client.post('/admin/users/compensation-all', { amount, reason });
            return res.data;
        },
        addItem: async (userId: string, itemId: string, amount: number): Promise<any> => {
            const res = await client.post('/admin/users/items', { userId, itemId, amount });
            return res.data;
        },
        resetAllBalances: async (): Promise<any> => {
            const res = await client.post('/admin/users/reset-balances');
            return res.data;
        },
        deleteUser: async (userId: string): Promise<any> => {

            const res = await client.delete(`/admin/users/${userId}`);
            return res.data;
        },
        toggleBan: async (userId: string): Promise<any> => {
            const res = await client.post(`/admin/users/${userId}/toggle-ban`);
            return res.data;
        },
        getDashboardStats: async (): Promise<any> => {
            const res = await client.get('/admin/dashboard-stats');
            return res.data;
        },
        getGlobalRevenue: async (): Promise<any> => {
            const res = await client.get('/admin/revenue');
            return res.data;
        },
        clearGlobalRevenue: async (): Promise<any> => {
            const res = await client.post('/admin/revenue/clear');
            return res.data;
        },
        convertCurrencyToUSD: async (): Promise<any> => {
            const res = await client.post('/admin/convert-currency');
            return res.data;
        }
    },
    // Chat
    chat: {
        getMessages: async (): Promise<ChatMessage[]> => {
            const res = await client.get('/chat');
            return res.data;
        },
        sendMessage: async (message: string): Promise<ChatMessage> => {
            const res = await client.post('/chat', { message });
            return res.data;
        }
    },
    user: {
        checkIn: async (): Promise<{ success: boolean, streak: number, reward: any }> => {
            const res = await client.post('/users/check-in');
            return res.data;
        },
        unlockSlot: async (targetSlot: number): Promise<any> => {
            const res = await client.post('/users/unlock-slot', { targetSlot });
            return res.data;
        },
        updatePassword: (currentPassword: string, newPassword: string) => client.post('/auth/update-password', { currentPassword, newPassword }),
        updatePin: (currentPassword: string, newPin: string) => client.post('/auth/update-pin', { currentPassword, newPin }),
        updateBankQr: (bankQrCode: string) => client.post('/auth/update-bank-qr', { bankQrCode }),
        incrementStats: async (updates: { stats?: any, weeklyStats?: any }): Promise<any> => {
            const res = await client.post('/auth/update-stats', updates);
            return res.data;
        },
        activateOverclock: async (): Promise<{ success: boolean, overclockExpiresAt: number, newBalance: number, isResume?: boolean }> => {
            const res = await client.post('/users/overclock');
            return res.data;
        },
        deactivateOverclock: async (): Promise<{ success: boolean, overclockExpiresAt: null, newBalance: number, overclockRemainingMs: number }> => {
            const res = await client.post('/users/overclock/deactivate');
            return res.data;
        },
        updateProfile: async (data: { walletAddress?: string }): Promise<any> => {
            const res = await client.post('/users/profile', data);
            return res.data;
        }
    },
    dungeon: {
        start: async (dungeonId: number, rigId: string, useKey: boolean): Promise<any> => {
            const res = await client.post('/dungeons/start', { dungeonId, rigId, useKey });
            return res.data;
        },
        claim: async (): Promise<any> => {
            const res = await client.post('/dungeons/claim');
            return res.data;
        },
        skip: async (itemId: string): Promise<any> => {
            const res = await client.post('/dungeons/skip', { itemId });
            return res.data;
        }
    },

    // Notification API
    claimNotificationReward: async (notificationId: string): Promise<{ success: boolean; user: User; message: string }> => {
        const res = await client.post('/users/claim-notification-reward', { notificationId });
        return res.data;
    },

    deleteNotification: async (notificationId: string): Promise<{ success: boolean; user: User }> => {
        const res = await client.delete(`/users/notifications/${notificationId}`);
        return res.data;
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
        purchasedAt: new Date(backendRig.purchasedAt || backendRig.purchaseDate || backendRig.createdAt).getTime(),
        lastClaimAt: backendRig.lastClaimAt ? new Date(backendRig.lastClaimAt).getTime() : new Date(backendRig.purchasedAt || backendRig.purchaseDate || backendRig.createdAt).getTime(),
        rarity: backendRig.rarity as any,
        bonusProfit: backendRig.bonusProfit || 0,
        status: backendRig.status,
        slots: backendRig.slots || [],
        repairCost: backendRig.repairCost || 0,
        energyCostPerDay: backendRig.energyCostPerDay || 0,
        expiresAt: new Date(backendRig.expiresAt).getTime(),
        energy: backendRig.energy !== undefined ? backendRig.energy : 100,
        lastEnergyUpdate: backendRig.lastEnergyUpdate ? new Date(backendRig.lastEnergyUpdate).getTime() : new Date(backendRig.purchaseDate || backendRig.createdAt || Date.now()).getTime(),
        currentMaterials: backendRig.currentMaterials,
        lastCollectionAt: backendRig.lastCollectionAt ? new Date(backendRig.lastCollectionAt).getTime() : undefined
    } as OilRig;
};

const mapBackendGloveToFrontend = (backendGlove: any): AccessoryItem => {
    if (!backendGlove) return {} as AccessoryItem;
    return {
        id: backendGlove._id || backendGlove.id,
        typeId: backendGlove.typeId || backendGlove.type || (
            backendGlove.name.includes('ชิป') ? 'upgrade_chip' :
                backendGlove.name.includes('กุญแจ') ? 'chest_key' :
                    backendGlove.name.includes('หุ่นยนต์') ? 'robot' :
                        backendGlove.name.includes('ถุงมือ') ? 'glove' : 'unknown'
        ),
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
    bankQrCode: w.bankQrCode,
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
    balanceAfter: tx.balanceAfter || 0,
    timestamp: new Date(tx.createdAt || tx.timestamp).getTime(),
    status: tx.status === 'APPROVED' ? 'COMPLETED' : tx.status,
    description: tx.description || (
        tx.type === 'DEPOSIT' ? 'ฝากเงินเข้าระบบ' :
            tx.type === 'WITHDRAWAL' ? 'ถอนเงินออกจากระบบ' :
                tx.type === 'MINING_CLAIM' ? `รับรายได้จาก ${tx.rigName || 'เครื่องขุด'}` :
                    'รายการอื่นๆ'
    )
});

// Chat API methods
export const chatApi = {
    getChatMessages: async (): Promise<ChatMessage[]> => {
        const res = await client.get('/chat');
        return res.data.map((msg: any) => ({
            id: msg._id || msg.id,
            userId: msg.userId,
            username: msg.username,
            message: msg.message,
            timestamp: new Date(msg.timestamp || msg.createdAt).getTime(),
            role: msg.role,
            isVip: msg.isVip
        }));
    },

    sendChatMessage: async (message: string): Promise<ChatMessage> => {
        const res = await client.post('/chat', { message });
        const msg = res.data;
        return {
            id: msg._id || msg.id,
            userId: msg.userId,
            username: msg.username,
            message: msg.message,
            timestamp: new Date(msg.timestamp || msg.createdAt).getTime(),
            role: msg.role,
            isVip: msg.isVip
        };
    }
};
