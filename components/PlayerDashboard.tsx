
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Hammer, LogOut, User as UserIcon, Coins, TrendingUp, Bell, CheckCircle2, AlertCircle, History, PlusCircle, Wallet, ArrowUpRight, Gift, Clock, ShoppingBag, Briefcase, Zap, Settings, Timer, Bug, Key, Menu, X, Home, Package, FlaskConical, TestTube2, Gem, Trophy, Users, BookOpen, Grid, BarChart2, Backpack, CalendarCheck, Target, Crown, Lock, Skull } from 'lucide-react';
import { RigCard } from './RigCard';
import { InvestmentModal } from './InvestmentModal';
import { WithdrawModal } from './WithdrawModal';
import { DepositModal } from './DepositModal';
import { LootBoxModal } from './LootBoxModal';
import { LootRatesModal } from './LootRatesModal';
import { HistoryModal } from './HistoryModal';
import { GiftSystemModal } from './GiftSystemModal';
import { AccessoryShopModal } from './AccessoryShopModal';
import { SettingsModal } from './SettingsModal';
import { WarehouseModal } from './WarehouseModal';
import { LeaderboardModal } from './LeaderboardModal';
import { ReferralModal } from './ReferralModal';
import { DevToolsModal } from './DevToolsModal';
import { MarketModal } from './MarketModal';
import { InventoryModal } from './InventoryModal';
import { DailyBonusModal } from './DailyBonusModal';
import { MissionModal } from './MissionModal';
import { VIPModal } from './VIPModal';
import { AccessoryManagementModal } from './AccessoryManagementModal';
import { SlotUnlockModal } from './SlotUnlockModal';
import { DungeonModal } from './DungeonModal';
import { GameGuideModal } from './GameGuideModal';
import { GloveRevealModal } from './GloveRevealModal';
import { GoldRain } from './GoldRain';
import { ChatSystem } from './ChatSystem';
import { OilRig, User, Rarity, Notification, AccessoryItem, MarketState } from '../services/types';
import { CURRENCY, RigPreset, MAX_RIGS_PER_USER, RARITY_SETTINGS, SHOP_ITEMS, MAX_ACCESSORIES, RIG_PRESETS, ENERGY_CONFIG, REPAIR_CONFIG, GLOVE_DETAILS, MATERIAL_CONFIG, DEMO_SPEED_MULTIPLIER, ROBOT_CONFIG } from '../constants';
import { MockDB } from '../services/db';
import { api } from '../services/api';

const getItemIconPath = (typeId: string) => {
    switch (typeId) {
        case 'hat': return '/assets/items/hat.png';
        case 'glasses': return '/assets/items/glasses.png';
        case 'uniform': return '/assets/items/uniform.png';
        case 'bag': return '/assets/items/bag.png';
        case 'boots': return '/assets/items/boots.png';
        case 'mobile': return '/assets/items/mobile.png';
        case 'pc': return '/assets/items/pc.png';
        case 'auto_excavator': return '/assets/items/excavator.png';
        case 'robot': return '/assets/items/robot.png';
        case 'upgrade_chip': return '/assets/items/chip.png';
        default: return null;
    }
};

const EnergyTimer = ({ percent, mode = 'timer' }: { percent: number; mode?: 'timer' | 'percent' }) => {
    const [seconds, setSeconds] = useState(Math.floor((percent / 100) * 86400));

    useEffect(() => {
        const newSeconds = Math.floor((percent / 100) * 86400);
        // FORCE SYNC: If percent is 100, we must show 86400 (FULL)
        // If the gap is more than 5 seconds, sync back to prop
        if (percent >= 100 || Math.abs(newSeconds - seconds) > 5) {
            setSeconds(newSeconds);
        }
    }, [percent]);

    useEffect(() => {
        if (seconds <= 0) return;
        const interval = setInterval(() => {
            setSeconds(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [seconds]);

    if (mode === 'percent') {
        const currentPercent = (seconds / 86400) * 100;
        return <>{currentPercent.toFixed(2)}%</>;
    }

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return (
        <span className="font-mono tabular-nums text-stone-300 font-bold tracking-wider">
            {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </span>
    );
};

interface PlayerDashboardProps {
    initialUser: User;
    onLogout: () => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ initialUser, onLogout }) => {
    // ... state ...
    const [user, setUser] = useState<User>(initialUser);
    const [rigs, setRigs] = useState<OilRig[]>([]);
    const [inventory, setInventory] = useState<AccessoryItem[]>([]);
    const [globalStats, setGlobalStats] = useState({ onlineMiners: 0, totalOreMined: 0, marketVolume: 0 });

    // Modals
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isGiftSystemOpen, setIsGiftSystemOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [marketTier, setMarketTier] = useState<number | undefined>(undefined);

    // NEW MODALS
    const [isDailyBonusOpen, setIsDailyBonusOpen] = useState(false);
    const [isMissionOpen, setIsMissionOpen] = useState(false);
    const [isVIPOpen, setIsVIPOpen] = useState(false);
    const [isDungeonOpen, setIsDungeonOpen] = useState(false);
    const [isGameGuideOpen, setIsGameGuideOpen] = useState(false);

    // SLOT UNLOCK
    const [unlockTargetSlot, setUnlockTargetSlot] = useState<number | null>(null);

    // Manage Glove State
    const [managingAccessory, setManagingAccessory] = useState<{ rigId: string, slotIndex: number } | null>(null);

    const [energyConfirm, setEnergyConfirm] = useState<{ isOpen: boolean, cost: number } | null>(null);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasPendingTx, setHasPendingTx] = useState(false);
    const [showGoldRain, setShowGoldRain] = useState(false);
    const [isCharging, setIsCharging] = useState(false);
    const [lootResult, setLootResult] = useState<{ rarity: Rarity, bonus: number, itemTypeId?: string, itemName?: string, materialId?: number } | null>(null);
    const [gloveReveal, setGloveReveal] = useState<{ name: string, rarity: string, bonus: number } | null>(null);

    // ... useEffects and helper functions ...
    // Ref to block refresh during sensitive operations
    const skipRefreshRef = useRef(false);


    useEffect(() => {
        refreshData();
    }, []);

    const activeInventory = inventory.filter(item => {
        return (!item.expireAt || item.expireAt > Date.now());
    });

    const hasVibranium = activeInventory.some(i => i.typeId === 'vibranium');
    const globalMultiplier = hasVibranium ? 2 : 1;
    const hasAIRobot = activeInventory.some(i => i.typeId === 'robot');

    const addNotification = (notif: Notification) => {
        setNotifications([notif]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, 2000);
    };

    const triggerGoldRain = () => {
        setShowGoldRain(true);
        setTimeout(() => setShowGoldRain(false), 5000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
            const msgs = MockDB.getUserNotifications(user.id);
            if (msgs.length > 0) {
                msgs.forEach(n => {
                    MockDB.markNotificationRead(n.id);
                    addNotification(n);
                });
            }

            // --- AI ROBOT LOGIC START ---
            if (hasAIRobot) {
                const robotResult = MockDB.processRobotLogic(user.id);
                if (robotResult.actions.length > 0) {
                    robotResult.actions.forEach(action => {
                        addNotification({ id: Date.now().toString() + Math.random(), userId: user.id, title: 'AI Robot Action', message: action, type: 'INFO', timestamp: Date.now(), read: false });
                    });
                }

                // Smart Notification: Market (Check every 10s roughly, or just check every loop? simple check)
                // Rate limit to avoid spam, or check changes.
                // For now, let's just check if current market state warrants valid 'surge'
                // Ideally this should be in `processRobotLogic` but doing it here for UI feedback visibility
                const m = MockDB.getMarketStatus();
                Object.entries(m.trends).forEach(([tier, data]) => {
                    const priceChange = (data.currentPrice - data.basePrice) / data.basePrice;
                    if (priceChange >= ROBOT_CONFIG.NOTIFY_PRICE_THRESHOLD) {
                        // Check if we haven't notified recently? 
                        // Simplification: Not implemented debouncing here to keep it simple, 
                        // but ideally should verify if we hold this material.
                        // "Alert if price of material I OWN surges"
                        // Since `user.materials` is available here:
                        const myCount = user.materials[parseInt(tier)] || 0;
                        if (myCount > 0 && Math.random() < 0.05) { // 5% chance per tick to show, preventing spam
                            addNotification({
                                id: `surge_${tier}_${Date.now()}`,
                                userId: user.id,
                                title: '📈 Market Surge Alert!',
                                message: `ราคา ${MATERIAL_CONFIG.NAMES[parseInt(tier) as keyof typeof MATERIAL_CONFIG.NAMES]} พุ่งสูง! (${(priceChange * 100).toFixed(0)}%) รีบไปขายเร็ว!`,
                                type: 'INFO',
                                timestamp: Date.now(),
                                read: false
                            });
                        }
                    }
                });
            }
            // --- AI ROBOT LOGIC END ---

        }, 2000);
        return () => clearInterval(interval);
    }, [user.id, hasAIRobot]); // Add hasAIRobot dependency




    const refreshData = async () => {
        if (skipRefreshRef.current) return;
        try {
            // 1. Fetch Latest Data
            let remoteUser, remoteRigs;

            if (user.isDemo) {
                // Demo Mode: Fetch from Local MockDB
                remoteUser = MockDB.getSession();
                remoteRigs = MockDB.getMyRigs(user.id);
            } else {
                // Real Mode: Fetch from API
                [remoteUser, remoteRigs] = await Promise.all([
                    api.getMe(),
                    api.getMyRigs()
                ]);
            }

            if (skipRefreshRef.current) return; // Prevent overwriting if blocked during fetch

            // 2. Sync to LocalStorage (Bridge for MockDB legacy logic)
            // Ensure remoteUser has all fields MockDB expects
            const mergedUser = {
                ...MockDB.getSession(), // Keep local state like 'lastCheckIn' if not in backend
                ...remoteUser,
                id: remoteUser.id || (remoteUser as any)._id // Ensure ID match
            };

            // Overwrite specific keys MockDB uses
            if (typeof window !== 'undefined') {
                localStorage.setItem('oil_baron_session', JSON.stringify(mergedUser));
                // Update USER list item too
                const users = JSON.parse(localStorage.getItem('oil_baron_users') || '[]');
                const updatedUsers = users.map((u: any) => u.id === mergedUser.id ? mergedUser : u);
                if (!users.find((u: any) => u.id === mergedUser.id)) updatedUsers.push(mergedUser);
                localStorage.setItem('oil_baron_users', JSON.stringify(updatedUsers));

                // Rigs (Filter out others? Or just replace mining ones)
                // For now, let's assume API is source of truth for MY rigs.
                // But MockDB stores ALL users rigs in one array? No, getMyRigs filters by ID.
                // But setStore(RIGS) overwrites everything.
                // We should NOT destroy other users rigs if we are multi-user locally?
                // Given we are moving to backend, local multi-user is less relevant.
                // For simplicity: Update local rigs for THIS user.
                const allRigs = JSON.parse(localStorage.getItem('oil_baron_rigs') || '[]');
                const otherRigs = allRigs.filter((r: any) => r.ownerId !== mergedUser.id);
                localStorage.setItem('oil_baron_rigs', JSON.stringify([...otherRigs, ...remoteRigs]));
            }

            // 3. Update React State
            setUser(mergedUser as User);
            setRigs(remoteRigs);

            // 4. Update Global/Local Stats
            const bal = mergedUser.balance; // Use merged
            const inv = mergedUser.inventory || [];
            const mats = mergedUser.materials || {};
            const energy = mergedUser.energy || 0;

            // Note: mocked stats might be inaccurate if backend doesn't calculate them
            const txs = MockDB.getTransactions(user.id); // Local transactions only?
            setHasPendingTx(txs.some(t => t.status === 'PENDING'));

            // 4. Update Global/Local Stats
            api.getGlobalStats().then(stats => setGlobalStats(stats)).catch(err => console.error("Failed to fetch global stats", err));
            setInventory(inv);

        } catch (error) {
            console.error("Failed to refresh data from API:", error);
            // Fallback to local only?
        }
    };

    const calculateLoot = (): { rarity: Rarity, bonus: number } => {
        const rand = Math.random() * 100;
        if (rand < 80) return { rarity: 'COMMON', bonus: RARITY_SETTINGS.COMMON.bonus };
        if (rand < 91) return { rarity: 'RARE', bonus: RARITY_SETTINGS.RARE.bonus };
        if (rand < 96) return { rarity: 'SUPER_RARE', bonus: RARITY_SETTINGS.SUPER_RARE.bonus };
        if (rand < 99) return { rarity: 'EPIC', bonus: RARITY_SETTINGS.EPIC.bonus };
        return { rarity: 'LEGENDARY', bonus: RARITY_SETTINGS.LEGENDARY.bonus };
    };

    const energyLevel = user.energy !== undefined ? user.energy : 100;
    const isPowered = energyLevel > 0;

    const handleRefillEnergyClick = () => {
        const missingEnergy = 100 - energyLevel;
        let estimatedCost = missingEnergy * ENERGY_CONFIG.COST_PER_UNIT;
        // Apply minimum fee
        if (estimatedCost < ENERGY_CONFIG.MIN_REFILL_FEE) {
            estimatedCost = ENERGY_CONFIG.MIN_REFILL_FEE;
        }
        estimatedCost = parseFloat(estimatedCost.toFixed(2));
        setEnergyConfirm({ isOpen: true, cost: estimatedCost });
    };

    const confirmRefillEnergy = async () => {
        try {
            // Optimistic Update: Set to 100% immediately
            setUser(prev => ({ ...prev, energy: 100.001 }));

            let cost;
            if (user.isDemo) {
                cost = MockDB.refillEnergy(user.id);
            } else {
                const res = await api.refillEnergy();
                cost = res.cost;
            }

            setIsCharging(true);
            setTimeout(() => setIsCharging(false), 2000);

            // Wait a tiny bit for the animation and server sync
            setTimeout(() => {
                refreshData();
            }, 500);
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ชำระค่าไฟเรียบร้อย -${cost.toLocaleString()} ${CURRENCY}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) {
            alert(e.response?.data?.message || e.message);
            refreshData(); // Revert on error
        } finally {
            setEnergyConfirm(null);
        }
    };

    const handlePurchase = async (preset: RigPreset) => {
        const maxRigs = user.unlockedSlots || 3;

        // Check Max Allowed for Special Rigs
        if (preset.specialProperties?.maxAllowed) {
            const existingCount = rigs.filter(r => r.name === preset.name).length;
            if (existingCount >= preset.specialProperties.maxAllowed) {
                alert(`จำกัดการครอบครองเพียง ${preset.specialProperties.maxAllowed} เครื่องต่อไอดี`);
                return;
            }
        }

        if (rigs.length >= maxRigs) { alert(`พื้นที่สัมปทานเต็มแล้ว (สูงสุด ${maxRigs} เครื่อง)`); return; }

        // Crafting Logic
        if (preset.craftingRecipe) {
            // Check Materials
            if (preset.craftingRecipe.materials) {
                for (const [tier, amount] of Object.entries(preset.craftingRecipe.materials)) {
                    if ((user.materials?.[parseInt(tier)] || 0) < amount) {
                        alert(`วัตถุดิบไม่พอ: ต้องการ ${MATERIAL_CONFIG.NAMES[parseInt(tier) as keyof typeof MATERIAL_CONFIG.NAMES]} x${amount}`);
                        return;
                    }
                }
            }
            // Check Items
            if (preset.craftingRecipe.items) {
                for (const [imgId, amount] of Object.entries(preset.craftingRecipe.items)) {
                    const count = activeInventory.filter(i => i.typeId === imgId).length; // Use activeInventory or detailed inventory logic? Inventory items are unique objects. 
                    // We need to count by typeId.
                    if (count < amount) {
                        const itemConfig = SHOP_ITEMS.find(i => i.id === imgId);
                        alert(`ไอเทมไม่พอ: ต้องการ ${itemConfig ? itemConfig.name : imgId} x${amount}`);
                        return;
                    }
                }
            }

            // Deduct Materials
            if (preset.craftingRecipe.materials) {
                for (const [tier, amount] of Object.entries(preset.craftingRecipe.materials)) {
                    if (user.materials) user.materials[parseInt(tier)] -= amount;
                }
            }

            // Deduct Items
            if (preset.craftingRecipe.items) {
                for (const [imgId, amount] of Object.entries(preset.craftingRecipe.items)) {
                    // Remove N items of typeId
                    for (let k = 0; k < amount; k++) {
                        MockDB.consumeItem(user.id, imgId);
                    }
                }
            }

            // Log Transaction (Crafting doesn't cost money directly usually, but maybe fee? Assuming 0 fee for now based on requirement)
            MockDB.logTransaction({ userId: user.id, type: 'ASSET_PURCHASE', amount: 0, status: 'COMPLETED', description: `สร้าง: ${preset.name}` });

        } else {
            // Normal Purchase via API
            if (user.balance < preset.price) { alert('เงินไม่พอ'); return; }

            setIsCharging(true);
            try {
                // Call API or MockDB if Demo
                const durationDays = preset.durationDays || (preset.durationMonths || 1) * 30;
                let result;

                if (user.isDemo) {
                    // Demo Mode: Buy locally
                    result = MockDB.buyRig(user.id, preset.name, preset.price, preset.dailyProfit, durationDays, preset.repairCost, preset.energyCostPerDay, preset.bonusProfit || 0);
                    // Simulate delay
                    await new Promise(r => setTimeout(r, 800));
                } else {
                    // Real Mode: Call API
                    result = await api.buyRig(preset.name, preset.price, preset.dailyProfit, durationDays, preset.repairCost, preset.energyCostPerDay, preset.bonusProfit);
                }

                // Show Gold Rain Animation
                triggerGoldRain();

                // Show Glove Reveal Animation if glove was received
                if (result.glove) {
                    setGloveReveal({
                        name: result.glove.name,
                        rarity: result.glove.rarity,
                        bonus: result.glove.dailyBonus || 0
                    });
                }

                refreshData();
                addNotification({ id: Date.now().toString(), userId: user.id, message: `ซื้อเครื่องขุดสำเร็จ: ${preset.name}`, type: 'SUCCESS', read: false, timestamp: Date.now() });

            } catch (err: any) {
                alert("การซื้อล้มเหลว: " + (err.response?.data?.message || err.message));
            } finally {
                setIsCharging(false);
            }
            return; // Exit normal purchase flow
        }

        // Create the Rig (Crafting Success)
        setIsCharging(true);
        try {
            const durationDays = preset.durationDays || (preset.durationMonths || 1) * 30;
            let result;

            if (user.isDemo) {
                // Demo Mode
                result = MockDB.buyRig(user.id, preset.name, preset.price, preset.dailyProfit, durationDays, preset.repairCost, preset.energyCostPerDay, preset.bonusProfit || 0);
                // Simulate delay
                await new Promise(r => setTimeout(r, 800));
            } else {
                // Real Mode: Call API (Price should be 0 for crafted items usually)
                result = await api.buyRig(preset.name, preset.price, preset.dailyProfit, durationDays, preset.repairCost, preset.energyCostPerDay, preset.bonusProfit);
            }

            // Show Gold Rain Animation (Special for Crafting?)
            triggerGoldRain();

            refreshData();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `คราฟต์สำเร็จ: ${preset.name}`, type: 'SUCCESS', read: false, timestamp: Date.now() });

        } catch (err: any) {
            console.error("Crafting Failed", err);
            alert("การคราฟต์ล้มเหลว: " + (err.response?.data?.message || err.message));
        } finally {
            setIsCharging(false);
        }
    };

    const handleClaim = async (rigId: string, claimedAmount: number) => {
        try {
            const rig = rigs.find(r => r.id === rigId);
            if (!rig) return;

            if (user.isDemo) {
                // Demo / Local Mode
                MockDB.claimRigReward(user.id, rigId, claimedAmount);
                // Artificial delay for feel
                await new Promise(r => setTimeout(r, 500));
            } else {
                // Real / Online Mode
                await api.claimReward(rigId, claimedAmount); // Backend handles balance update and logging
            }

            // Optimistic UI Update (or rely on refreshData)
            refreshData();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `เก็บเกี่ยวสำเร็จ: ${claimedAmount.toFixed(4)} ${CURRENCY}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) {
            console.error("Claim failed", e);
            alert("เคลมเหรียญไม่สำเร็จ: " + (e.response?.data?.message || e.message));
        }
    };

    const handleGiftClaim = (rigId: string) => {
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) return;
        const preset = RIG_PRESETS.find(p => p.name === rig.name);
        if (!preset) return;

        try {
            let matTier = -1;
            let minAmount = 0;
            let maxAmount = 0;

            // Mapping based on User Request
            if (preset.id === 3) { matTier = 1; minAmount = 5; maxAmount = 10; } // Coal Rig -> Coal
            else if (preset.id === 4) { matTier = 2; minAmount = 5; maxAmount = 10; } // Copper Rig -> Copper
            else if (preset.id === 5) { matTier = 3; minAmount = 3; maxAmount = 6; } // Iron Rig -> Iron
            else if (preset.id === 6) { matTier = 4; minAmount = 3; maxAmount = 6; } // Gold Rig -> Gold
            else if (preset.id === 7) { matTier = 5; minAmount = 1; maxAmount = 3; } // Diamond Rig -> Diamond
            else if (preset.id === 8) { matTier = 6; minAmount = 3; maxAmount = 5; } // Vibranium Reactor -> Vibranium

            if (matTier === -1) {
                // FALLBACK: Non-mining rigs or special rigs drop random equipment
                const potentialRewards = ['hat', 'uniform', 'bag', 'boots'];
                const rewardId = potentialRewards[Math.floor(Math.random() * potentialRewards.length)];
                const newItem = MockDB.grantItem(user.id, rewardId);

                const updatedRig = { ...rig, lastGiftAt: Date.now() };
                MockDB.updateRig(updatedRig);

                refreshData();
                setLootResult({ rarity: newItem.rarity, bonus: newItem.dailyBonus, itemTypeId: newItem.typeId, itemName: newItem.name });
                addNotification({ id: Date.now().toString(), userId: user.id, message: `ได้รับของขวัญ: ${newItem.name}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
                return;
            }

            // MATERIAL DROP
            const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
            const res = MockDB.grantMaterials(user.id, matTier, amount);

            const updatedRig = { ...rig, lastGiftAt: Date.now() };
            MockDB.updateRig(updatedRig);

            refreshData();
            setLootResult({ rarity: 'SUPER_RARE', bonus: 0, itemName: `${res.name} x${amount}`, materialId: matTier });
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ได้รับของขวัญ: ${res.name} x${amount}`, type: 'SUCCESS', read: false, timestamp: Date.now() });

        } catch (e: any) { alert(e.message); }
    };


    const handleRenew = (rigId: string) => { try { const cost = MockDB.renewRig(user.id, rigId, 0); refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ต่ออายุเครื่องจักรสำเร็จ (-${cost.toLocaleString()} ${CURRENCY})`, type: 'SUCCESS', read: false, timestamp: Date.now() }); } catch (e: any) { alert(e.message); } };
    const handleRepair = (rigId: string) => { try { const cost = MockDB.repairRig(user.id, rigId); refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ซ่อมแซมเครื่องจักรสำเร็จ (-${cost.toLocaleString()} ${CURRENCY})`, type: 'SUCCESS', read: false, timestamp: Date.now() }); } catch (e: any) { alert(e.message); } };
    const handleCollectMaterials = (rigId: string) => { try { const result = MockDB.collectRigMaterials(user.id, rigId); refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `เก็บ ${result.name} x${result.count} เข้าคลังแล้ว`, type: 'SUCCESS', read: false, timestamp: Date.now() }); } catch (e: any) { alert(e.message); } };
    const handleUpdateMaterials = (rigId: string, count: number) => { MockDB.updateRigMaterials(rigId, count); };

    const handleChargeRigEnergy = async (rigId: string) => {
        try {
            // Optimistic Update: Calculate cost and update local state immediately
            const targetRig = rigs.find(r => r.id === rigId);
            if (!targetRig) return;

            const preset = RIG_PRESETS.find(p => p.name === targetRig.name);
            const energyCostPerDay = targetRig.energyCostPerDay || (preset ? preset.energyCostPerDay : 0);

            // Calculate current energy like RigCard does
            const lastUpdate = targetRig.lastEnergyUpdate || targetRig.purchasedAt || Date.now();
            const elapsedMs = Date.now() - lastUpdate;
            const elapsedHours = (elapsedMs * (user.isDemo ? DEMO_SPEED_MULTIPLIER : 1)) / (1000 * 60 * 60);
            const drain = elapsedHours * 4.166666666666667;
            const currentEnergy = Math.max(0, Math.min(100, (targetRig.energy ?? 100) - drain));

            const needed = 100 - currentEnergy;
            const cost = Math.max(0.1, (needed / 100) * energyCostPerDay);

            // 1. Update Balance and Rig optimistically
            skipRefreshRef.current = true; // Block background refresh
            setUser(prev => ({ ...prev, balance: prev.balance - cost }));
            setRigs(prev => prev.map(r => r.id === rigId ? { ...r, energy: 100, lastEnergyUpdate: Date.now() } : r));

            if (user.isDemo) {
                MockDB.refillRigEnergy(user.id, rigId);

                // Wait sufficiently for MockDB to sync if needed, then unblock
                setTimeout(() => {
                    skipRefreshRef.current = false;
                    refreshData();
                }, 1000);

                addNotification({
                    id: Date.now().toString(),
                    userId: user.id,
                    message: `ชาร์จไฟสำเร็จ (-${cost.toFixed(2)} ${CURRENCY})`,
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
            } else {
                const res = await api.refillRigEnergy(rigId);
                skipRefreshRef.current = false; // Unblock
                refreshData();
                addNotification({
                    id: Date.now().toString(),
                    userId: user.id,
                    message: `ชาร์จไฟสำเร็จ (-${res.cost.toFixed(2)} ${CURRENCY})`,
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
            }
        } catch (e: any) {
            skipRefreshRef.current = false; // Unblock on error
            refreshData(); // Revert on error
            alert(e.message || 'เกิดข้อผิดพลาดในการชาร์จไฟ');
        }
    };

    const handleBuyAccessory = (itemId: string) => {
        try {
            const newItem = MockDB.buyAccessory(user.id, itemId);
            refreshData();

            // Items that skip the Loot Box animation
            const directAddItems = ['chest_key', 'mixer', 'magnifying_glass', 'robot', 'upgrade_chip', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'insurance_card'];

            if (directAddItems.includes(itemId)) {
                addNotification({ id: Date.now().toString(), userId: user.id, message: `ได้รับ ${newItem.name} เรียบร้อย!`, type: 'SUCCESS', read: false, timestamp: Date.now() });
            } else {
                setLootResult({ rarity: newItem.rarity, bonus: newItem.dailyBonus, itemTypeId: newItem.typeId, itemName: newItem.name });
            }
        } catch (e: any) {
            alert(e.message);
        }
    };

    // ... rest of the component ...
    const handleWithdraw = async (amount: number, pin: string) => {
        try {
            await api.createWithdrawalRequest(amount, pin);
            refreshData();
            triggerGoldRain();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ส่งคำร้องขอถอนเงินจำนวน ${amount.toLocaleString()} ${CURRENCY} แล้ว`, type: 'INFO', read: false, timestamp: Date.now() });
        } catch (e: any) {
            alert(e.response?.data?.message || e.message);
        }
    };
    const handleSaveQr = (base64: string) => { MockDB.updateUserQr(user.id, base64); refreshData(); };
    const handleDepositSuccess = () => { refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ส่งคำร้องฝากเงินแล้ว กรุณารออนุมัติ`, type: 'INFO', read: false, timestamp: Date.now() }); };

    // Glove Management Handlers
    const handleManageAccessoryOpen = (rigId: string, slotIndex: number) => {
        setManagingAccessory({ rigId, slotIndex });
    };

    const handleAccessoryEquip = (itemId: string) => {
        if (!managingAccessory) return;
        try {
            MockDB.equipAccessory(user.id, managingAccessory.rigId, itemId, managingAccessory.slotIndex);
            refreshData();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `สวมใส่อุปกรณ์สำเร็จ`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) { alert(e.message); }
    };

    const handleAccessoryUnequip = () => {
        if (!managingAccessory) return;
        try {
            MockDB.unequipAccessory(user.id, managingAccessory.rigId, managingAccessory.slotIndex);
            refreshData();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ถอดอุปกรณ์สำเร็จ`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) { alert(e.message); }
    };

    const rigDaily = rigs.reduce((acc, rig) => {
        // Exclude rigs currently in an expedition
        if (user.activeExpedition && user.activeExpedition.rigId === rig.id && !user.activeExpedition.isCompleted) {
            return acc;
        }

        const equippedBonus = (rig.slots || []).reduce((sum, itemId) => {
            if (!itemId) return sum;
            const item = inventory.find(i => i.id === itemId);
            return sum + (item ? item.dailyBonus : 0);
        }, 0);
        return acc + rig.dailyProfit + (rig.bonusProfit || 0) + equippedBonus;
    }, 0) * globalMultiplier;



    return (
        <div className="min-h-screen font-sans pb-24 landscape:pb-16 lg:pb-20 bg-stone-950 text-stone-200">
            {user.isDemo && (
                <div className="fixed top-0 left-0 w-full z-[200] bg-red-600 text-white text-center py-1 text-xs font-bold uppercase tracking-widest animate-pulse shadow-lg">
                    DEMO MODE: SPEED x{DEMO_SPEED_MULTIPLIER} (Time Limit: 10 Mins)
                </div>
            )}
            {showGoldRain && <GoldRain />}

            {/* ... Navbar (omitted for brevity, assume same structure) ... */}
            <nav className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-yellow-900/30 shadow-2xl">
                <div className="w-full px-4 sm:px-6 py-3 landscape:py-2 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 sm:p-2 rounded-sm shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                            <Hammer size={20} className="text-stone-900 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 tracking-tight">GOLD RUSH</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setIsGameGuideOpen(true)}
                            className="bg-stone-800 p-2 sm:p-3 rounded-full border border-stone-700 hover:border-yellow-500 hover:text-yellow-500 transition-all text-stone-400 shadow-lg relative group"
                        >
                            <BookOpen size={20} className="sm:w-6 sm:h-6" />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">คู่มือเกม</span>
                        </button>
                        <div className="hidden lg:flex items-center gap-2">
                            <button onClick={() => setIsWarehouseOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-800/50 bg-blue-900/20 text-blue-500 hover:bg-blue-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Package size={14} /> คลังวัตถุดิบ
                            </button>
                            <button onClick={() => setIsMarketOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-900/20 text-emerald-500 hover:bg-emerald-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <BarChart2 size={14} /> ตลาดกลาง
                            </button>
                            <button onClick={() => setIsDailyBonusOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-900/20 text-emerald-500 hover:bg-emerald-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <CalendarCheck size={14} /> เช็คชื่อ
                            </button>
                            <button onClick={() => setIsMissionOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-800/50 bg-blue-900/20 text-blue-500 hover:bg-blue-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Target size={14} /> ภารกิจ
                            </button>
                            <button onClick={() => setIsDungeonOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-900/50 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Skull size={14} /> เหมืองลับ
                            </button>
                            <button onClick={() => setIsVIPOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-800/50 bg-yellow-900/20 text-yellow-500 hover:bg-yellow-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Crown size={14} /> VIP
                            </button>
                            <button onClick={() => setIsLeaderboardOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-800/50 bg-orange-900/20 text-orange-500 hover:bg-orange-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Trophy size={14} /> อันดับ
                            </button>
                        </div>

                        <button
                            onClick={() => setIsShopOpen(true)}
                            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-600/50 bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/30 transition-colors text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        >
                            <ShoppingBag size={14} /> ร้านค้าอุปกรณ์
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3 bg-stone-900/50 p-1.5 rounded-lg border border-stone-800">
                            <div className="flex flex-col items-end px-2 mr-1 sm:mr-2 border-r border-stone-800">
                                <span className="text-[8px] sm:text-[10px] text-stone-500 uppercase tracking-widest leading-none mb-1">ยอดเงินคงเหลือ</span>
                                <span className="text-base sm:text-lg font-mono font-bold text-white tabular-nums leading-none">
                                    {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] sm:text-xs text-stone-500">{CURRENCY}</span>
                                </span>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                                <button onClick={() => setIsDepositModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 sm:px-3 sm:py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1 transition-colors shadow-lg shadow-emerald-900/20">
                                    <PlusCircle size={14} /> <span className="hidden sm:inline">ฝากเงิน</span>
                                </button>
                                <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 p-1.5 sm:px-3 sm:py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1 transition-colors hover:text-white hover:border-stone-500">
                                    <Wallet size={14} /> <span className="hidden sm:inline">ถอนเงิน</span>
                                </button>
                            </div>
                        </div>

                        <div className="hidden lg:flex gap-2">
                            <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-stone-500 hover:text-yellow-500 transition-colors bg-stone-900 border border-stone-800 rounded relative">
                                <History size={20} />
                                {hasPendingTx && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                            </button>
                            <button onClick={() => setIsSettingsOpen(true)} className="text-stone-500 hover:text-white transition-colors p-2"><Settings size={20} /></button>
                            <button onClick={onLogout} className="text-stone-500 hover:text-red-400 transition-colors p-2"><LogOut size={20} /></button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 bg-stone-800 rounded-lg border border-stone-700 text-stone-400 hover:text-yellow-500 hover:border-yellow-500 transition-all"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 py-6 landscape:py-4 sm:py-8 pb-24 landscape:pb-16 lg:pb-8">

                {/* Global Stats Ticker */}


                {/* Dashboard Headers & Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
                    {/* Active Rigs */}
                    <div
                        onClick={() => document.getElementById('rigs-list')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-stone-900 p-4 sm:p-6 border-l-4 border-yellow-600 shadow-xl relative overflow-hidden group rounded-r-lg cursor-pointer hover:bg-stone-800 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        <div className="absolute right-0 top-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Hammer size={40} className="sm:w-[60px] sm:h-[60px]" />
                        </div>
                        <div className="text-stone-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2">เหมืองที่ทำงานอยู่</div>
                        <div className="text-2xl sm:text-4xl font-display font-bold text-white group-hover:text-yellow-400">
                            {rigs.length} <span className="text-sm sm:text-lg text-stone-600 font-sans font-normal">/ {MAX_RIGS_PER_USER}</span>
                        </div>
                    </div>

                    {/* Income */}
                    <div
                        onClick={() => setIsMarketOpen(true)}
                        className="bg-stone-900 p-4 sm:p-6 border-l-4 border-green-600 shadow-xl relative overflow-hidden group rounded-r-lg cursor-pointer hover:bg-stone-800 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        <div className="absolute right-0 top-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={40} className="sm:w-[60px] sm:h-[60px]" />
                        </div>
                        <div className="text-stone-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2">ผลตอบแทนรวม/วัน</div>
                        <div className="flex flex-col">
                            <div className="text-2xl sm:text-4xl font-display font-bold text-green-400 flex items-center gap-2 group-hover:text-green-300">
                                {isPowered ? rigDaily.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0.0'} <span className="text-xs sm:text-sm text-stone-500">{CURRENCY}</span>
                                {hasVibranium && isPowered && <span className="text-[10px] sm:text-xs bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500 animate-pulse font-mono">x2 Boost</span>}
                                {!isPowered && <span className="text-[10px] sm:text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded border border-red-500 font-bold animate-pulse">หยุดทำงาน</span>}
                            </div>
                        </div>
                    </div>

                    {/* Energy - Electric Furnace Style */}
                    <div className={`col-span-2 md:col-span-1 relative group rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-stone-900 border-2 ${isCharging ? 'border-yellow-400' : 'border-stone-700'}`}>

                        {/* Furnace Background Detail */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950"></div>

                        {/* Vents / Grills */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#000_4px,#000_6px)] opacity-50"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#000_4px,#000_6px)] opacity-50"></div>

                        <div className="relative z-10 p-4 flex flex-col h-full items-center justify-between text-center">

                            {/* Header Text */}
                            <div className="w-full flex justify-between items-start">
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-stone-800">
                                    เตาปฏิกรณ์ (Reactor)
                                </span>
                                <div className={`w-2 h-2 rounded-full ${isCharging ? 'bg-yellow-400 animate-ping' : 'bg-red-900'}`}></div>
                            </div>

                            {/* THE CORE (Furnace Window) */}
                            <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                                {/* Outer Ring */}
                                <div className="absolute inset-0 rounded-full border-4 border-stone-600 bg-stone-950 shadow-[inset_0_0_15px_black]"></div>

                                {/* Glowing Core - Brightness controlled by energyLevel */}
                                <div
                                    className={`absolute inset-2 rounded-full transition-all duration-1000 ease-in-out flex items-center justify-center overflow-hidden animate-core-glow
                                        ${isCharging ? 'animate-pulse scale-110' : ''}
                                    `}
                                    style={{
                                        background: `radial-gradient(circle, #ff4d4d 0%, ${energyLevel > 20 ? '#fbbf24' : '#ef4444'} 40%, ${energyLevel > 20 ? '#d97706' : '#991b1b'} 70%, #000 100%)`,
                                        opacity: Math.max(0.4, (energyLevel / 100) * 1.2),
                                        filter: `brightness(${Math.max(0.8, (energyLevel / 100) * 1.5)})`,
                                    }}
                                >
                                    {/* Core Detail - Rotating Background */}
                                    <div className="absolute inset-0 opacity-50 animate-[spin_10s_linear_infinite]" style={{ backgroundImage: 'repeating-conic-gradient(#000 0% 5%, transparent 5% 25%)' }}></div>

                                    {/* Zap Icon - Intense Breathing Animation */}
                                    <Zap
                                        size={32}
                                        className={`relative z-10 transition-all duration-300
                                            ${energyLevel > 20 ? 'text-white' : 'text-red-900'} 
                                            ${isCharging ? 'scale-150 animate-bounce' : 'animate-breathing'}
                                        `}
                                    />
                                </div>

                                {/* Success Flash Effect */}
                                {isCharging && <div className="absolute inset-2 rounded-full bg-white/40 animate-ping pointer-events-none"></div>}

                                {/* Glass Reflection & Inner Shadow */}
                                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>
                            </div>

                            {/* Status Text & Timer */}
                            <div className="w-full mb-2">
                                <div className={`text-2xl font-black font-mono tracking-tighter tabular-nums transition-colors duration-500 ${energyLevel > 20 ? 'text-yellow-500' : 'text-red-500'} drop-shadow-sm`}>
                                    {energyLevel > 0 ? <EnergyTimer percent={energyLevel} mode="percent" /> : 'OFFLINE'}
                                </div>

                                {/* 24H Countdown Info */}
                                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-mono mb-1 bg-black/20 rounded py-0.5">
                                    <Timer size={10} />
                                    <span>เวลาที่เหลือ (24h):</span>
                                    {energyLevel > 0 ? <EnergyTimer percent={energyLevel} /> : '--:--:--'}
                                </div>

                                <div className="h-1.5 w-full bg-black rounded-full mt-1 overflow-hidden border border-stone-800">
                                    <div
                                        className={`h-full transition-all duration-500 ${energyLevel > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                        style={{ width: `${energyLevel}%`, boxShadow: `0 0 10px ${energyLevel > 20 ? '#fbbf24' : '#ef4444'}` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Prominent Refill Button */}
                            <button
                                onClick={handleRefillEnergyClick}
                                className={`w-full py-2 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg text-xs 
                                    bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border border-orange-500 shadow-orange-900/50 hover:shadow-orange-700/50 active:scale-95 cursor-pointer
                                `}
                            >
                                <Zap size={14} className="fill-white animate-pulse" />
                                เติมพลังงาน (REFILL)
                            </button>

                        </div>
                    </div>

                    {/* Global Network Stats */}
                    <div className="bg-stone-900 p-4 sm:p-5 border-l-4 border-blue-500 shadow-xl relative overflow-hidden group rounded-r-lg flex flex-col justify-center gap-6">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart2 size={40} className="sm:w-[60px] sm:h-[60px]" />
                        </div>

                        {/* Miners */}
                        {/* Community Stats as Buttons */}
                        <div
                            onClick={() => addNotification({ id: 'community', userId: user.id, title: 'นักขุดออนไลน์', message: `มีผู้เล่นที่กำลังขุดทองรุ่งเรืองอยู่ในขณะนี้ ${globalStats.onlineMiners.toLocaleString()} ท่าน!`, type: 'INFO', timestamp: Date.now(), read: false })}
                            className="cursor-pointer hover:bg-stone-900/50 p-2 rounded-lg transition-all active:scale-95 group"
                        >
                            <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 mb-1 group-hover:text-blue-400">
                                <Users size={12} /> นักขุดออนไลน์
                            </div>
                            <div className="text-xl sm:text-2xl font-display font-bold text-blue-400 font-mono animate-pulse group-hover:text-blue-300">
                                {globalStats.onlineMiners.toLocaleString()}
                            </div>
                        </div>

                        {/* Market Stat as Button */}
                        <div
                            onClick={() => setIsMarketOpen(true)}
                            className="cursor-pointer hover:bg-stone-900/50 p-2 rounded-lg transition-all active:scale-95 group"
                        >
                            <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 mb-1 group-hover:text-emerald-400">
                                <BarChart2 size={12} /> มูลค่าตลาด
                            </div>
                            <div className="text-xl sm:text-2xl font-display font-bold text-emerald-400 font-mono group-hover:text-emerald-300">
                                {globalStats.marketVolume.toLocaleString()} ฿
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SLOT SYSTEM GRID --- */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Grid size={24} className="text-yellow-500" /> พื้นที่สัมปทาน (Mining Slots)
                    </h3>
                    <div id="rigs-list" className="grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-8">
                        {Array.from({ length: MAX_RIGS_PER_USER }).map((_, index) => {
                            const slotNumber = index + 1;
                            const rig = rigs[index];
                            const isUnlocked = slotNumber <= (user.unlockedSlots || 3);
                            const isExploring = !!(user.activeExpedition && rig && user.activeExpedition.rigId === rig.id && !user.activeExpedition.isCompleted);

                            if (rig) {
                                return (
                                    <RigCard
                                        key={rig.id}
                                        rig={rig}
                                        durationBonusDays={0}
                                        inventory={inventory}
                                        onClaim={handleClaim}
                                        onClaimGift={handleGiftClaim}
                                        onRenew={handleRenew}
                                        onRepair={handleRepair}
                                        onSellMaterials={handleCollectMaterials}
                                        onMaterialUpdate={handleUpdateMaterials}
                                        onManageAccessory={handleManageAccessoryOpen}
                                        onCharge={handleChargeRigEnergy}
                                        globalMultiplier={globalMultiplier}
                                        isPowered={isPowered}
                                        isExploring={isExploring}
                                        isDemo={user.isDemo}
                                    />
                                );
                            } else if (isUnlocked) {
                                return (
                                    <div
                                        key={`empty-${slotNumber}`}
                                        onClick={() => setIsBuyModalOpen(true)}
                                        className="border-2 border-dashed border-stone-800 bg-stone-900/30 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-stone-900/60 hover:border-yellow-600/50 transition-all group min-h-[400px]"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform">
                                            <Plus size={40} className="text-stone-600 group-hover:text-yellow-500" />
                                        </div>
                                        <h4 className="text-lg font-bold text-stone-500 group-hover:text-yellow-500 uppercase tracking-widest">ว่าง (Empty Slot)</h4>
                                        <p className="text-xs text-stone-600 mt-2">คลิกเพื่อซื้อเครื่องจักร</p>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={`locked-${slotNumber}`}
                                        onClick={() => setUnlockTargetSlot(slotNumber)}
                                        className="border-2 border-stone-800 bg-black/40 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-hidden group min-h-[400px]"
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                                        <div className="w-20 h-20 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center mb-4 z-10 group-hover:border-red-500/50 transition-colors">
                                            <Lock size={32} className="text-stone-600 group-hover:text-red-500" />
                                        </div>
                                        <h4 className="text-lg font-bold text-stone-500 uppercase tracking-widest z-10 group-hover:text-stone-300">พื้นที่ถูกล็อค</h4>
                                        <p className="text-xs text-stone-600 mt-2 z-10 bg-stone-950 px-3 py-1 rounded-full border border-stone-800">Slot #{slotNumber}</p>
                                        <div className="mt-6 px-6 py-2 bg-stone-900/80 rounded border border-stone-700 text-xs font-bold text-stone-400 uppercase tracking-wide group-hover:bg-red-900/20 group-hover:text-red-400 group-hover:border-red-900/50 transition-all z-10">
                                            ปลดล็อกพื้นที่
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </main >

            {/* ... Other Modals ... */}
            {
                energyConfirm && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-stone-900 border border-orange-500/50 w-full max-w-sm rounded-xl p-6 shadow-2xl relative">
                            {/* ... Energy Modal Content ... */}
                            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 border border-orange-500">
                                <Zap size={32} className="text-orange-500 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white text-center mb-2">ยืนยันการจ่ายค่าไฟ?</h3>
                            <div className="text-stone-400 text-sm text-center mb-6 space-y-1">
                                <p>เติมพลังงานให้เต็ม 100%</p>
                                <p className="text-xs text-stone-500">อัตราค่าบริการ: 0.02 บาท ต่อ 1%</p>
                            </div>
                            <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 mb-6 flex justify-between items-center">
                                <span className="text-xs font-bold text-stone-500 uppercase">ค่าบริการรวม</span>
                                <span className="text-2xl font-mono font-bold text-white">{energyConfirm.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setEnergyConfirm(null)} className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors text-sm">ยกเลิก</button>
                                <button onClick={confirmRefillEnergy} className="py-3 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors shadow-lg shadow-orange-900/20 text-sm flex items-center justify-center gap-2"><CheckCircle2 size={16} /> ยืนยันจ่าย</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notifications and Modals... */}
            <div className="fixed bottom-24 lg:bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-500 fade-in w-80 ${n.type === 'SUCCESS' ? 'bg-emerald-950/80 border-emerald-500/50' : n.type === 'ERROR' ? 'bg-red-950/80 border-red-500/50' : 'bg-blue-950/80 border-blue-500/50'}`}>
                        <div className={`p-1 rounded-full ${n.type === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : n.type === 'INFO' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                            {n.type === 'SUCCESS' ? <CheckCircle2 size={18} /> : n.type === 'INFO' ? <Bell size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div><h4 className={`text-sm font-bold ${n.type === 'SUCCESS' ? 'text-emerald-400' : n.type === 'INFO' ? 'text-blue-400' : 'text-red-400'}`}>{n.type === 'SUCCESS' ? 'ทำรายการสำเร็จ' : n.type === 'INFO' ? 'ส่งคำร้องแล้ว' : 'แจ้งเตือน'}</h4><p className="text-xs text-stone-300 mt-1">{n.message}</p></div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <InvestmentModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} onConfirm={handlePurchase} onOpenRates={() => setIsRatesModalOpen(true)} walletBalance={user.balance} currentRigCount={rigs.length} maxRigs={user.unlockedSlots || 3} materials={user.materials || {}} inventory={inventory} rigs={rigs} />
            <AccessoryShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} walletBalance={user.balance} onBuy={handleBuyAccessory} />
            <WarehouseModal isOpen={isWarehouseOpen} onClose={() => setIsWarehouseOpen(false)} userId={user.id} materials={user.materials || {}} onSell={(tier, amount) => { try { const earned = MockDB.sellUserMaterial(user.id, tier, amount); refreshData(); triggerGoldRain(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ขายสำเร็จ! ได้รับ +${earned.toLocaleString()} ${CURRENCY}`, type: 'SUCCESS', read: false, timestamp: Date.now() }); } catch (e: any) { alert(e.message); } }} onCraft={(sourceTier) => { try { const res = MockDB.craftMaterial(user.id, sourceTier); refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ผสมสำเร็จ! ${res.sourceName} -> ${res.targetName}`, type: 'SUCCESS', read: false, timestamp: Date.now() }); return res; } catch (e: any) { alert(e.message); throw e; } }} onPlayGoldRain={triggerGoldRain} onOpenMarket={(tier) => { setMarketTier(tier); setIsMarketOpen(true); }} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} walletBalance={user.balance} onWithdraw={handleWithdraw} savedQrCode={user.bankQrCode} onSaveQr={handleSaveQr} />
            <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} onDepositSuccess={handleDepositSuccess} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} />
            <GiftSystemModal isOpen={isGiftSystemOpen} onClose={() => setIsGiftSystemOpen(false)} />
            <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
            <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} user={user} />
            <DevToolsModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} user={user} onRefresh={refreshData} />
            <MarketModal isOpen={isMarketOpen} onClose={() => { setIsMarketOpen(false); setMarketTier(undefined); }} userId={user.id} onSuccess={refreshData} initialTier={marketTier} />
            <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} inventory={inventory} userId={user.id} onRefresh={refreshData} />

            {/* New Modals */}
            <DailyBonusModal isOpen={isDailyBonusOpen} onClose={() => setIsDailyBonusOpen(false)} user={user} onRefresh={refreshData} />
            <MissionModal isOpen={isMissionOpen} onClose={() => setIsMissionOpen(false)} user={user} onRefresh={refreshData} />
            <VIPModal isOpen={isVIPOpen} onClose={() => setIsVIPOpen(false)} user={user} />
            <DungeonModal isOpen={isDungeonOpen} onClose={() => setIsDungeonOpen(false)} user={user} onRefresh={refreshData} />
            <GameGuideModal isOpen={isGameGuideOpen} onClose={() => setIsGameGuideOpen(false)} />

            {/* Equip Selection */}


            {/* Glove Management */}
            {
                managingAccessory && (() => {
                    const rig = rigs.find(r => r.id === managingAccessory.rigId);
                    if (!rig) return null;
                    const slotIndex = managingAccessory.slotIndex;
                    const itemId = rig.slots?.[slotIndex];
                    const equippedItem = itemId ? inventory.find(i => i.id === itemId) || null : null;

                    // Filter out items already equipped on ANY rig
                    const allEquippedIds = rigs.flatMap(r => r.slots || []).filter(id => id !== null && id !== itemId);
                    const filteredInventory = inventory.filter(item => !allEquippedIds.includes(item.id));

                    return (
                        <AccessoryManagementModal
                            isOpen={true}
                            onClose={() => setManagingAccessory(null)}
                            rig={rig}
                            slotIndex={slotIndex}
                            equippedItem={equippedItem}
                            inventory={filteredInventory}
                            userId={user.id}
                            onEquip={handleAccessoryEquip}
                            onUnequip={handleAccessoryUnequip}
                            onRefresh={refreshData}
                        />
                    );
                })()
            }

            {/* Slot Unlock */}
            {
                unlockTargetSlot && (
                    <SlotUnlockModal isOpen={!!unlockTargetSlot} onClose={() => setUnlockTargetSlot(null)} targetSlot={unlockTargetSlot} user={user} onSuccess={refreshData} />
                )
            }

            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10 duration-300 lg:hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div><h2 className="text-2xl font-bold text-white font-display">เมนูหลัก</h2><p className="text-stone-500 text-xs">จัดการบัญชีและระบบอื่นๆ</p></div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-stone-900 rounded-full text-stone-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => { setIsShopOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><ShoppingBag className="text-orange-500" size={32} /><span className="text-sm font-bold text-stone-300">ร้านค้า</span></button>
                            <button onClick={() => { setIsWarehouseOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Package className="text-blue-500" size={32} /><span className="text-sm font-bold text-stone-300">คลังวัตถุดิบ</span></button>
                            <button onClick={() => { setIsLeaderboardOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Trophy className="text-yellow-500" size={32} /><span className="text-sm font-bold text-stone-300">อันดับ</span></button>
                            <button onClick={() => { setIsDailyBonusOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><CalendarCheck className="text-emerald-500" size={32} /><span className="text-sm font-bold text-stone-300">เช็คชื่อ</span></button>
                            <button onClick={() => { setIsDungeonOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Skull className="text-purple-500" size={32} /><span className="text-sm font-bold text-stone-300">เหมืองลับ</span></button>
                            <button onClick={() => { setIsMissionOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Target className="text-blue-400" size={32} /><span className="text-sm font-bold text-stone-300">ภารกิจ</span></button>
                            <button onClick={() => { setIsVIPOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Crown className="text-yellow-400" size={32} /><span className="text-sm font-bold text-stone-300">VIP</span></button>
                            <button onClick={() => { setIsMarketOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><BarChart2 className="text-emerald-500" size={32} /><span className="text-sm font-bold text-stone-300">ตลาดกลาง</span></button>
                            <button onClick={() => { setIsInventoryOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Backpack className="text-orange-400" size={32} /><span className="text-sm font-bold text-stone-300">กระเป๋า</span></button>
                            <button onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><History className="text-stone-400" size={32} /><span className="text-sm font-bold text-stone-300">ประวัติ</span></button>
                            <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><Settings className="text-stone-400" size={32} /><span className="text-sm font-bold text-stone-300">ตั้งค่า</span></button>
                            <button onClick={() => { setIsGameGuideOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 hover:bg-stone-800 active:scale-95 transition-all"><BookOpen className="text-blue-400" size={32} /><span className="text-sm font-bold text-stone-300">คู่มือเกม</span></button>
                        </div>
                        <div className="mt-auto">
                            <button onClick={onLogout} className="w-full py-4 bg-red-900/20 text-red-400 border border-red-900/50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-900/30 transition-colors"><LogOut size={20} /> ออกจากระบบ</button>
                            <div className="text-center text-[10px] text-stone-600 mt-4">Ver 1.0.7 | ID: {user.username}</div>
                        </div>
                    </div>
                )
            }

            {
                lootResult && (
                    <LootBoxModal
                        isOpen={!!lootResult}
                        rarity={lootResult.rarity}
                        bonus={lootResult.bonus}
                        itemTypeId={lootResult.itemTypeId}
                        itemName={lootResult.itemName}
                        materialId={lootResult.materialId}
                        onClose={() => setLootResult(null)}
                    />
                )
            }
            <LootRatesModal isOpen={isRatesModalOpen} onClose={() => setIsRatesModalOpen(false)} />

            <style>{`
        .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-lg border-t border-stone-800 lg:hidden safe-area-pb">
                <div className="grid grid-cols-5 gap-1 px-2 py-2 landscape:py-1">
                    <button
                        onClick={() => setIsBuyModalOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-yellow-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <Plus size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">ซื้อเหมือง</span>
                    </button>
                    <button
                        onClick={() => setIsWarehouseOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-blue-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <Package size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">คลัง</span>
                    </button>
                    <button
                        onClick={() => setIsMarketOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-emerald-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <BarChart2 size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">ตลาด</span>
                    </button>
                    <button
                        onClick={() => setIsInventoryOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-orange-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <Backpack size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">กระเป๋า</span>
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <Grid size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">เมนู</span>
                    </button>
                </div>
            </nav>

            {/* Chat System */}
            <ChatSystem currentUser={user} />

            {/* Global Modals */}
            <GameGuideModal isOpen={isGameGuideOpen} onClose={() => setIsGameGuideOpen(false)} />

            {/* Glove Reveal Modal */}
            <GloveRevealModal
                isOpen={gloveReveal !== null}
                onClose={() => setGloveReveal(null)}
                gloveName={gloveReveal?.name || ''}
                gloveRarity={gloveReveal?.rarity || 'COMMON'}
                gloveBonus={gloveReveal?.bonus || 0}
            />

        </div >
    );
};
