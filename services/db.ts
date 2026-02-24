
import {
    User, OilRig, ClaimRequest, WithdrawalRequest, DepositRequest,
    Notification, Transaction, SystemConfig, MarketState, AccessoryItem,
    CraftingQueueItem, MarketItemData, UserRole, Expedition, UserStats, ChatMessage, Rarity, MarketTrend
} from './types';
import {
    STORAGE_KEYS, MATERIAL_CONFIG, SHOP_ITEMS, RIG_PRESETS,
    RARITY_SETTINGS, UPGRADE_REQUIREMENTS, UPGRADE_CONFIG,
    LUCKY_DRAW_CONFIG, DAILY_CHECKIN_REWARDS, ENERGY_CONFIG,
    REPAIR_CONFIG, RENEWAL_CONFIG, GIFT_CYCLE_DAYS, MARKET_CONFIG,
    VIP_TIERS, SLOT_EXPANSION_CONFIG, DUNGEON_CONFIG, QUESTS, MINING_RANKS, ACHIEVEMENTS, MATERIAL_RECIPES, DEMO_SPEED_MULTIPLIER, EQUIPMENT_SERIES, ROBOT_CONFIG, EQUIPMENT_UPGRADE_CONFIG
} from '../constants';

const getStore = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
        return JSON.parse(stored);
    } catch {
        return defaultValue;
    }
};

const setStore = <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
};

const syncSession = (updatedUser: User) => {
    const session = getStore<User | null>(STORAGE_KEYS.SESSION, null);
    if (session && session.id === updatedUser.id) {
        setStore(STORAGE_KEYS.SESSION, { ...session, ...updatedUser });
    }
};

const getResetDayIdentifier = (timestamp: number) => {
    if (timestamp === 0) return 'never';
    const date = new Date(timestamp);
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
};

export const MockDB = {
    getSession: (): User | null => {
        return getStore<User | null>(STORAGE_KEYS.SESSION, null);
    },

    login: (username: string, password?: string, pin?: string): User => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);

        // Auto-seed Admin if not exists
        if (username === 'admin' && !users.find(u => u.username === 'admin')) {
            const adminUser: User = {
                id: 'admin_001',
                username: 'admin',
                email: 'admin@mock.com',
                passwordHash: 'bleach',
                pin: '4901',
                role: 'SUPER_ADMIN' as UserRole,
                balance: 10000,
                miningSlots: 6,
                createdAt: Date.now(),
                lastLogin: Date.now(),
                materials: {},
                energy: 100,
                inventory: [],
                notifications: [],
                lastLoginDate: new Date().toDateString(),
                consecutiveLoginDays: 1,
                dailyGiftClaimed: false,
                unlockedSlots: 6,
                warehouseCapacity: 10,
                masteryPoints: 9999,
                claimedRanks: [],
                isBanned: false,
                stats: {
                    totalMaterialsMined: 0,
                    totalMoneySpent: 0,
                    totalLogins: 0,
                    luckyDraws: 0,
                    questsCompleted: 0,
                    materialsCrafted: 0,
                    dungeonsEntered: 0,
                    itemsCrafted: 0,
                    repairPercent: 0,
                    rareLootCount: 0
                }
            };
            users.push(adminUser);
            setStore(STORAGE_KEYS.USERS, users);
            return adminUser;
        }

        const user = users.find(u => u.username === username);
        if (!user) throw new Error('User not found');
        if (password && user.passwordHash !== password) throw new Error('Invalid password');
        if (pin && user.pin !== pin) throw new Error('Invalid PIN');

        user.lastLogin = Date.now();
        setStore(STORAGE_KEYS.SESSION, user);
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        setStore(STORAGE_KEYS.USERS, updatedUsers);

        return user;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },

    register: (username: string, email: string, password?: string, pin?: string): User => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        if (users.find(u => u.username === username)) throw new Error('Username already exists');

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            username,
            email,
            passwordHash: password || '',
            pin: pin || '',
            role: 'USER',
            balance: 0,
            miningSlots: 3,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            energy: 100,
            materials: {
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
            },
            inventory: [],
            notifications: [],
            lastLoginDate: new Date().toDateString(),
            consecutiveLoginDays: 1,
            dailyGiftClaimed: false,
            warehouseCapacity: 10,
            stats: {
                totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 1, luckyDraws: 0, questsCompleted: 0,
                materialsCrafted: 0, dungeonsEntered: 0, itemsCrafted: 0, repairPercent: 0, rareLootCount: 0
            },
            claimedRanks: [],
            unlockedSlots: 3,
            masteryPoints: 0,
            isBanned: false
        };

        users.push(newUser);
        setStore(STORAGE_KEYS.USERS, users);
        setStore(STORAGE_KEYS.SESSION, newUser);
        return newUser;
    },

    getMyRigs: (userId: string): OilRig[] => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        return rigs.filter(r => r.ownerId === userId);
    },

    startExpedition: (userId: string, dungeonId: number, useKey: boolean, rigId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        if (user.activeExpedition) throw new Error('Already in an expedition');

        const dungeon = DUNGEON_CONFIG.find(d => d.id === dungeonId);
        if (!dungeon) throw new Error('Dungeon not found');

        // Cost Logic - Demo Mode logic
        if (useKey) {
            // Simplified demo key check
            const keys = user.inventory.filter(i => i.typeId === 'chest_key');
            if (keys.length < (dungeon.keyCost || 0)) throw new Error('Not enough keys');
            // Remove keys
            for (let i = 0; i < (dungeon.keyCost || 0); i++) {
                const idx = user.inventory.findIndex(inv => inv.typeId === 'chest_key');
                if (idx !== -1) user.inventory.splice(idx, 1);
            }
        } else {
            if (user.balance < dungeon.cost) throw new Error('Insufficient balance');
            user.balance -= dungeon.cost;
            user.stats.totalMoneySpent += dungeon.cost;
        }

        const durationMs = dungeon.durationHours * 60 * 60 * 1000;

        user.activeExpedition = {
            dungeonId,
            rigId,
            startTime: Date.now(),
            endTime: Date.now() + durationMs,
            isCompleted: false
        };

        user.stats.dungeonsEntered = (user.stats.dungeonsEntered || 0) + 1;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return user;
    },

    claimExpedition: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        if (!user.activeExpedition) throw new Error('No active expedition');

        const GRACE_PERIOD = 10000; // 10s grace
        if (Date.now() < user.activeExpedition.endTime - GRACE_PERIOD) {
            throw new Error('Expedition not finished');
        }

        const dungeon = DUNGEON_CONFIG.find(d => d.id === user.activeExpedition!.dungeonId);
        if (!dungeon) throw new Error('Dungeon config not found');

        // --- DUAL REWARD LOGIC ---
        let rewards: any[] = [];
        let rewardType = 'common';
        let rewardString = '';

        // 1. Pick ONE Normal Reward (85% Common, 15% Salt)
        const roll = Math.random() * 100;
        let normalPool = roll < 15 ? dungeon.rewards.salt : dungeon.rewards.common;
        if (normalPool.length === 0) normalPool = dungeon.rewards.common; // Fallback

        if (normalPool.length > 0) {
            const idx = Math.floor(Math.random() * normalPool.length);
            rewards.push({ ...normalPool[idx], type: roll < 15 ? 'salt' : 'common' });
        }

        // 2. Pick ONE Jackpot Reward - ONLY for ID 2, 3 (5% Chance)
        if (dungeon.id !== 1 && dungeon.rewards.rare.length > 0 && Math.random() < 0.05) {
            const idx = Math.floor(Math.random() * dungeon.rewards.rare.length);
            rewards.push({ ...dungeon.rewards.rare[idx], type: 'rare' });
            rewardType = 'rare';
        }

        if (rewards.length === 0) {
            user.activeExpedition = null;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
            return { success: true, reward: 'ไม่พบรางวัล', type: 'common' };
        }

        const materialNames: any = MATERIAL_CONFIG.NAMES;

        // Apply Rewards
        for (const r of rewards) {
            let displayName = '';
            if (r.itemId) {
                const shopItem = SHOP_ITEMS.find(s => s.id === r.itemId);
                if (shopItem) {
                    if (!user.inventory) user.inventory = [];
                    const lifespan = shopItem.lifespanDays || 30;
                    const newItem: AccessoryItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        typeId: shopItem.id,
                        name: shopItem.name,
                        price: shopItem.price,
                        dailyBonus: (shopItem.minBonus + shopItem.maxBonus) / 2,
                        durationBonus: shopItem.durationBonus || 0,
                        rarity: 'RARE',
                        purchasedAt: Date.now(),
                        lifespanDays: lifespan,
                        expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000),
                        level: 1
                    };
                    user.inventory.push(newItem);
                    // Use fallback logic for name if it's localized object
                    displayName = typeof shopItem.name === 'string' ? shopItem.name : (shopItem.name.th || shopItem.name.en);
                }
            } else if (r.tier !== undefined) {
                if (!user.materials) user.materials = {};
                user.materials[r.tier] = (user.materials[r.tier] || 0) + (r.amount || 1);
                const matName = materialNames[r.tier];
                displayName = matName ? (typeof matName === 'string' ? matName : (matName.th || matName.en)) : `Unknown Ore (${r.tier})`;
            }

            const label = r.type === 'rare' ? '[JACKPOT] ' : '';
            rewardString += `${rewardString ? ' + ' : ''}${label}${displayName} x${r.amount || 1}`;
        }

        user.activeExpedition = null;
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);

        return { success: true, reward: rewardString, type: rewardType, rewards: rewards };
    },

    skipExpeditionTime: (userId: string, itemId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.activeExpedition) throw new Error('No active expedition');

        const itemIndex = user.inventory.findIndex(i => i.typeId === itemId);
        if (itemIndex === -1) throw new Error('Item not found');

        let skipMs = 0;
        if (itemId === 'hourglass_small') skipMs = 30 * 60 * 1000;
        else if (itemId === 'hourglass_medium') skipMs = 2 * 60 * 60 * 1000;
        else if (itemId === 'hourglass_large') skipMs = 6 * 60 * 60 * 1000;

        user.activeExpedition.endTime -= skipMs;
        user.inventory.splice(itemIndex, 1);

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return user;
    },

    getAllUsers: (): User[] => {
        return getStore<User[]>(STORAGE_KEYS.USERS, []);
    },

    buyRig: (userId: string, presetId: number, slotIndex: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const preset = RIG_PRESETS.find(p => p.id === presetId);
        if (!preset) throw new Error('Preset not found');

        if (user.balance < preset.price) throw new Error('Insufficient funds');
        user.balance -= preset.price;
        user.stats.totalMoneySpent += preset.price;

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const newRig: OilRig = {
            id: Math.random().toString(36).substr(2, 9),
            ownerId: userId,
            name: preset.name,
            investment: preset.price,
            durationMonths: preset.durationMonths || 1,
            dailyProfit: preset.dailyProfit,
            bonusProfit: preset.bonusProfit || 0,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            expiresAt: Date.now() + ((preset.durationMonths || 1) * 30 * 24 * 60 * 60 * 1000),
            lastClaimAt: Date.now(),
            ratePerSecond: preset.dailyProfit / 86400,
            repairCost: preset.price * 0.1,
            energyCostPerDay: 10,
            energy: 100,
            slots: [null, null, null, null]
        };
        rigs.push(newRig);
        setStore(STORAGE_KEYS.RIGS, rigs);

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return user;
    },

    claimRig: (userId: string, rigId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) throw new Error('Rig not found');

        const now = Date.now();
        const seconds = (now - rig.lastClaimAt) / 1000;
        const profit = seconds * rig.ratePerSecond;

        if (profit > 0) {
            user.balance += profit;
            user.stats.totalMaterialsMined += profit;
            rig.lastClaimAt = now;
        }

        setStore(STORAGE_KEYS.RIGS, rigs);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return { user, amount: profit > 0 ? profit : 0 };
    },

    sellMaterial: (userId: string, tier: number, amount: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        if (!user.materials) user.materials = {};
        if ((user.materials[tier] || 0) < amount) {
            throw new Error('Not enough materials');
        }

        const market = MockDB.getMarketState();
        const price = market.trends[tier]?.currentPrice || (MATERIAL_CONFIG as any).PRICES[tier] || 0;
        const subTotal = price * amount;
        const tax = Math.floor(subTotal * 0.15); // 15% Market Tax
        const total = subTotal - tax;

        user.materials[tier] -= amount;
        user.balance += total;
        user.stats = user.stats || {
            totalMaterialsMined: 0,
            totalMoneySpent: 0,
            totalLogins: 0,
            luckyDraws: 0,
            questsCompleted: 0
        };

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return user;
    },

    getMarketState: (): MarketState => {
        const store = getStore<MarketState>(STORAGE_KEYS.MARKET_STATE, null as any);
        const now = Date.now();

        if (store && store.nextUpdate > now) {
            return store;
        }

        // Generate or Update Market State
        const prevTrends = store?.trends || {};
        const newTrends: Record<number, MarketItemData> = {};

        [1, 2, 3, 4, 5, 6, 7].forEach(tier => {
            const basePrice = (MATERIAL_CONFIG.PRICES as any)[tier] || 10;
            const prevData = prevTrends[tier];

            let currentPrice = prevData?.currentPrice || basePrice;
            let history = prevData?.history || Array(20).fill(basePrice);

            // Simulate fluctuation - HIGH VOLATILITY for demo
            const volatility = 0.15; // 15% max change per update for visible movement
            const direction = Math.random() > 0.5 ? 1 : -1; // Random up or down
            const magnitude = Math.random() * volatility;
            const change = 1 + (direction * magnitude);
            currentPrice = parseFloat((currentPrice * change).toFixed(2));

            // Bot Intervention (Keep price within bounds)
            const maxPrice = basePrice * (1 + (MARKET_CONFIG as any).MAX_FLUCTUATION);
            const minPrice = basePrice * (1 - (MARKET_CONFIG as any).MAX_FLUCTUATION);

            if (currentPrice > maxPrice) currentPrice = maxPrice * 0.95;
            if (currentPrice < minPrice) currentPrice = minPrice * 1.05;

            // Update History
            history = [...history.slice(1), currentPrice];

            // Determine Trend
            const prevPrice = history[history.length - 2] || basePrice;
            const trend: MarketTrend = currentPrice > prevPrice ? 'UP' : currentPrice < prevPrice ? 'DOWN' : 'STABLE';

            newTrends[tier] = {
                basePrice,
                currentPrice,
                multiplier: currentPrice / basePrice,
                trend,
                history
            };
        });

        const newState: MarketState = {
            trends: newTrends,
            nextUpdate: now + (MARKET_CONFIG.UPDATE_INTERVAL_HOURS * 3600000)
        };

        setStore(STORAGE_KEYS.MARKET_STATE, newState);
        return newState;
    },

    getSystemConfig: (): SystemConfig => {
        return {
            receivingQrCode: 'https://example.com/qr.png',
            isMaintenanceMode: false
        };
    },

    // Minimal placeholders for others to prevent crashes
    claimDailyBonus: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        user.dailyGiftClaimed = true;
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return { success: true, reward: 'Daily Bonus' };
    },
    checkIn: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const now = Date.now();
        const lastTime = user.lastCheckIn ? (typeof user.lastCheckIn === 'number' ? user.lastCheckIn : new Date(user.lastCheckIn).getTime()) : 0;

        const lastResetId = getResetDayIdentifier(lastTime);
        const nowResetId = getResetDayIdentifier(now);

        if (lastTime !== 0 && lastResetId === nowResetId) {
            throw new Error('Already checked in today');
        }

        // Streak logic
        const dayInMillis = 24 * 60 * 60 * 1000;
        if (lastTime !== 0 && (now - lastTime) > dayInMillis * 2) {
            user.checkInStreak = 1;
        } else {
            user.checkInStreak = (user.checkInStreak || 0) + 1;
        }

        if (user.checkInStreak > 30) user.checkInStreak = 1;

        user.lastCheckIn = now;
        user.dailyGiftClaimed = true;

        // Reward logic
        const reward = DAILY_CHECKIN_REWARDS.find(r => r.day === user.checkInStreak);
        if (reward) {
            if (reward.reward === 'money') {
                user.balance += reward.amount;
            } else if (reward.reward === 'material') {
                if (!user.materials) user.materials = {};
                user.materials[reward.tier!] = (user.materials[reward.tier!] || 0) + (reward.amount || 1);
            } else if (reward.reward === 'item') {
                if (!user.inventory) user.inventory = [];
                const shopItem = SHOP_ITEMS.find(s => s.id === reward.id);
                const count = (reward as any).amount || 1;

                for (let i = 0; i < count; i++) {
                    const newItem: AccessoryItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        typeId: reward.id!,
                        name: shopItem?.name || reward.id!.replace('_', ' '),
                        price: shopItem?.price || 0,
                        dailyBonus: shopItem ? (shopItem.minBonus + shopItem.maxBonus) / 2 : 0,
                        durationBonus: shopItem?.durationBonus || 0,
                        rarity: (shopItem?.rarity as any) || 'RARE',
                        purchasedAt: Date.now(),
                        lifespanDays: shopItem?.lifespanDays || 0,
                        expireAt: shopItem?.lifespanDays ? Date.now() + (shopItem.lifespanDays * 24 * 60 * 60 * 1000) : 0,
                        level: 1
                    };
                    user.inventory.push(newItem);
                }
            }
        }

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return { success: true, streak: user.checkInStreak, reward };
    },
    deposit: (userId: string, amount: number, imageUrl: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);

        if (user) {
            // SIMULATION: Auto-approve deposit for Demo
            user.balance += amount;
            user.stats = user.stats || {
                totalMaterialsMined: 0,
                totalMoneySpent: 0,
                totalLogins: 0,
                luckyDraws: 0,
                questsCompleted: 0
            };
            user.stats.totalDeposited = (user.stats.totalDeposited || 0) + amount;
            user.stats.totalMoneySpent = (user.stats.totalMoneySpent || 0); // Ensure init

            // Add notification
            user.notifications.unshift({
                id: Date.now().toString(),
                userId: user.id,
                title: 'ฝากเงินสำเร็จ',
                message: `ยอดเงิน ${amount.toLocaleString()} บาท เข้ากระเป๋าแล้ว (Demo Auto-Approve)`,
                type: 'SUCCESS',
                timestamp: Date.now(),
                read: false
            });

            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }

        return { id: 'dep_' + Date.now(), status: 'SUCCESS' };
    },
    withdraw: (userId: string, amount: number, method: 'BANK' | 'USDT' = 'BANK', address?: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        if (user.balance < amount) throw new Error('Insufficient balance');

        user.balance -= amount;
        const updatedUsers = users.map(u => u.id === userId ? user : u);
        setStore(STORAGE_KEYS.USERS, updatedUsers);
        syncSession(user);

        const withdrawal: WithdrawalRequest = {
            id: `W${Date.now()}`,
            userId,
            username: user.username,
            amount,
            timestamp: Date.now(),
            status: 'PENDING',
            method,
            walletAddress: method === 'USDT' ? (address || user.walletAddress) : undefined,
            bankQrCode: method === 'BANK' ? user.bankQrCode : undefined
        };

        const withdrawals = getStore<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, []);
        withdrawals.push(withdrawal);
        setStore(STORAGE_KEYS.WITHDRAWALS, withdrawals);

        return withdrawal;
    },
    craftMaterial: (userId: string, sourceTier: number) => {
        // Placeholder
        return { success: false, message: 'Crafting not implemented in Demo' };
    },

    // --- Chat System Methods ---
    getChatMessages: (): ChatMessage[] => {
        const messages = getStore<ChatMessage[]>(STORAGE_KEYS.CHAT, []);
        // Return last 50 messages
        return messages.slice(-50);
    },

    sendChatMessage: (userId: string, message: string, currentUser?: User) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        let user = users.find(u => u.id === userId);

        // If user is not found in local storage but we have currentUser, add them
        if (!user && currentUser) {
            users.push(currentUser);
            setStore(STORAGE_KEYS.USERS, users);
            user = currentUser;
        }

        if (!user) throw new Error('User not found');

        const messages = getStore<ChatMessage[]>(STORAGE_KEYS.CHAT, []);

        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user.id,
            username: user.username,
            message: message.trim(),
            timestamp: Date.now(),
            role: user.role,
            isVip: (user.stats?.totalMoneySpent || 0) > 1000 // Simple VIP check
        };

        messages.push(newMessage);
        // Keep only last 100 messages in storage
        if (messages.length > 100) messages.shift();

        setStore(STORAGE_KEYS.CHAT, messages);
        return newMessage;
    },

    // --- Missing Demo Methods ---
    collectRigMaterials: (userId: string, rigId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) throw new Error('Rig not found');

        const count = rig.currentMaterials || 0;
        if (count <= 0) throw new Error('No materials to collect');

        // Determine tier based on investment (simplified)
        const tier = (investment: number) => {
            if (investment === 0) return 7;
            if (investment >= 3000) return 5;
            if (investment >= 2500) return 4;
            if (investment >= 2000) return 3;
            if (investment >= 1500) return 2;
            return 1;
        };
        const rigTier = tier(rig.investment);

        if (!user.materials) user.materials = {};
        user.materials[rigTier] = (user.materials[rigTier] || 0) + count;

        rig.currentMaterials = 0;
        rig.lastCollectionAt = Date.now();

        setStore(STORAGE_KEYS.RIGS, rigs);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);

        return { count, tier: rigTier, name: MATERIAL_CONFIG.NAMES[rigTier as keyof typeof MATERIAL_CONFIG.NAMES] };
    },

    claimRigReward: (userId: string, rigId: string, amount: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) throw new Error('Rig not found');

        user.balance += amount;
        user.stats.totalMaterialsMined += amount;
        rig.lastClaimAt = Date.now();

        setStore(STORAGE_KEYS.RIGS, rigs);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return user;
    },

    repairRig: (userId: string, rigId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) throw new Error('Rig not found');

        const cost = rig.repairCost || Math.floor(rig.investment * 0.1);
        if (user.balance < cost) throw new Error('Insufficient funds to repair');

        user.balance -= cost;
        user.stats.totalMoneySpent += cost;
        rig.lastRepairAt = Date.now();

        setStore(STORAGE_KEYS.RIGS, rigs);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return cost;
    },

    refillRigEnergy: (userId: string, rigId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) throw new Error('Rig not found');

        // Logic similar to PlayerDashboard
        const rigNameStr = typeof rig.name === 'string' ? rig.name : (rig.name?.th || rig.name?.en || '');
        const preset = RIG_PRESETS.find(p => p.name.th === rigNameStr || p.name.en === rigNameStr);
        const energyCostPerDay = rig.energyCostPerDay || (preset ? preset.energyCostPerDay : 0);

        const lastUpdate = rig.lastEnergyUpdate || rig.purchasedAt || Date.now();
        const elapsedMs = Date.now() - lastUpdate;
        const elapsedHours = (elapsedMs * DEMO_SPEED_MULTIPLIER) / (1000 * 60 * 60);

        // Double drain during Overclock
        const isOverclockActive = user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() > Date.now() : false;
        const drainRate = isOverclockActive ? 8.333333333333334 : 4.166666666666667;
        const drain = elapsedHours * drainRate;
        const currentEnergy = Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));
        const needed = 100 - currentEnergy;
        const cost = Math.max(0.1, (needed / 100) * energyCostPerDay);

        if (user.balance < cost) throw new Error('Insufficient funds to refill energy');

        user.balance -= cost;
        user.stats.totalMoneySpent += cost;
        rig.energy = 100;
        rig.lastEnergyUpdate = Date.now();

        setStore(STORAGE_KEYS.RIGS, rigs);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return cost;
    },

    renewRig: (userId: string, rigId: string, costMultiplier: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) throw new Error('Rig not found');

        const renewalCost = rig.investment * (1 - RENEWAL_CONFIG.DISCOUNT_PERCENT);
        if (user.balance < renewalCost) throw new Error('Insufficient funds to renew');

        user.balance -= renewalCost;
        user.stats.totalMoneySpent += renewalCost;
        rig.renewalCount = (rig.renewalCount || 0) + 1;
        // Logic for expiry usually handled by RigCard reading renewalCount

        setStore(STORAGE_KEYS.RIGS, rigs);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return renewalCost;
    },

    updateRigMaterials: (rigId: string, count: number) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) return;

        rig.currentMaterials = count;
        setStore(STORAGE_KEYS.RIGS, rigs);
    },

    refillEnergy: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const currentEnergy = user.energy !== undefined ? user.energy : 100;
        const missing = 100 - currentEnergy;
        let cost = missing * ENERGY_CONFIG.COST_PER_UNIT;
        if (cost < ENERGY_CONFIG.MIN_REFILL_FEE) cost = ENERGY_CONFIG.MIN_REFILL_FEE;

        if (user.balance < cost) throw new Error('Insufficient balance');

        user.balance -= cost;
        user.energy = 100;
        user.lastEnergyUpdate = Date.now();

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        return cost;
    },

    logTransaction: (txData: any) => {
        const transactions = getStore<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === txData.userId);

        const tx: Transaction = {
            ...txData,
            id: `TX${Date.now()}${Math.floor(Math.random() * 1000)}`,
            balanceAfter: user ? user.balance : 0,
            timestamp: Date.now()
        };

        transactions.push(tx);
        setStore(STORAGE_KEYS.TRANSACTIONS, transactions);
        return tx;
    }
};
