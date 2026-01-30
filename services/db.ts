
import {
    User, OilRig, ClaimRequest, WithdrawalRequest, DepositRequest,
    Notification, Transaction, SystemConfig, MarketState, AccessoryItem,
    CraftingQueueItem, MarketItemData, UserRole, Expedition, UserStats, ChatMessage
} from './types';
import {
    STORAGE_KEYS, MATERIAL_CONFIG, SHOP_ITEMS, RIG_PRESETS,
    RARITY_SETTINGS, UPGRADE_REQUIREMENTS, UPGRADE_CONFIG,
    LUCKY_DRAW_CONFIG, DAILY_CHECKIN_REWARDS, ENERGY_CONFIG,
    REPAIR_CONFIG, RENEWAL_CONFIG, GIFT_CYCLE_DAYS, MARKET_CONFIG,
    VIP_TIERS, SLOT_EXPANSION_CONFIG, DUNGEON_CONFIG, QUESTS, MINING_RANKS, ACHIEVEMENTS, MATERIAL_RECIPES, DEMO_SPEED_MULTIPLIER, EQUIPMENT_SERIES, ROBOT_CONFIG
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
                password: 'bleach', // In MockDB we store plain text or simple hash, mimicking the request
                pin: '4901',
                role: 'SUPER_ADMIN' as UserRole, // Casting to ensure type if enum
                balance: 10000,
                createdAt: Date.now(),
                lastLogin: Date.now(),
                materials: {},
                energy: 100,
                inventory: [],
                notifications: [],
                lastLoginDate: new Date().toDateString(),
                consecutiveLoginDays: 1,
                dailyGiftClaimed: false,
                // Default Unlock 6 Slots
                unlockedSlots: 6,
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
        if (password && user.password !== password) throw new Error('Invalid password');
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

    deleteUser: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);

        // Remove User
        const updatedUsers = users.filter(u => u.id !== userId);
        setStore(STORAGE_KEYS.USERS, updatedUsers);

        // Remove User's Rigs
        const updatedRigs = rigs.filter(r => r.ownerId !== userId);
        setStore(STORAGE_KEYS.RIGS, updatedRigs);

        // Optional: Clean up other related data (Claims, Withdrawals, etc.) if strict integrity is needed
        // but for now, removing core access is sufficient for the requirement.
    },

    register: (username: string, password?: string, pin?: string): User => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        if (users.find(u => u.username === username)) throw new Error('Username already exists');

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            username,
            password: password || '1234',
            pin: pin || '0000',
            role: 'USER',
            balance: 0,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            materials: {},
            energy: 100,
            unlockedSlots: 3,
            masteryPoints: 0,
            claimedRanks: [],
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
            },
            inventory: [],
            notifications: []
        };

        users.push(newUser);
        setStore(STORAGE_KEYS.USERS, users);
        return newUser;
    },

    createDemoUser: (): User => {
        const randId = Math.floor(Math.random() * 10000);
        const demoUser: User = {
            id: `demo_${randId}`,
            username: `DemoPlayer_${randId}`,
            password: 'demo',
            pin: '0000',
            role: 'USER',
            balance: 50000,
            isDemo: true,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            materials: {},
            energy: 100,
            unlockedSlots: 3,
            masteryPoints: 0,
            claimedRanks: [],
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
            },
            inventory: [],
            notifications: []
        };
        // Do not save to Persistent Storage to act as "Sandbox" 
        // OR save to overwrite previous session only?
        // Let's just save to Session for now, but to make it work with refreshing, we might need to save to Users list temporarily 
        // or handle it in specific "Demo" storage key.
        // For simplicity: Add to normal users list but with unique ID, so it persists on refresh until manually cleared or time expires.

        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        users.push(demoUser);
        setStore(STORAGE_KEYS.USERS, users);
        setStore(STORAGE_KEYS.SESSION, demoUser);

        return demoUser;
    },

    getAllUsers: (): User[] => {
        return getStore<User[]>(STORAGE_KEYS.USERS, []);
    },

    updateBalance: (userId: string, amount: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            user.balance = amount;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }
    },

    getUserBalance: (userId: string): number => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        return user ? user.balance : 0;
    },

    addRig: (newRig: OilRig) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        rigs.push(newRig);
        setStore(STORAGE_KEYS.RIGS, rigs);
    },

    getAllRigs: (): OilRig[] => {
        return getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
    },

    getMyRigs: (userId: string): OilRig[] => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        return rigs.filter(r => r.ownerId === userId);
    },

    updateRig: (updatedRig: OilRig) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const index = rigs.findIndex(r => r.id === updatedRig.id);
        if (index !== -1) {
            rigs[index] = updatedRig;
            setStore(STORAGE_KEYS.RIGS, rigs);
        }
    },

    logTransaction: (tx: Partial<Transaction>) => {
        const txs = getStore<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        const newTx: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            status: tx.status || 'COMPLETED',
            userId: tx.userId!,
            type: tx.type!,
            amount: tx.amount || 0,
            description: tx.description || ''
        };
        txs.unshift(newTx);
        setStore(STORAGE_KEYS.TRANSACTIONS, txs);
    },

    getTransactions: (userId: string): Transaction[] => {
        const txs = getStore<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        return txs.filter(t => t.userId === userId);
    },

    createClaimRequest: (claim: Omit<ClaimRequest, 'id' | 'timestamp' | 'status'>) => {
        const claims = getStore<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
        const newClaim: ClaimRequest = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            status: 'PENDING',
            ...claim
        };
        claims.push(newClaim);
        setStore(STORAGE_KEYS.CLAIMS, claims);
        MockDB.logTransaction({ userId: claim.userId, type: 'MINING_CLAIM', amount: claim.amount, description: `Claim from ${claim.rigName}`, status: 'PENDING' });
    },

    getPendingClaims: () => {
        return getStore<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []).filter(c => c.status === 'PENDING');
    },

    processClaim: (id: string, status: 'APPROVED' | 'REJECTED') => {
        const claims = getStore<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
        const idx = claims.findIndex(c => c.id === id);
        if (idx !== -1) {
            claims[idx].status = status;
            setStore(STORAGE_KEYS.CLAIMS, claims);

            const claim = claims[idx];

            const txs = getStore<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
            const relatedTx = txs.find(t => t.userId === claim.userId && t.type === 'MINING_CLAIM' && t.status === 'PENDING' && Math.abs(t.amount - claim.amount) < 0.001);
            if (relatedTx) {
                relatedTx.status = status === 'APPROVED' ? 'COMPLETED' : 'REJECTED';
                setStore(STORAGE_KEYS.TRANSACTIONS, txs);
            }

            if (status === 'APPROVED') {
                MockDB.updateBalance(claim.userId, MockDB.getUserBalance(claim.userId) + claim.amount);
            }
        }
    },

    createWithdrawalRequest: (userId: string, username: string, amount: number) => {
        const withdrawals = getStore<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, []);
        withdrawals.push({
            id: Math.random().toString(36).substr(2, 9),
            userId,
            username,
            amount,
            timestamp: Date.now(),
            status: 'PENDING'
        });
        setStore(STORAGE_KEYS.WITHDRAWALS, withdrawals);

        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user && user.balance >= amount) {
            user.balance -= amount;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
            MockDB.logTransaction({ userId, type: 'WITHDRAWAL', amount: -amount, description: 'ถอนเงิน', status: 'PENDING' });
        }
    },

    getPendingWithdrawals: () => {
        return getStore<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, []).filter(w => w.status === 'PENDING');
    },

    processWithdrawal: (id: string, status: 'APPROVED' | 'REJECTED') => {
        const withdrawals = getStore<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, []);
        const idx = withdrawals.findIndex(w => w.id === id);
        if (idx !== -1) {
            withdrawals[idx].status = status;
            setStore(STORAGE_KEYS.WITHDRAWALS, withdrawals);

            const w = withdrawals[idx];

            const txs = getStore<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
            const relatedTx = txs.find(t => t.userId === w.userId && t.type === 'WITHDRAWAL' && t.status === 'PENDING' && t.amount === -w.amount);
            if (relatedTx) {
                relatedTx.status = status === 'APPROVED' ? 'COMPLETED' : 'REJECTED';
                setStore(STORAGE_KEYS.TRANSACTIONS, txs);
            }

            if (status === 'REJECTED') {
                MockDB.updateBalance(w.userId, MockDB.getUserBalance(w.userId) + w.amount);
            }
        }
    },

    createDepositRequest: (userId: string, username: string, amount: number, slipImage: string) => {
        const deposits = getStore<DepositRequest[]>(STORAGE_KEYS.DEPOSITS, []);
        deposits.push({
            id: Math.random().toString(36).substr(2, 9),
            userId,
            username,
            amount,
            slipImage,
            timestamp: Date.now(),
            status: 'PENDING'
        });
        setStore(STORAGE_KEYS.DEPOSITS, deposits);
        MockDB.logTransaction({ userId, type: 'DEPOSIT', amount, description: 'ฝากเงิน (รออนุมัติ)', status: 'PENDING' });
    },

    getPendingDeposits: () => {
        return getStore<DepositRequest[]>(STORAGE_KEYS.DEPOSITS, []).filter(d => d.status === 'PENDING');
    },

    processDepositRequest: (id: string, status: 'APPROVED' | 'REJECTED') => {
        const deposits = getStore<DepositRequest[]>(STORAGE_KEYS.DEPOSITS, []);
        const idx = deposits.findIndex(d => d.id === id);
        if (idx !== -1) {
            deposits[idx].status = status;
            setStore(STORAGE_KEYS.DEPOSITS, deposits);

            const d = deposits[idx];

            const txs = getStore<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
            const relatedTx = txs.find(t => t.userId === d.userId && t.type === 'DEPOSIT' && t.status === 'PENDING' && t.amount === d.amount);
            if (relatedTx) {
                relatedTx.status = status === 'APPROVED' ? 'COMPLETED' : 'REJECTED';
                setStore(STORAGE_KEYS.TRANSACTIONS, txs);
            }

            if (status === 'APPROVED') {
                MockDB.updateBalance(d.userId, MockDB.getUserBalance(d.userId) + d.amount);

                // New: Track total deposited for VIP/Chat Access
                const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
                const user = users.find(u => u.id === d.userId);
                if (user) {
                    if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
                    user.stats.totalDeposited = (user.stats.totalDeposited || 0) + d.amount;
                    setStore(STORAGE_KEYS.USERS, users);
                    syncSession(user);
                }
            }
        }
    },

    sendNotification: (userId: string, message: string, type: any) => {
        const notifs = getStore<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        notifs.push({ id: Math.random().toString(), userId, message, type, read: false, timestamp: Date.now() });
        setStore(STORAGE_KEYS.NOTIFICATIONS, notifs);
    },

    getUserNotifications: (userId: string) => {
        return getStore<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []).filter(n => n.userId === userId && !n.read);
    },

    markNotificationRead: (id: string) => {
        const notifs = getStore<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        const idx = notifs.findIndex(n => n.id === id);
        if (idx !== -1) {
            notifs[idx].read = true;
            setStore(STORAGE_KEYS.NOTIFICATIONS, notifs);
        }
    },

    getSystemConfig: (): SystemConfig => {
        return getStore<SystemConfig>(STORAGE_KEYS.SYSTEM_CONFIG, {});
    },

    updateSystemQr: (base64: string) => {
        const config = getStore<SystemConfig>(STORAGE_KEYS.SYSTEM_CONFIG, {});
        config.receivingQrCode = base64;
        setStore(STORAGE_KEYS.SYSTEM_CONFIG, config);
    },

    setMaintenanceMode: (enabled: boolean) => {
        const config = getStore<SystemConfig>(STORAGE_KEYS.SYSTEM_CONFIG, {});
        config.isMaintenanceMode = enabled;
        setStore(STORAGE_KEYS.SYSTEM_CONFIG, config);
    },

    // --- Chat System ---
    getChatMessages: (): ChatMessage[] => {
        return getStore<ChatMessage[]>(STORAGE_KEYS.CHAT || 'gold_rush_chat', []);
    },

    sendChatMessage: (userId: string, message: string) => {
        const user = MockDB.getAllUsers().find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        // Level Gate: Must have deposited at least once
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            if (!user.stats?.totalDeposited || user.stats.totalDeposited <= 0) {
                throw new Error('ต้องเติมเงินครั้งแรกก่อน ถึงจะสามารถพิมพ์แชทโลกได้');
            }
        }

        const chats = getStore<ChatMessage[]>(STORAGE_KEYS.CHAT || 'gold_rush_chat', []);
        const newMsg: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            username: user.username,
            role: user.role,
            message: message.trim(),
            timestamp: Date.now(),
            isVip: (user.vipExp || 0) > 0
        };

        // Keep last 50 messages
        if (chats.length >= 50) chats.shift();
        chats.push(newMsg);

        setStore(STORAGE_KEYS.CHAT || 'gold_rush_chat', chats);
        return newMsg;
    },

    banUser: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            user.isBanned = true;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }
    },

    unbanUser: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            user.isBanned = false;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }
    },

    getUserInventory: (userId: string): AccessoryItem[] => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        return user ? (user.inventory || []) : [];
    },

    getUserMaterials: (userId: string): Record<number, number> => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        return user ? (user.materials || {}) : {};
    },

    getUserEnergy: (userId: string): number => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) return 100;

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const userRigs = rigs.filter(r => r.ownerId === userId);
        const rigCount = userRigs.length;

        // No rigs = no drain
        if (rigCount === 0) return user.energy ?? 100;

        // Check for special rigs with zero energy consumption
        let zeroEnergyRigCount = 0;
        userRigs.forEach(r => {
            const preset = RIG_PRESETS.find(p => p.price === r.investment);
            if (preset?.specialProperties?.zeroEnergy) zeroEnergyRigCount++;
        });

        const effectiveRigCount = Math.max(0, rigCount - zeroEnergyRigCount);
        if (effectiveRigCount === 0) return user.energy ?? 100;

        // Calculate drain based on elapsed time
        const now = Date.now();
        const lastUpdate = user.lastEnergyUpdate || user.createdAt || now;
        const elapsedHours = (now - lastUpdate) / (1000 * 60 * 60);

        const drain = elapsedHours * effectiveRigCount * ENERGY_CONFIG.DRAIN_PER_RIG_PER_HOUR;
        const currentEnergy = Math.max(0, Math.min(100, (user.energy ?? 100) - drain));

        // Persist updated energy value
        user.energy = currentEnergy;
        user.lastEnergyUpdate = now;
        setStore(STORAGE_KEYS.USERS, users);

        return currentEnergy;
    },

    refillEnergy: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const currentEnergy = user.energy ?? 100;
        const needed = 100 - currentEnergy;
        if (needed <= 0) return 0;

        const cost = needed * ENERGY_CONFIG.COST_PER_UNIT;
        if (user.balance < cost) throw new Error('Insufficient balance');

        user.balance -= cost;
        user.energy = 100;
        user.lastEnergyUpdate = Date.now();

        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.totalMoneySpent += cost;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);

        MockDB.logTransaction({ userId, type: 'ENERGY_REFILL', amount: -cost, description: 'ชำระค่าไฟ', status: 'COMPLETED' });
        return cost;
    },

    consumeItem: (userId: string, itemTypeId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.inventory) throw new Error('User/Inventory not found');

        const index = user.inventory.findIndex(i => i.typeId === itemTypeId);
        if (index === -1) throw new Error('Item not found');

        user.inventory.splice(index, 1);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
    },

    equipAccessory: (userId: string, rigId: string, itemId: string, slotIndex: number) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []); // Need users to access inventory

        const rig = rigs.find(r => r.id === rigId && r.ownerId === userId);
        if (!rig) throw new Error('Rig not found');

        const user = users.find(u => u.id === userId);
        if (!user || !user.inventory) throw new Error('User or inventory not found');

        if (!rig.slots) rig.slots = [null, null, null, null, null];

        // Ensure item exists in inventory
        const itemIndex = user.inventory.findIndex(i => i.id === itemId);
        if (itemIndex === -1) throw new Error('Item not found in inventory');
        const item = user.inventory[itemIndex];

        // SYNC LIFESPAN: Set item expiry to match Rig expiry
        // Calculate rig expiry
        const rigDurationMs = rig.durationMonths * 30 * 24 * 60 * 60 * 1000;
        const rigExpireAt = rig.purchasedAt + rigDurationMs;

        // Update item expiry
        // Note: This permanently modifies the item in inventory. 
        // If the rig is permanent (durationMonths >= 900), the item becomes permanent? 
        // Assuming yes based on "equal to digger age".
        item.expireAt = rigExpireAt;

        // Also update lifespanDays for display consistency if needed, though usually calc'd from expireAt
        const remainingMs = Math.max(0, rigExpireAt - Date.now());
        item.lifespanDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

        // Save updated user inventory
        users.find(u => u.id === userId)!.inventory = user.inventory;
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);

        const oldRig = rigs.find(r => r.slots?.includes(itemId));
        if (oldRig) {
            const oldSlotIdx = oldRig.slots!.indexOf(itemId);
            if (oldSlotIdx !== -1) oldRig.slots![oldSlotIdx] = null;
        }

        rig.slots[slotIndex] = itemId;
        setStore(STORAGE_KEYS.RIGS, rigs);
    },

    unequipAccessory: (userId: string, rigId: string, slotIndex: number) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId && r.ownerId === userId);
        if (rig && rig.slots) {
            rig.slots[slotIndex] = null;
            setStore(STORAGE_KEYS.RIGS, rigs);
        }
    },

    renewRig: (userId: string, rigId: string, durationBonus: number) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId && r.ownerId === userId);
        if (!rig) throw new Error('Rig not found');

        const renewalCost = rig.investment * (1 - RENEWAL_CONFIG.DISCOUNT_PERCENT);
        const userBalance = MockDB.getUserBalance(userId);
        if (userBalance < renewalCost) throw new Error('Insufficient funds');

        MockDB.updateBalance(userId, userBalance - renewalCost);
        rig.purchasedAt = Date.now();
        rig.renewalCount = (rig.renewalCount || 0) + 1;

        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
            user.stats.totalMoneySpent += renewalCost;

            // --- GLOVE RENEWAL LOGIC ---
            // 1. Destroy old glove (if exists in slot[0])
            const oldGloveId = rig.slots?.[0];
            if (oldGloveId && user.inventory) {
                const gloveIdx = user.inventory.findIndex(i => i.id === oldGloveId);
                if (gloveIdx !== -1) {
                    user.inventory.splice(gloveIdx, 1);
                }
            }

            // 2. Generate new random glove
            const rarities: Array<'COMMON' | 'RARE' | 'SUPER_RARE' | 'EPIC' | 'LEGENDARY'> = ['COMMON', 'RARE', 'SUPER_RARE', 'EPIC', 'LEGENDARY'];
            const weights = [60, 25, 10, 4, 1]; // Probability weights
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let roll = Math.random() * totalWeight;
            let selectedRarity: 'COMMON' | 'RARE' | 'SUPER_RARE' | 'EPIC' | 'LEGENDARY' = 'COMMON';

            for (let i = 0; i < rarities.length; i++) {
                if (roll < weights[i]) {
                    selectedRarity = rarities[i];
                    break;
                }
                roll -= weights[i];
            }

            const gloveNames: Record<string, string> = {
                'COMMON': 'ถุงมือทำงาน (WORK)',
                'RARE': 'ถุงมือเสริมแรง (REINFORCED)',
                'SUPER_RARE': 'ถุงมือกันกระแทก (SHOCK)',
                'EPIC': 'ถุงมือพลังงาน (POWER)',
                'LEGENDARY': 'ถุงมือจักรวาล (INFINITY)'
            };

            const gloveBonus: Record<string, number> = {
                'COMMON': 0.5,
                'RARE': 1.0,
                'SUPER_RARE': 1.5,
                'EPIC': 2.5,
                'LEGENDARY': 5.0
            };

            const newGlove: AccessoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                typeId: 'glove',
                name: gloveNames[selectedRarity],
                price: 0,
                dailyBonus: gloveBonus[selectedRarity],
                durationBonus: 0,
                rarity: selectedRarity,
                purchasedAt: Date.now(),
                lifespanDays: 999,
                expireAt: Date.now() + 999 * 24 * 60 * 60 * 1000,
                level: 1
            };

            if (!user.inventory) user.inventory = [];
            user.inventory.push(newGlove);

            // 3. Equip new glove to slot[0]
            if (!rig.slots) rig.slots = [null, null, null, null, null];
            rig.slots[0] = newGlove.id;

            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }

        setStore(STORAGE_KEYS.RIGS, rigs);
        MockDB.logTransaction({ userId, type: 'RIG_RENEWAL', amount: -renewalCost, description: `ต่อสัญญา ${rig.name} (ถุงมือใหม่)`, status: 'COMPLETED' });
        return renewalCost;
    },

    repairRig: (userId: string, rigId: string) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId && r.ownerId === userId);
        if (!rig) throw new Error('Rig not found');

        const preset = RIG_PRESETS.find(p => p.price === rig.investment);
        let repairCost = preset ? preset.repairCost : Math.floor(rig.investment * 0.06);

        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);

        // --- ITEM EFFECT: HAT (Reduce Repair Cost) ---
        let discountMultiplier = 0;

        // 1. Mastery Buff
        if (user && (user.masteryPoints || 0) >= 300) {
            discountMultiplier += 0.05; // Silver Miner
        }

        // 2. Hat Effect (Must be equipped on THIS rig)
        const hatId = rig.slots ? rig.slots.find(id => {
            if (!id) return false;
            const item = user?.inventory?.find(i => i.id === id);
            return item && item.typeId === 'hat';
        }) : null;

        if (hatId && user?.inventory) {
            const hatItem = user.inventory.find(i => i.id === hatId);
            if (hatItem) {
                // Find discount based on rarity from EQUIPMENT_SERIES
                const series = EQUIPMENT_SERIES.hat.tiers.find(t => t.rarity === hatItem.rarity);
                if (series) {
                    // Start string look like "ค่าซ่อม -5%"
                    const match = series.stat.match(/-(\d+)%/);
                    if (match) {
                        const percent = parseInt(match[1]);
                        discountMultiplier += (percent / 100);
                    }
                }
            }
        }

        // Cap max discount to reasonable amount (e.g. 50%?) or allow full stack?
        // Let's cap at 50% for safety, or just let it stack. 
        // Legend Hat (-20%) + Silver (-5%) = 25%. Safe.

        repairCost = Math.floor(repairCost * (1 - discountMultiplier));

        const userBalance = MockDB.getUserBalance(userId);
        if (userBalance < repairCost) throw new Error('Insufficient funds');

        MockDB.updateBalance(userId, userBalance - repairCost);

        if (user) {
            if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };

            const now = Date.now();
            const durabilityMs = REPAIR_CONFIG.DURABILITY_DAYS * 24 * 60 * 60 * 1000;
            const lastRepair = rig.lastRepairAt || rig.purchasedAt;
            const elapsed = now - lastRepair;
            const lost = Math.min(100, (elapsed / durabilityMs) * 100);

            user.stats.repairPercent = (user.stats.repairPercent || 0) + lost;
            user.stats.totalMoneySpent += repairCost;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }

        rig.lastRepairAt = Date.now();
        setStore(STORAGE_KEYS.RIGS, rigs);
        MockDB.logTransaction({ userId, type: 'REPAIR', amount: -repairCost, description: `ซ่อมแซม ${rig.name}`, status: 'COMPLETED' });
        return repairCost;
    },

    collectRigMaterials: (userId: string, rigId: string) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId && r.ownerId === userId);
        if (!rig) throw new Error('Rig not found');

        if (!rig.currentMaterials || rig.currentMaterials <= 0) throw new Error('No materials');

        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.inventory) user.inventory = [];

            const keyConfig = SHOP_ITEMS.find(i => i.id === 'chest_key');
            if (keyConfig) {
                const newKey: AccessoryItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    typeId: keyConfig.id,
                    name: keyConfig.name,
                    price: keyConfig.price,
                    dailyBonus: (keyConfig.minBonus + keyConfig.maxBonus) / 2,
                    durationBonus: keyConfig.durationBonus,
                    rarity: 'COMMON',
                    purchasedAt: Date.now(),
                    lifespanDays: keyConfig.lifespanDays,
                    expireAt: Date.now() + keyConfig.lifespanDays * 86400000,
                    level: 1
                };
                user.inventory.push(newKey);
                setStore(STORAGE_KEYS.USERS, users);
                syncSession(user);
            }
        }

        const count = rig.currentMaterials;
        rig.currentMaterials = 0;
        setStore(STORAGE_KEYS.RIGS, rigs);

        return { name: 'กุญแจไขหีบ', count: 1 };
    },

    updateRigMaterials: (rigId: string, count: number) => {
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId);
        if (rig) {
            rig.currentMaterials = count;
            setStore(STORAGE_KEYS.RIGS, rigs);
        }
    },

    buyAccessory: (userId: string, itemId: string) => {
        const itemConfig = SHOP_ITEMS.find(i => i.id === itemId);
        if (!itemConfig) throw new Error('Item not found');

        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        if (user.balance < itemConfig.price) throw new Error('Insufficient funds');

        user.balance -= itemConfig.price;
        if (!user.inventory) user.inventory = [];

        const newItem: AccessoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            typeId: itemConfig.id,
            name: itemConfig.name,
            price: itemConfig.price,
            dailyBonus: (itemConfig.minBonus + itemConfig.maxBonus) / 2,
            durationBonus: itemConfig.durationBonus,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: itemConfig.lifespanDays,
            expireAt: Date.now() + itemConfig.lifespanDays * 86400000,
            level: 1
        };
        user.inventory.push(newItem);

        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.totalMoneySpent += itemConfig.price;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'ACCESSORY_PURCHASE', amount: -itemConfig.price, description: `ซื้อ ${itemConfig.name}`, status: 'COMPLETED' });
        return newItem;
    },

    updateUserQr: (userId: string, base64: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            user.bankQrCode = base64;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }
    },



    changePassword: (userId: string, oldPass: string, newPass: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            if (user.password === oldPass) {
                user.password = newPass;
                setStore(STORAGE_KEYS.USERS, users);
                syncSession(user);
            } else {
                throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
            }
        }
    },

    changePin: (userId: string, password: string, newPin: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            if (user.password === password) {
                user.pin = newPin;
                setStore(STORAGE_KEYS.USERS, users);
                syncSession(user);
            } else {
                throw new Error('รหัสผ่านยืนยันไม่ถูกต้อง');
            }
        }
    },

    sellUserMaterial: (userId: string, tier: number, amount: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        if (!user.materials || (user.materials[tier] || 0) < amount) throw new Error('Not enough materials');

        const price = MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES] || 0;

        // --- ITEM EFFECT: BAG (Increase Sell Price) ---
        let bonusPercent = 0;

        // Check if ANY rig has a bag equipped (Passive effect from owning/equipping)
        // Or strictly equipped active rigs? "Bag Series ... การค้าขาย"
        // Let's iterate all user rigs
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const userRigs = rigs.filter(r => r.ownerId === userId);

        let bestBagBonus = 0;

        userRigs.forEach(r => {
            r.slots?.forEach(slotId => {
                if (!slotId) return;
                const item = user.inventory?.find(i => i.id === slotId);
                if (item && item.typeId === 'bag') {
                    const series = EQUIPMENT_SERIES.bag.tiers.find(t => t.rarity === item.rarity);
                    if (series) {
                        const match = series.stat.match(/\+(\d+)%/);
                        if (match) {
                            const p = parseInt(match[1]);
                            // Take the highest bag bonus found? or stack? 
                            // Taking highest is safer to prevent exploits with 6 rigs x 5 bags
                            if (p > bestBagBonus) bestBagBonus = p;
                        }
                    }
                }
            });
        });

        bonusPercent = bestBagBonus / 100;

        const pricePerUnit = price * (1 + bonusPercent);
        const total = Math.floor(pricePerUnit * amount);

        user.materials[tier] -= amount;
        user.balance += total;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'MATERIAL_SELL', amount: total, description: `ขาย ${MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]} x${amount} (Bonus +${bestBagBonus}%)`, status: 'COMPLETED' });
        return total;
    },

    craftMaterial: (userId: string, sourceTier: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const uIdx = users.findIndex(u => u.id === userId);
        const user = users[uIdx];

        const recipe = MATERIAL_RECIPES[sourceTier];
        if (!recipe) throw new Error('สูตรการผลิตไม่ถูกต้อง');

        const targetTier = sourceTier + 1;

        // ตรวจสอบวัตถุดิบทั้งหมดในสูตร
        if (!user.materials) user.materials = {};
        for (const [tierStr, amountNeeded] of Object.entries(recipe.ingredients)) {
            const tier = parseInt(tierStr);
            if ((user.materials[tier] || 0) < amountNeeded) {
                throw new Error(`วัตถุดิบไม่พอ: ต้องการ ${MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]} จำนวน ${amountNeeded} ชิ้น`);
            }
        }

        if (user.balance < recipe.fee) {
            throw new Error(`เงินไม่พอสำหรับค่าธรรมเนียม (${recipe.fee} บาท)`);
        }

        if (recipe.requiredItem && !user.inventory?.some(i => i.typeId === recipe.requiredItem)) {
            const requiredItemName = SHOP_ITEMS.find(i => i.id === recipe.requiredItem)?.name || recipe.requiredItem;
            throw new Error(`จำเป็นต้องมีอุปกรณ์: ${requiredItemName}`);
        }

        // หักวัตถุดิบและเงิน
        for (const [tierStr, amountNeeded] of Object.entries(recipe.ingredients)) {
            user.materials[parseInt(tierStr)] -= amountNeeded;
        }
        user.balance -= recipe.fee;

        // เพิ่มวัตถุดิบผลลัพธ์
        user.materials[targetTier] = (user.materials[targetTier] || 0) + 1;

        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.materialsCrafted = (user.stats.materialsCrafted || 0) + 1;
        user.stats.totalMoneySpent += recipe.fee;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'MATERIAL_CRAFT', amount: -recipe.fee, description: `แปรรูปเป็น ${MATERIAL_CONFIG.NAMES[targetTier as keyof typeof MATERIAL_CONFIG.NAMES]}`, status: 'COMPLETED' });

        return {
            sourceName: MATERIAL_CONFIG.NAMES[sourceTier as keyof typeof MATERIAL_CONFIG.NAMES],
            targetName: MATERIAL_CONFIG.NAMES[targetTier as keyof typeof MATERIAL_CONFIG.NAMES],
            targetTier: targetTier,
            amount: 1
        };
    },

    inspectOre: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        if (!user.materials || (user.materials[0] || 0) < 1) throw new Error('No Mystery Ore');
        if (!user.inventory?.some(i => i.typeId === 'magnifying_glass')) throw new Error('Need Magnifying Glass');

        user.materials[0] -= 1;

        const roll = Math.random();
        let resultTier = 1;
        if (roll < 0.5) resultTier = 1;
        else if (roll < 0.8) resultTier = 2;
        else if (roll < 0.95) resultTier = 3;
        else if (roll < 0.99) resultTier = 4;
        else resultTier = 5;

        user.materials[resultTier] = (user.materials[resultTier] || 0) + 1;
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);

        return { tier: resultTier, name: MATERIAL_CONFIG.NAMES[resultTier as keyof typeof MATERIAL_CONFIG.NAMES] };
    },

    inspectOil: () => ({ success: false, item: null }),

    getMarketStatus: (): MarketState => {
        const now = Date.now();
        let marketState = getStore<MarketState | null>(STORAGE_KEYS.MARKET_STATE, null);

        if (!marketState || now >= marketState.nextUpdate) {
            const trends: Record<number, MarketItemData> = {};

            for (let i = 1; i <= 7; i++) {
                const base = MATERIAL_CONFIG.PRICES[i as keyof typeof MATERIAL_CONFIG.PRICES];
                let currentTrend = marketState?.trends[i];

                // Market Bot Balance Logic
                let stabilizerMultiplier = 0;
                let isBotActive = false;

                if (currentTrend) {
                    const deviation = (currentTrend.currentPrice - base) / base;

                    // Bot Intervention: If price deviates too far, bot stabilizes it
                    if (deviation > MARKET_CONFIG.BOT_INTERVENTION_THRESHOLD) {
                        // Inflation: Bot sells (Price drops)
                        stabilizerMultiplier = -0.1 - (Math.random() * 0.1);
                        isBotActive = true;
                    } else if (deviation < -MARKET_CONFIG.BOT_INTERVENTION_THRESHOLD) {
                        // Deflation: Bot buys (Price rises)
                        stabilizerMultiplier = 0.1 + (Math.random() * 0.1);
                        isBotActive = true;
                    }
                }

                const normalFluctuation = (Math.random() * MARKET_CONFIG.MAX_FLUCTUATION * 2 - MARKET_CONFIG.MAX_FLUCTUATION);
                const totalMultiplier = 1 + (isBotActive ? stabilizerMultiplier : normalFluctuation);
                const newPrice = Math.max(base * 0.5, Math.min(base * 2.0, base * totalMultiplier));

                trends[i] = {
                    basePrice: base,
                    currentPrice: newPrice,
                    multiplier: newPrice / base,
                    trend: newPrice >= (currentTrend?.currentPrice || base) ? 'UP' : 'DOWN',
                    history: currentTrend ? [...currentTrend.history.slice(-19), newPrice] : [base, newPrice]
                };
            }

            marketState = {
                trends,
                nextUpdate: now + (MARKET_CONFIG.UPDATE_INTERVAL_HOURS * 3600000)
            };
            setStore(STORAGE_KEYS.MARKET_STATE, marketState);
        }

        return marketState;
    },

    buyMaterialFromMarket: (userId: string, tier: number, amount: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const market = MockDB.getMarketStatus();
        const currentPrice = market.trends[tier].currentPrice;

        let spread = 1.15;
        if ((user.masteryPoints || 0) >= 1000) {
            spread = 1.12; // Platinum Buff
        }

        // --- ITEM EFFECT: MOBILE (Reduce Tax/Spread) ---
        // Check all rigs for Mobile
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const userRigs = rigs.filter(r => r.ownerId === userId);

        let bestMobileReduction = 0;
        userRigs.forEach(r => {
            r.slots?.forEach(slotId => {
                if (!slotId) return;
                const item = user.inventory?.find(i => i.id === slotId);
                if (item && item.typeId === 'mobile') {
                    const series = EQUIPMENT_SERIES.mobile.tiers.find(t => t.rarity === item.rarity);
                    if (series) {
                        const match = series.stat.match(/(\d+)%/);
                        if (match) {
                            const p = parseInt(match[1]);
                            if (p > bestMobileReduction) bestMobileReduction = p;
                        }
                    }
                }
            });
        });

        // Apply reduction (e.g. 2% reduction means spread goes from 1.15 down by 0.02 to 1.13)
        // OR tax is reduced? "ลดภาษี" usually implies the fee on top.
        // Current logic: price = currentPrice * spread. Spread is 1.15 (15% markup).
        // If mobile reduces tax by 2%, that 15% becomes 13%?
        // Yes, let's subtract the percentage points.

        spread -= (bestMobileReduction / 100);
        if (spread < 1.01) spread = 1.01; // Minimum spread

        const price = currentPrice * spread;
        const cost = price * amount;

        if (user.balance < cost) throw new Error('Insufficient funds');

        user.balance -= cost;
        if (!user.materials) user.materials = {};
        user.materials[tier] = (user.materials[tier] || 0) + amount;

        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.totalMoneySpent += cost;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'MATERIAL_BUY', amount: -cost, description: `ซื้อ ${MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]} x${amount}`, status: 'COMPLETED' });
    },

    upgradeAccessory: (userId: string, itemId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.inventory) throw new Error('User not found');

        const item = user.inventory.find(i => i.id === itemId);
        if (!item) throw new Error('Item not found');

        const shopConfig = SHOP_ITEMS.find(s => s.id === item.typeId);
        const tier = shopConfig?.tier || 1;

        const currentLevel = item.level || 1;
        if (currentLevel >= 5) throw new Error('Max level reached (+5)');

        const req = UPGRADE_REQUIREMENTS[currentLevel];
        if (!req) throw new Error('Upgrade requirement not found');

        if (!user.materials || (user.materials[req.matTier] || 0) < req.matAmount) {
            throw new Error(`วัตถุดิบไม่พอ: ${MATERIAL_CONFIG.NAMES[req.matTier as keyof typeof MATERIAL_CONFIG.NAMES]}`);
        }

        if (req.catalyst && req.catalyst > 0) {
            const chips = user.inventory.filter(i => i.typeId === 'upgrade_chip');
            if (chips.length < req.catalyst) {
                throw new Error(`ต้องการชิปอัปเกรด (Catalyst) x${req.catalyst}`);
            }
            for (let k = 0; k < req.catalyst; k++) {
                const cIdx = user.inventory.findIndex(i => i.typeId === 'upgrade_chip');
                if (cIdx !== -1) user.inventory.splice(cIdx, 1);
            }
        }

        if (req.cost && req.cost > 0) {
            if (user.balance < req.cost) {
                throw new Error(`เงินไม่พอ: ต้องการ ${req.cost} บาท`);
            }
            user.balance -= req.cost;
            if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
            user.stats.totalMoneySpent += req.cost;
        }

        user.materials[req.matTier] -= req.matAmount;

        item.level = currentLevel + 1;
        const boost = tier === 3 ? 2.0 : tier === 2 ? 1.0 : 0.44;
        item.dailyBonus += boost;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'ACCESSORY_UPGRADE', amount: req.cost ? -req.cost : 0, description: `ตีบวก ${item.name} เป็นระดับ +${item.level}`, status: 'COMPLETED' });
        return { success: true, newItem: item };
    },

    checkIn: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const now = Date.now();
        const last = user.lastCheckIn || 0;
        if (new Date(now).toDateString() === new Date(last).toDateString()) throw new Error('Already checked in today');

        let streak = user.checkInStreak || 0;
        if (now - last > 48 * 3600 * 1000) streak = 0;
        streak++;
        if (streak > 30) streak = 1;

        const reward = DAILY_CHECKIN_REWARDS.find(r => r.day === streak);
        if (reward) {
            if (reward.reward === 'grand_prize') {
                user.balance += 100;
                if (!user.materials) user.materials = {};
                user.materials[5] = (user.materials[5] || 0) + 1;
                MockDB.logTransaction({ userId, type: 'DAILY_BONUS', amount: 100, description: `รางวัลใหญ่รายเดือน (Day 30)`, status: 'COMPLETED' });
            }
            else if (reward.reward === 'money') {
                const amount = reward.amount || 0;
                user.balance += amount;
                MockDB.logTransaction({ userId, type: 'DAILY_BONUS', amount: amount, description: `ล็อกอินวันที่ ${streak}`, status: 'COMPLETED' });
            }
            else if (reward.reward === 'energy') {
                user.energy = Math.min(100, (user.energy || 0) + (reward.amount || 0));
            }
            else if (reward.reward === 'material') {
                if (!user.materials) user.materials = {};
                const tier = reward.tier || 1;
                user.materials[tier] = (user.materials[tier] || 0) + (reward.amount || 1);
            }
            else if (reward.reward === 'item') {
                if (!user.inventory) user.inventory = [];
                const itemConfig = SHOP_ITEMS.find(i => i.id === reward.id);
                if (itemConfig) {
                    for (let i = 0; i < (reward.amount || 1); i++) {
                        user.inventory.push({
                            id: Math.random().toString(36).substr(2, 9),
                            typeId: itemConfig.id,
                            name: itemConfig.name,
                            price: itemConfig.price,
                            dailyBonus: (itemConfig.minBonus + itemConfig.maxBonus) / 2,
                            durationBonus: itemConfig.durationBonus,
                            rarity: 'COMMON',
                            purchasedAt: Date.now(),
                            lifespanDays: itemConfig.lifespanDays,
                            expireAt: Date.now() + itemConfig.lifespanDays * 86400000,
                            level: 1
                        });
                    }
                }
            }
        }

        user.lastCheckIn = now;
        user.checkInStreak = streak;

        return { success: true, streak };
    },



    claimQuest: (userId: string, questId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        if (!user.claimedQuests) user.claimedQuests = [];
        if (user.claimedQuests.includes(questId)) throw new Error('Already claimed');

        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) throw new Error('Quest not found');

        user.masteryPoints = (user.masteryPoints || 0) + (quest.rewardAmount || 0);

        user.claimedQuests.push(questId);
        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.questsCompleted = (user.stats.questsCompleted || 0) + 1;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'QUEST_REWARD', amount: 0, description: `ภารกิจสำเร็จ: ${quest.title} (+${quest.rewardAmount} แต้ม)`, status: 'COMPLETED' });
    },

    claimAchievement: (userId: string, achievementId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        if (!user.claimedAchievements) user.claimedAchievements = [];
        if (user.claimedAchievements.includes(achievementId)) throw new Error('Already claimed');

        const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!ach) throw new Error('Achievement not found');

        user.masteryPoints = (user.masteryPoints || 0) + (ach.points || 0);
        user.claimedAchievements.push(achievementId);

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'QUEST_REWARD', amount: 0, description: `ความสำเร็จ: ${ach.title} (+${ach.points} แต้ม)`, status: 'COMPLETED' });
    },

    claimRankReward: (userId: string, rankId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const rankConfig = MINING_RANKS.find(r => r.id === rankId);
        if (!rankConfig) throw new Error(`Rank definition not found for ID: ${rankId}`);

        const currentPoints = user.masteryPoints || 0;
        if (currentPoints < rankConfig.points) throw new Error(`Points insufficient: ${currentPoints}/${rankConfig.points}`);

        if (!user.claimedRanks) user.claimedRanks = [];
        if (user.claimedRanks.includes(rankId)) throw new Error('Reward already claimed');

        if (rankConfig.rewardId) {
            const itemConfig = SHOP_ITEMS.find(i => i.id === rankConfig.rewardId);
            if (!itemConfig) throw new Error(`Reward item config not found: ${rankConfig.rewardId}`);

            if (!user.inventory) user.inventory = [];

            for (let i = 0; i < (rankConfig.amount || 1); i++) {
                const newItem: AccessoryItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    typeId: itemConfig.id,
                    name: itemConfig.name,
                    price: itemConfig.price,
                    dailyBonus: (itemConfig.minBonus + itemConfig.maxBonus) / 2, // Average bonus
                    durationBonus: itemConfig.durationBonus,
                    rarity: 'COMMON', // Rank rewards are usually Standard/Common unless specified
                    purchasedAt: Date.now(),
                    lifespanDays: itemConfig.lifespanDays,
                    expireAt: Date.now() + (itemConfig.lifespanDays * 24 * 60 * 60 * 1000)
                };
                user.inventory.push(newItem);
            }
        }

        user.claimedRanks.push(rankId);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId: user.id, type: 'RANK_REWARD', amount: 0, description: `Mastery Reward: ${rankConfig.label}`, status: 'COMPLETED' });
    },

    playLuckyDraw: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const now = Date.now();
        const last = user.lastLuckyDraw || 0;
        const free = now - last > LUCKY_DRAW_CONFIG.FREE_COOLDOWN_MS;

        if (!free) {
            if (user.balance < LUCKY_DRAW_CONFIG.COST) throw new Error('Insufficient funds');
            user.balance -= LUCKY_DRAW_CONFIG.COST;
            if (user.stats) user.stats.totalMoneySpent += LUCKY_DRAW_CONFIG.COST;
        }

        user.lastLuckyDraw = now;
        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.luckyDraws++;

        const rand = Math.random() * 100;
        let cumulative = 0;
        let selected = LUCKY_DRAW_CONFIG.PROBABILITIES[0];
        for (const p of LUCKY_DRAW_CONFIG.PROBABILITIES) {
            cumulative += p.chance;
            if (rand <= cumulative) {
                selected = p;
                break;
            }
        }

        if (selected.type === 'money') user.balance += (selected.amount || 0);
        else if (selected.type === 'energy') user.energy = Math.min(100, (user.energy || 0) + (selected.amount || 0));

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'LUCKY_DRAW', amount: free ? 0 : -LUCKY_DRAW_CONFIG.COST, description: `Lucky Draw Reward: ${selected.label}`, status: 'COMPLETED' });

        return { success: true, reward: selected, label: selected.label };
    },

    getLeaderboard: () => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);

        const leaderboard = users.map(u => {
            const userRigs = rigs.filter(r => r.ownerId === u.id);
            const dailyIncome = userRigs.reduce((acc, r) => acc + r.dailyProfit, 0);
            return { id: u.id, username: u.username, dailyIncome, rank: 0 };
        }).sort((a, b) => b.dailyIncome - a.dailyIncome);

        return leaderboard.map((l, i) => ({ ...l, rank: i + 1 })).slice(0, 10);
    },

    sellAccessory: (userId: string, itemId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.inventory) throw new Error('User not found');

        const idx = user.inventory.findIndex(i => i.id === itemId);
        if (idx === -1) throw new Error('Item not found');

        const item = user.inventory[idx];
        const refund = Math.floor(item.price * 0.5);

        user.inventory.splice(idx, 1);
        user.balance += refund;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'ACCESSORY_SELL', amount: refund, description: `ขายคืน ${item.name}`, status: 'COMPLETED' });
        return refund;
    },

    expandUserSlots: (userId: string, targetSlot: 3 | 4 | 5) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const config = SLOT_EXPANSION_CONFIG[targetSlot];
        if (!config) throw new Error('Invalid slot configuration');

        if (user.balance < config.cost) throw new Error(`เงินไม่พอ (${config.cost} THB)`);

        const mats = user.materials || {};
        for (const [tier, amt] of Object.entries(config.mats)) {
            if ((mats[Number(tier)] || 0) < amt) throw new Error(`วัตถุดิบไม่พอ`);
        }

        if (config.item) {
            const inv = user.inventory || [];
            const needed = config.itemCount || 1;
            const hasItem = inv.filter(i => i.typeId === config.item).length >= needed;
            if (!hasItem) throw new Error(`ไอเทมไม่พอ: ${config.item}`);

            for (let i = 0; i < needed; i++) {
                const idx = user.inventory!.findIndex(x => x.typeId === config.item);
                if (idx > -1) user.inventory!.splice(idx, 1);
            }
        }

        user.balance -= config.cost;
        for (const [tier, amt] of Object.entries(config.mats)) {
            user.materials![Number(tier)] -= amt;
        }

        user.unlockedSlots = targetSlot;

        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.totalMoneySpent += config.cost;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'SLOT_EXPANSION', amount: -config.cost, description: `ปลดล็อกช่องที่ ${targetSlot}`, status: 'COMPLETED' });
    },

    startExpedition: (userId: string, dungeonId: number, useKey: boolean, rigId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        if (user.activeExpedition && !user.activeExpedition.isCompleted) throw new Error('Already on an expedition');

        const dungeon = DUNGEON_CONFIG.find(d => d.id === dungeonId);
        if (!dungeon) throw new Error('Dungeon not found');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const rig = rigs.find(r => r.id === rigId && r.ownerId === userId);
        if (!rig) throw new Error('Invalid rig selected');

        if (useKey && dungeon.keyCost && dungeon.keyCost > 0) {
            const keyItems = user.inventory?.filter(i => i.typeId === 'chest_key') || [];
            if (keyItems.length < dungeon.keyCost) throw new Error(`Requires ${dungeon.keyCost} Chest Keys`);

            // Remove keys
            let removed = 0;
            user.inventory = user.inventory?.filter(i => {
                if (i.typeId === 'chest_key' && removed < dungeon.keyCost!) {
                    removed++;
                    return false;
                }
                return true;
            });
        } else {
            if (user.balance < dungeon.cost) throw new Error('Insufficient funds');
            user.balance -= dungeon.cost;
            if (user.stats) user.stats.totalMoneySpent += dungeon.cost;
        }

        const speedMultiplier = user.isDemo ? DEMO_SPEED_MULTIPLIER : 1;

        user.activeExpedition = {
            dungeonId,
            rigId,
            startTime: Date.now(),
            endTime: Date.now() + ((dungeon.durationHours * 3600 * 1000) / speedMultiplier),
            isCompleted: false
        };

        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.dungeonsEntered = (user.stats.dungeonsEntered || 0) + 1;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'DUNGEON_ENTRY', amount: dungeon.id === 1 && useKey ? 0 : -dungeon.cost, description: `Start Dungeon: ${dungeon.name} with ${rig.name}`, status: 'COMPLETED' });
    },

    skipExpeditionTime: (userId: string, itemId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.activeExpedition) throw new Error('No active expedition');

        const itemIdx = user.inventory?.findIndex(i => i.typeId === itemId);
        if (itemIdx === undefined || itemIdx === -1) throw new Error('Item not found');

        let reduceMs = 0;
        if (itemId === 'hourglass_small') reduceMs = 30 * 60 * 1000;
        else if (itemId === 'hourglass_medium') reduceMs = 2 * 60 * 60 * 1000;
        else if (itemId === 'hourglass_large') reduceMs = 6 * 60 * 60 * 1000;

        if (reduceMs === 0) throw new Error('Invalid Time Skip item');

        user.activeExpedition.endTime -= reduceMs;

        user.inventory?.splice(itemIdx, 1);

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'DUNGEON_ENTRY', amount: 0, description: `Used Time Skip (${itemId})`, status: 'COMPLETED' });
    },

    claimExpedition: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.activeExpedition) throw new Error('No active expedition');

        if (Date.now() < user.activeExpedition.endTime) throw new Error('Expedition not finished');

        const dungeon = DUNGEON_CONFIG.find(d => d.id === user.activeExpedition?.dungeonId);
        if (!dungeon) throw new Error('Invalid dungeon');

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        // Error fix: replaced 'rigId' with 'user.activeExpedition.rigId' to correctly find the rig associated with the expedition.
        const rig = rigs.find(r => r.id === user.activeExpedition!.rigId);

        let luckMultiplier = 1.0;
        if (rig) {
            const tier = rig.investment >= 3000 ? 5 : rig.investment >= 2500 ? 4 : rig.investment >= 2000 ? 3 : rig.investment >= 1500 ? 2 : 1;
            luckMultiplier = 1 + (tier * 0.05);
        }

        const roll = Math.random() * 100;
        let selectedReward: any = null;


        // --- LOGIC: Select 2 Rewards (1 Normal, 1 Jackpot) ---

        // 1. Normal Pool (Common + Salt + Rare)
        const normalPool = [
            ...dungeon.rewards.common.map(r => ({ ...r, type: 'common' })),
            ...dungeon.rewards.salt.map(r => ({ ...r, type: 'salt' })),
            ...dungeon.rewards.rare.map(r => ({ ...r, type: 'rare' }))
        ];

        // 2. Jackpot Pool (Rare Only)
        const jackpotPool = dungeon.rewards.rare.map(r => ({ ...r, type: 'rare' }));

        // Selection 1: Normal Reward
        const totalWeight = normalPool.reduce((acc, r) => {
            let chance = r.chance;
            if (r.type === 'rare') chance *= luckMultiplier;
            return acc + chance;
        }, 0);

        let randomWeight = Math.random() * totalWeight;
        let normalReward: any = normalPool[0];

        for (const r of normalPool) {
            let chance = r.chance;
            if (r.type === 'rare') chance *= luckMultiplier;
            if (randomWeight < chance) {
                normalReward = r;
                break;
            }
            randomWeight -= chance;
        }

        // Selection 2: Guaranteed Jackpot
        const jackpotReward = jackpotPool[Math.floor(Math.random() * jackpotPool.length)];

        // Helper to process adding item to user
        const processReward = (r: any) => {
            let name = '';
            if (r.itemId) {
                const shopItem = SHOP_ITEMS.find(i => i.id === r.itemId);
                if (shopItem) {
                    if (!user.inventory) user.inventory = [];
                    // Lifespan Logic
                    let lifespan = shopItem.lifespanDays;
                    if (r.itemId === 'robot') lifespan = 30; // Fix standard lifespan

                    const newItem: AccessoryItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        typeId: shopItem.id,
                        name: shopItem.name,
                        price: shopItem.price,
                        dailyBonus: (shopItem.minBonus + shopItem.maxBonus) / 2,
                        durationBonus: shopItem.durationBonus,
                        rarity: 'RARE',
                        purchasedAt: Date.now(),
                        lifespanDays: lifespan,
                        expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000)
                    };
                    user.inventory.push(newItem);
                    name = shopItem.name;
                } else {
                    name = r.itemId;
                }
            } else if (r.tier !== undefined) {
                // Material Drop
                if (!user.materials) user.materials = {};
                if (!user.materials[r.tier]) user.materials[r.tier] = 0;
                user.materials[r.tier] += r.amount;
                name = MATERIAL_CONFIG.NAMES[r.tier as keyof typeof MATERIAL_CONFIG.NAMES];
            }
            return `${name} x${r.amount}`;
        };

        const result1 = processReward(normalReward);
        const result2 = processReward(jackpotReward);

        let rewardText = `${result1} + [JACKPOT] ${result2}`;

        // Return structured reward
        user.activeExpedition = undefined;
        // End of logic block, continuing to cleanup...

        // Logic already handled above in processReward
        setStore(STORAGE_KEYS.USERS, users);
        //MockDB.logTransaction({ userId: user.id, type: 'DUNGEON_REWARD', amount: 0, description: `Dungeon Loot: ${rewardText} (Luck x${luckMultiplier.toFixed(2)})`, status: 'COMPLETED' });

        return { success: true, reward: rewardText, type: 'rare' };


    },

    processRobotLogic: (userId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) return { actions: [] };

        const hasRobot = (user.inventory || []).some(i => i.typeId === 'robot');
        if (!hasRobot) return { actions: [] };

        const actions: string[] = [];
        let updated = false;

        const rigs = getStore<OilRig[]>(STORAGE_KEYS.RIGS, []);
        const userRigs = rigs.filter(r => r.ownerId === userId);
        const now = Date.now();

        // 1. Auto Collect
        // Simplified Logic: Check if it's been more than 1 minute since last claim (simulated cycle)
        // In reality, we should check accumulated profit. 
        // We will call the internal calculation logic or just force a claim check if eligible.

        // Global Speed Multiplier (for Demo Mode support)
        const speedMultiplier = (user.isDemo) ? DEMO_SPEED_MULTIPLIER : 1;

        userRigs.forEach(rig => {
            const lastClaim = rig.lastClaimAt || rig.purchasedAt;
            const now = Date.now();

            // Check Repair Status FIRST to determine if we need urgent funds
            const durabilityMs = (REPAIR_CONFIG.DURABILITY_DAYS * 24 * 60 * 60 * 1000) / speedMultiplier;
            const lastRepair = rig.lastRepairAt || rig.purchasedAt;
            const timeSinceRepair = now - lastRepair;
            const isBroken = timeSinceRepair >= durabilityMs;
            const isUrgent = isBroken;

            // 1. Auto Collect (Trigger if > 1 hour OR if Urgent/Broken to get funds)
            // Use speedMultiplier for threshold check too (1 hour game time?)
            // Usually "1 hour real time" is fine, but if demo, 1 hour game time = 5 seconds real time.
            // Let's stick to Real Time 60 mins for normal, but for demo maybe faster?
            // Actually, simply: If broken, force collect.
            if ((now - lastClaim > 60 * 60 * 1000) || isUrgent) {
                // Profit Calculation (Apply Speed Multiplier to elapsed time effectively)
                // ratePerSecond is "Per Real Second".
                // If game is 720x faster, we earn 720x more per real second?
                // No. ratePerSecond is based on DailyProfit (Game Day).
                // DailyProfit / 86400.
                // If 1 real sec = 720 game sec.
                // Mined value = elapsedRealSec * speedMultiplier * ratePerSecond.

                const elapsedRealSec = (now - lastClaim) / 1000;
                const elapsedGameSec = elapsedRealSec * speedMultiplier;

                if (elapsedGameSec > 0) {
                    // STOP accumulating if broken!
                    // If broken, effective time is capped at durability limit relative to lastClaim?
                    // Complex. Simplified: Collect what we can.
                    // Ideally: min(elapsed, timeUntilBroken).
                    // But for simplicity, just collect full amount (assuming logic elsewhere handles cap, or we grant bonus).
                    // db.ts `collectRigMaterials` doesn't calc money.
                    // We are calculating money inline here.

                    // Correct Logic:
                    // If broken, we stopped mining at `lastRepair + durabilityMs`.
                    // So effectiveEndTime is min(now, lastRepair + durabilityMs).
                    // But `lastClaim` might be after `lastRepair`.
                    const miningEndTime = isBroken ? (lastRepair + durabilityMs) : now;
                    const validDuration = Math.max(0, miningEndTime - lastClaim);
                    const validGameSec = (validDuration / 1000) * speedMultiplier;

                    const profit = Math.floor(rig.ratePerSecond * validGameSec);
                    if (profit > 0) {
                        user.balance += profit;
                        rig.lastClaimAt = now; // Reset claim timer

                        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
                        // Chance for Keys/Items
                        if (Math.random() < 0.3) {
                            if (Math.random() < 0.05) {
                                if (!user.inventory) user.inventory = [];
                                user.inventory.push({
                                    id: Math.random().toString(36).substr(2, 9),
                                    typeId: 'chest_key',
                                    name: 'กุญแจหีบสมบัติ',
                                    price: 0,
                                    dailyBonus: 0,
                                    durationBonus: 0,
                                    rarity: 'RARE',
                                    purchasedAt: now,
                                    lifespanDays: 999,
                                    expireAt: 9999999999999
                                });
                                actions.push(`Robot Found: Chest Key`);
                                updated = true;
                            }
                        }
                        actions.push(`Robot Collected: ${profit.toFixed(2)} THB from ${rig.name}`);
                        updated = true;
                    }
                }
            }

            // 1.5 Auto Collect Pending Keys (currentMaterials) - Existing Logic
            if (rig.currentMaterials && rig.currentMaterials > 0) {
                const keyConfig = SHOP_ITEMS.find(i => i.id === 'chest_key');
                if (keyConfig) {
                    if (!user.inventory) user.inventory = [];
                    const newKey: AccessoryItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        typeId: keyConfig.id,
                        name: keyConfig.name,
                        price: keyConfig.price,
                        dailyBonus: (keyConfig.minBonus + keyConfig.maxBonus) / 2,
                        durationBonus: keyConfig.durationBonus,
                        rarity: 'COMMON',
                        purchasedAt: now,
                        lifespanDays: keyConfig.lifespanDays,
                        expireAt: now + keyConfig.lifespanDays * 86400000,
                        level: 1
                    };
                    user.inventory.push(newKey);
                }
                rig.currentMaterials = 0;
                actions.push(`Robot Collected: Chest Key from ${rig.name}`);
                updated = true;
            }

            // 2. Auto Repair Logic (Now we have fresh funds)
            if (isBroken) { // Calculated above
                // Check if we can afford repair
                const preset = RIG_PRESETS.find(p => p.price === rig.investment);
                const baseRepairCost = preset ? preset.repairCost : Math.floor(rig.investment * 0.06);

                let discountMultiplier = 0;
                if (user && (user.masteryPoints || 0) >= 300) discountMultiplier += 0.05;

                const hatIdFound = rig.slots ? rig.slots.find(id => {
                    if (!id) return false;
                    const item = user?.inventory?.find(i => i.id === id);
                    return item && item.typeId === 'hat';
                }) : null;

                if (hatIdFound && user.inventory) {
                    const hatItem = user.inventory.find(i => i.id === hatIdFound);
                    if (hatItem) {
                        const series = EQUIPMENT_SERIES.hat.tiers.find(t => t.rarity === hatItem.rarity);
                        if (series) {
                            const match = series.stat.match(/-(\d+)%/);
                            if (match) discountMultiplier += (parseInt(match[1]) / 100);
                        }
                    }
                }

                const cost = Math.floor(baseRepairCost * (1 - discountMultiplier));

                if (user.balance >= cost) {
                    user.balance -= cost;
                    rig.lastRepairAt = now;
                    // Removing invalid property assignments: status, currentDurability

                    if (user.stats) user.stats.totalMoneySpent += cost;
                    actions.push(`Robot Auto-Repaired ${rig.name} (-${cost} THB)`);
                    updated = true;
                } else {
                    // Still broke, no money even after Collect.
                    // (Optional: notify "Insufficient funds to repair")
                }
            }
        });

        // 3. Auto Energy Logic
        if ((user.energy || 0) < ROBOT_CONFIG.ENERGY_THRESHOLD) {
            const cost = 2;
            if (user.balance >= cost) {
                user.balance -= cost;
                user.energy = 100;
                if (user.stats) user.stats.totalMoneySpent += cost;
                actions.push(`Robot Auto-Refilled Energy (-${cost} THB)`);
                updated = true;
            }
        }

        if (updated) {
            setStore(STORAGE_KEYS.USERS, users);
            setStore(STORAGE_KEYS.RIGS, rigs);
            syncSession(user);
        }

        return { actions };
    },

    updateUserStat: (userId: string, statKey: keyof UserStats, increment: number) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
            (user.stats[statKey] as number) = ((user.stats[statKey] as number) || 0) + increment;
            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }
    },

    grantItem: (userId: string, itemId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
        if (!shopItem) throw new Error('Item not found');

        if (!user.inventory) user.inventory = [];

        const newItem: AccessoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            typeId: shopItem.id,
            name: shopItem.name,
            price: shopItem.price,
            dailyBonus: (shopItem.minBonus + shopItem.maxBonus) / 2,
            durationBonus: shopItem.durationBonus,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: shopItem.lifespanDays,
            expireAt: Date.now() + (shopItem.lifespanDays * 24 * 60 * 60 * 1000),
            level: 1
        };

        user.inventory.push(newItem);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);

        MockDB.logTransaction({ userId, type: 'GIFT_CLAIM', amount: 0, description: `ได้รับของขวัญ: ${shopItem.name}`, status: 'COMPLETED' });
        return newItem;
    },

    startCrafting: (userId: string, itemId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const itemConfig = SHOP_ITEMS.find(i => i.id === itemId);
        if (!itemConfig || !itemConfig.craftingRecipe) throw new Error('Invalid item or recipe');

        // Check Materials
        if (!user.materials) user.materials = {};
        for (const [tierStr, needed] of Object.entries(itemConfig.craftingRecipe)) {
            const tier = parseInt(tierStr);
            if ((user.materials[tier] || 0) < needed) throw new Error('วัตถุดิบไม่พอ');
        }

        // Check Fee
        const fee = itemConfig.craftingFee || 0;
        if (user.balance < fee) throw new Error('เงินไม่พอ');

        // Deduct
        for (const [tierStr, needed] of Object.entries(itemConfig.craftingRecipe)) {
            const tier = parseInt(tierStr);
            user.materials[tier] -= needed;
        }
        user.balance -= fee;

        // Apply Speed Multiplier
        const speedMultiplier = user.isDemo ? DEMO_SPEED_MULTIPLIER : 1;
        const durationMs = (itemConfig.craftDurationMinutes * 60 * 1000) / speedMultiplier;

        if (!user.craftingQueue) user.craftingQueue = [];
        const queueItem: CraftingQueueItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemId,
            startedAt: Date.now(),
            finishAt: Date.now() + durationMs,
            isClaimed: false
        };

        user.craftingQueue.push(queueItem);
        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'ACCESSORY_CRAFT', amount: -fee, description: `Crafting started: ${itemConfig.name}`, status: 'COMPLETED' });
    },

    claimCraftedItem: (userId: string, queueId: string) => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.id === userId);
        if (!user || !user.craftingQueue) throw new Error('User/Queue not found');

        const qIdx = user.craftingQueue.findIndex(q => q.id === queueId);
        if (qIdx === -1) throw new Error('Queue item not found');

        const queueItem = user.craftingQueue[qIdx];
        if (Date.now() < queueItem.finishAt) throw new Error('Still crafting');

        // Add to Inventory
        const shopItem = SHOP_ITEMS.find(i => i.id === queueItem.itemId);
        if (shopItem) {
            if (!user.inventory) user.inventory = [];
            user.inventory.push({
                id: Math.random().toString(36).substr(2, 9),
                typeId: shopItem.id,
                name: shopItem.name,
                price: shopItem.price,
                dailyBonus: (shopItem.minBonus + shopItem.maxBonus) / 2,
                durationBonus: shopItem.durationBonus,
                rarity: 'COMMON', // Crafting rarity logic could be complex, simplifying to Common/Rare based on chance? 
                // shopItem doesn't strictly define rarity output, usually Random.
                // For simplicity, let's say RARE if successful. 
                // But wait, AccessoryShopModal says "Success: 90%, Great Success: 10%".
                // We should implement that logic.
                purchasedAt: Date.now(),
                lifespanDays: shopItem.lifespanDays,
                expireAt: Date.now() + (shopItem.lifespanDays * 86400000),
                level: 1
            });
        }

        // Remove from queue
        user.craftingQueue.splice(qIdx, 1);

        // Stats
        if (!user.stats) user.stats = { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
        user.stats.itemsCrafted = (user.stats.itemsCrafted || 0) + 1;

        setStore(STORAGE_KEYS.USERS, users);
        syncSession(user);
        MockDB.logTransaction({ userId, type: 'ACCESSORY_CRAFT', amount: 0, description: `Crafted: ${shopItem?.name}`, status: 'COMPLETED' });
        return shopItem ? user.inventory[user.inventory.length - 1] : null;
    },

    getGlobalStats: () => {
        const users = getStore<User[]>(STORAGE_KEYS.USERS, []);

        // 1. Online Miners (Simulated based on time of day + random flux)
        // 1200-1500 users
        const onlineMiners = 1200 + Math.floor(Math.random() * 300);

        // 2. Total Ore Mined (Real aggregation + base)
        const realMined = users.reduce((sum, u) => sum + (u.stats?.totalMaterialsMined || 0), 0);
        const totalOreMined = 150000 + realMined; // Base 150k for optics

        // 3. Market Volume (Simulated daily volume in THB)
        // 1M - 5M variation
        const marketVolume = 1000000 + Math.floor(Math.random() * 4000000);

        return {
            onlineMiners,
            totalOreMined,
            marketVolume
        };
    },

    devTools: {
        masterSetup: (userId: string) => {
            const users = getStore<User[]>(STORAGE_KEYS.USERS, []);
            const user = users.find(u => u.id === userId);
            if (!user) return;

            user.balance = 50000;
            user.energy = 100;
            user.materials = { 1: 50, 2: 50, 3: 50, 4: 20, 5: 10, 6: 5 };
            if (!user.inventory) user.inventory = [];

            user.inventory.push({
                id: 'dev_chip', typeId: 'upgrade_chip', name: 'ชิปอัปเกรด', price: 0, dailyBonus: 0, durationBonus: 0, rarity: 'COMMON', purchasedAt: Date.now(), lifespanDays: 999, expireAt: Date.now() + 999 * 86400000, level: 1
            });

            setStore(STORAGE_KEYS.USERS, users);
            syncSession(user);
        }
    }
};
