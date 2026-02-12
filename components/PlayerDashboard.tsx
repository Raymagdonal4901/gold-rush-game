
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Hammer, LogOut, User as UserIcon, Coins, TrendingUp, Bell, CheckCircle2, AlertCircle, History, PlusCircle, Wallet, ArrowUpRight, Gift, Clock, ShoppingBag, Briefcase, Zap, Settings, Timer, Bug, Key, Menu, X, Home, Package, FlaskConical, TestTube2, Gem, Trophy, Users, BookOpen, Grid, BarChart2, Backpack, CalendarCheck, Target, Crown, CreditCard, Lock, Skull, Languages, Mail } from 'lucide-react';
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
import { AIHelpBot } from './AIHelpBot';
import { GloveRevealModal } from './GloveRevealModal';
import { GoldRain } from './GoldRain';
import { ChatSystem } from './ChatSystem';
import { MailModal } from './MailModal';
import { ReferralAnnouncement } from './ReferralAnnouncement';
import { OilRig, User, Rarity, Notification, AccessoryItem, MarketState } from '../services/types';
import { CURRENCY, RigPreset, MAX_RIGS_PER_USER, RARITY_SETTINGS, SHOP_ITEMS, MAX_ACCESSORIES, RIG_PRESETS, ENERGY_CONFIG, REPAIR_CONFIG, GLOVE_DETAILS, MATERIAL_CONFIG, DEMO_SPEED_MULTIPLIER, ROBOT_CONFIG, GIFT_CYCLE_DAYS, EXCHANGE_RATE_USD_THB } from '../constants';
import { MockDB } from '../services/db';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

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
    const { t, language, setLanguage, getLocalized, formatCurrency } = useTranslation();
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
    const [marketState, setMarketState] = useState<MarketState | null>(null);
    const [gloveReveal, setGloveReveal] = useState<{ name: string, rarity: string, bonus: number } | null>(null);

    // TUTORIAL STATE
    const [tutorialStep, setTutorialStep] = useState<number>(0);

    // Mail System
    const [isMailOpen, setIsMailOpen] = useState(false);
    const [showReferralAnnouncement, setShowReferralAnnouncement] = useState(false);

    // --- TUTORIAL LOGIC ---
    useEffect(() => {
        // Only start tutorial if user has no rigs and haven't finished it
        const finished = localStorage.getItem(`tutorial_finished_${user.id}`);
        if (!finished && rigs.length === 0 && tutorialStep === 0) {
            setTutorialStep(1);
        }

        // Auto-advance to step 2 if shop is opened during step 1
        if (tutorialStep === 1 && isBuyModalOpen) {
            setTutorialStep(2);
        }

        // Auto-advance to step 3 if a rig (Rotten Glove) is purchased
        if (tutorialStep === 2 && rigs.length > 0) {
            setTutorialStep(3);
        }
    }, [rigs.length, isBuyModalOpen, user.id]);

    const handleTutorialNext = () => {
        if (tutorialStep === 1) {
            setIsBuyModalOpen(true);
        } else if (tutorialStep === 2) {
            // Just stay in modal, user needs to find the card
        } else if (tutorialStep === 3) {
            setTutorialStep(0);
            localStorage.setItem(`tutorial_finished_${user.id}`, 'true');
        }
    };

    // --- REFERRAL ANNOUNCEMENT LOGIC ---
    useEffect(() => {
        if (user && user.id) {
            const hasSeenAnnouncement = localStorage.getItem(`referral_announcement_v1_shown_${user.id}`);
            if (!hasSeenAnnouncement) {
                // Delay slightly for dramatic effect
                const timer = setTimeout(() => {
                    setShowReferralAnnouncement(true);
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user.id]);

    const handleCloseAnnouncement = () => {
        setShowReferralAnnouncement(false);
        localStorage.setItem(`referral_announcement_v1_shown_${user.id}`, 'true');
    };

    // ... useEffects and helper functions ...
    // Ref to block refresh during sensitive operations
    const skipRefreshRef = useRef(false);
    const lastMarketPrices = useRef<Record<number, number>>({});
    const lastMarketAlertAt = useRef<Record<number, number>>({}); // Throttling for market alerts
    const lastAutoRefillRef = useRef<Record<string, number>>({});  // Cooldown tracker for AI Robot refills
    const claimingRigsRef = useRef<Set<string>>(new Set()); // Lock to prevent simultaneous robot claims

    // --- AI ROBOT AUTOMATION LOOP ---
    useEffect(() => {
        // Only start if robot is present
        const hasRobot = inventory.some(i => i.typeId === 'robot' && (!i.expireAt || i.expireAt > Date.now()));
        if (!hasRobot) return;

        const runRobotAutomation = async () => {
            if (skipRefreshRef.current) return;

            // 1. Auto-collect Gifts & Materials
            for (const rig of rigs) {
                if (claimingRigsRef.current.has(rig.id)) continue;

                // Gift Availability Logic
                const giftIntervalMs = GIFT_CYCLE_DAYS * 24 * 60 * 60 * 1000;
                const lastGiftTime = rig.lastGiftAt || rig.purchasedAt;
                const nextGiftTime = lastGiftTime + giftIntervalMs;
                const isGiftAvailable = Date.now() >= nextGiftTime;

                if (isGiftAvailable) {
                    console.log(`[ROBOT] Auto-collecting gift for rig: ${getLocalized(rig.name)}`);
                    claimingRigsRef.current.add(rig.id);
                    try {
                        await api.claimRigGift(rig.id);
                        // Silent refresh or manual update
                        addNotification({
                            id: `robot-gift-${rig.id}-${Date.now()}`,
                            userId: user.id,
                            message: language === 'th' ? `หุ่นยนต์เก็บของขวัญจาก ${getLocalized(rig.name)}` : `Robot collected gift from ${getLocalized(rig.name)}`,
                            type: 'SUCCESS',
                            read: false,
                            timestamp: Date.now()
                        });
                    } catch (e) {
                        console.error(`[ROBOT] Gift claim failed for ${rig.name}:`, e);
                    } finally {
                        claimingRigsRef.current.delete(rig.id);
                    }
                }

                // Material Collection Logic
                if ((rig.currentMaterials || 0) > 0) {
                    console.log(`[ROBOT] Auto-collecting materials for rig: ${getLocalized(rig.name)}`);
                    claimingRigsRef.current.add(rig.id);
                    try {
                        const count = rig.currentMaterials || 0;
                        const tier = (() => {
                            const investment = rig.investment;
                            if (investment === 0) return 7;
                            if (investment >= 3000) return 5;
                            if (investment >= 2500) return 4;
                            if (investment >= 2000) return 3;
                            if (investment >= 1500) return 2;
                            return 1;
                        })();

                        await api.collectMaterials(rig.id, count, tier);
                    } catch (e) {
                        console.error(`[ROBOT] Material collection failed for ${rig.name}:`, e);
                    } finally {
                        claimingRigsRef.current.delete(rig.id);
                    }
                }
            }

            // 1.6 Auto-refill Global Energy (System Power)
            const currentGlobalEnergy = user.energy !== undefined ? user.energy : 100;
            const globalRefillCost = Math.max(2.0, (100 - currentGlobalEnergy) * 0.02);
            const lastGlobalRefill = lastAutoRefillRef.current['global'] || 0;
            if (currentGlobalEnergy <= 1 && (Date.now() - lastGlobalRefill > 60000) && user.balance >= globalRefillCost) {
                console.log(`[ROBOT] Auto-refilling GLOBAL energy (${currentGlobalEnergy.toFixed(1)}%)`);
                lastAutoRefillRef.current['global'] = Date.now();
                confirmRefillEnergy();
            }

            // 2. Auto-refill & Auto-repair
            for (const rig of rigs) {
                const preset = RIG_PRESETS.find(p => p.name === rig.name);

                // Energy Logic
                const lastUpdate = rig.lastEnergyUpdate || rig.purchasedAt || Date.now();
                const elapsedMs = Date.now() - lastUpdate;
                const elapsedHours = (elapsedMs * (user.isDemo ? DEMO_SPEED_MULTIPLIER : 1)) / (1000 * 60 * 60);
                const overclockActive = user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() > Date.now() : false;
                const drainRate = overclockActive ? 8.333333333333334 : 4.166666666666667;
                const drain = elapsedHours * drainRate;
                const energyPercent = Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));

                if (energyPercent <= 1 && (Date.now() - (lastAutoRefillRef.current[rig.id] || 0) > 60000)) {
                    const rigEnergyCostPerDay = rig.energyCostPerDay || (preset ? preset.energyCostPerDay : 0);
                    const rigRefillCost = Math.max(0.1, ((100 - energyPercent) / 100) * rigEnergyCostPerDay);
                    if (user.balance >= rigRefillCost) {
                        lastAutoRefillRef.current[rig.id] = Date.now();
                        handleChargeRigEnergy(rig.id);
                    }
                }

                // Repair Logic
                const durabilityMs = (REPAIR_CONFIG.DURABILITY_DAYS * 24 * 60 * 60 * 1000);
                const timeSinceRepair = Date.now() - (rig.lastRepairAt || rig.purchasedAt || Date.now());
                const isInfiniteDurability = preset?.specialProperties?.infiniteDurability;
                const isInfiniteContract = (rig.durationMonths >= 900) || (preset?.specialProperties?.infiniteDurability === true);
                const healthPercent = (isInfiniteContract || isInfiniteDurability) ? 100 : Math.max(0, 100 * (1 - timeSinceRepair / durabilityMs));

                if (healthPercent < 20) {
                    handleRepair(rig.id);
                }
            }

            // 3. Price Alerts
            if (marketState?.trends) {
                const trends = marketState.trends;
                for (const [tier, data] of Object.entries(trends)) {
                    const price = (data as any).currentPrice;
                    const prevPrice = lastMarketPrices.current[parseInt(tier)];
                    const lastAlert = lastMarketAlertAt.current[parseInt(tier)] || 0;

                    if (prevPrice && price > prevPrice && (Date.now() - lastAlert > 60000)) {
                        lastMarketAlertAt.current[parseInt(tier)] = Date.now();
                        addNotification({
                            id: `market-alert-${tier}-${Date.now()}`,
                            userId: user.id,
                            message: language === 'th' ? `ราคาวัตถุดิบ Tier ${tier} พุ่งสูงขึ้น! (${prevPrice} -> ${price})` : `Material Tier ${tier} price surged! (${prevPrice} -> ${price})`,
                            type: 'INFO',
                            read: false,
                            timestamp: Date.now()
                        });
                    }
                    lastMarketPrices.current[parseInt(tier)] = price;
                }
            }
        };

        const interval = setInterval(runRobotAutomation, 30000);
        return () => clearInterval(interval);
    }, [inventory.length, rigs.length, user.balance, user.energy, user.isDemo, user.overclockExpiresAt, marketState, language]); // Minimized dependencies

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
        // Initial Fetch: Fix 5s delay by loading data immediately on mount
        refreshData();

        const interval = setInterval(() => {
            refreshData();
        }, 20000); // Polling every 20s
        return () => clearInterval(interval);
    }, [user.id, user.materials, marketState, hasAIRobot]); // Dependencies ensure AI Robot logic uses latest data. Interval restarts on change, which throttles polling during active use.

    const isRefreshing = useRef(false);
    const refreshData = async () => {
        if (skipRefreshRef.current || isRefreshing.current) return;
        isRefreshing.current = true;
        try {
            // Parallel Fetch: Execute all requests at once to solve 5s delay
            const fetchPromises: Promise<any>[] = [
                user.isDemo ? Promise.resolve(MockDB.getSession()) : api.getMe(),
                user.isDemo ? Promise.resolve(MockDB.getMyRigs(user.id)) : api.getMyRigs(),
                user.isDemo ? Promise.resolve(MockDB.getMarketState()) : api.getMarketStatus(),
                user.isDemo ? Promise.resolve({ onlineMiners: 1337, totalOreMined: 9999, marketVolume: 50000 }) : api.getGlobalStats()
            ];

            const [remoteUser, remoteRigs, remoteMarket, remoteGlobal] = await Promise.all(fetchPromises);

            if (skipRefreshRef.current) {
                isRefreshing.current = false;
                return;
            }

            // Bridge logic for MockDB sessions (non-persisted fields)
            const mergedUser = {
                ...user, // Keep current session fields if not in backend
                ...(remoteUser as User),
                isDemo: user.isDemo // Preserve demo state
            };

            // PERF: Removed heavy LocalStorage sync loop. 
            // Only update the active session for MockDB compatibility.
            if (typeof window !== 'undefined') {
                localStorage.setItem('oil_baron_session', JSON.stringify(mergedUser));
            }

            // Batch State Updates
            setUser(mergedUser);
            setRigs(remoteRigs);
            setInventory(mergedUser.inventory || []);
            setMarketState(remoteMarket);
            setGlobalStats(remoteGlobal);
            setHasPendingTx(false);

        } catch (error) {
            console.error("Dashboard refresh failed:", error);
        } finally {
            isRefreshing.current = false;
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
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ชำระค่าไฟเรียบร้อย -${formatCurrency(cost)}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) {
            addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: `เกิดข้อผิดพลาด: ${e.response?.data?.message || e.message}`,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
            refreshData(); // Revert on error
        } finally {
            setEnergyConfirm(null);
        }
    };

    // Overclock handler
    const [overclockLoading, setOverclockLoading] = useState(false);
    const isOverclockActive = user.isOverclockActive;
    const hasRemainingOverclock = (user.overclockRemainingMs || 0) > 0 || (user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() > Date.now() : false);

    const getOverclockMultiplier = (count: number) => {
        if (count <= 2) return 1.1;
        if (count <= 4) return 1.25;
        return 1.4;
    };

    const currentOverclockMultiplier = isOverclockActive ? getOverclockMultiplier(rigs.length) : 1;

    const handleActivateOverclock = async () => {
        if (overclockLoading) return;
        setOverclockLoading(true);
        try {
            const result = await api.user.activateOverclock();
            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    balance: result.newBalance,
                    overclockExpiresAt: result.overclockExpiresAt,
                    isOverclockActive: true,
                    overclockRemainingMs: 0
                }));
                setIsCharging(true);
                setTimeout(() => setIsCharging(false), 3000);
                const msg = result.isResume
                    ? (language === 'th' ? 'เริ่มใช้งาน Overclock ต่อจากเดิมเรียบร้อย' : 'Overclock resumed')
                    : (language === 'th' ? `เปิดใช้งาน Overclock เรียบร้อย (โบนัสตามจำนวนเครื่อง)` : `Overclock activated (Bonus based on rig count)`);
                addNotification({ id: Date.now().toString(), userId: user.id, message: msg, type: 'SUCCESS', read: false, timestamp: Date.now() });
                refreshData();
            }
        } catch (e: any) {
            addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        } finally {
            setOverclockLoading(false);
        }
    };

    const handleDeactivateOverclock = async () => {
        if (overclockLoading) return;
        setOverclockLoading(true);

        // Optimistic update: immediately update UI
        const prevExpiry = user.overclockExpiresAt;
        setUser(prev => ({ ...prev, overclockExpiresAt: undefined }));

        try {
            const result = await api.user.deactivateOverclock();
            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    isOverclockActive: false,
                    overclockExpiresAt: undefined,
                    overclockRemainingMs: result.overclockRemainingMs
                }));
                addNotification({ id: Date.now().toString(), userId: user.id, message: language === 'th' ? 'หยุดใช้งาน Overclock ชั่วคราวเรียบร้อย' : 'Overclock paused', type: 'INFO', read: false, timestamp: Date.now() });
                // Don't call refreshData() here - optimistic update is already done
            } else {
                // Revert if API returned success: false
                setUser(prev => ({ ...prev, overclockExpiresAt: prevExpiry }));
            }
        } catch (e: any) {
            // Revert on error
            setUser(prev => ({ ...prev, overclockExpiresAt: prevExpiry }));
            addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        } finally {
            setOverclockLoading(false);
        }
    };

    const handlePurchase = async (preset: RigPreset) => {
        const maxRigs = user.unlockedSlots || 3;

        // Check Max Allowed for Special Rigs
        if (preset.specialProperties?.maxAllowed) {
            const existingCount = rigs.filter(r => r.name === preset.name).length;
            if (existingCount >= preset.specialProperties.maxAllowed) {
                alert(language === 'th' ? `จำกัดการครอบครองเพียง ${preset.specialProperties.maxAllowed} เครื่องต่อไอดี` : `Limited to ${preset.specialProperties.maxAllowed} units per account`);
                return;
            }
        }

        if (rigs.length >= maxRigs) { alert(language === 'th' ? `พื้นที่ขุดเหมืองเต็มแล้ว (สูงสุด ${maxRigs} เครื่อง)` : `Mining slots are full (Max ${maxRigs} units)`); return; }

        // Crafting Logic
        if (preset.craftingRecipe) {
            // Check Materials
            if (preset.craftingRecipe.materials) {
                for (const [tier, amount] of Object.entries(preset.craftingRecipe.materials)) {
                    if ((user.materials?.[parseInt(tier)] || 0) < amount) {
                        alert(language === 'th' ? `วัตถุดิบไม่พอ: ต้องการ ${getLocalized(MATERIAL_CONFIG.NAMES[parseInt(tier) as keyof typeof MATERIAL_CONFIG.NAMES])} x${amount}` : `Insufficient Materials: Need ${getLocalized(MATERIAL_CONFIG.NAMES[parseInt(tier) as keyof typeof MATERIAL_CONFIG.NAMES])} x${amount}`);
                        return;
                    }
                }
            }
            // Check Items
            if (preset.craftingRecipe.items) {
                for (const [imgId, amount] of Object.entries(preset.craftingRecipe.items)) {
                    const count = inventory.filter(i => i.typeId === imgId).length;
                    if (count < amount) {
                        const itemConfig = SHOP_ITEMS.find(i => i.id === imgId);
                        alert(language === 'th' ? `ไอเทมไม่พอ: ต้องการ ${itemConfig ? getLocalized(itemConfig.name) : imgId} x${amount}` : `Insufficient Items: Need ${itemConfig ? getLocalized(itemConfig.name) : imgId} x${amount}`);
                        return;
                    }
                }
            }

            // Deduct Materials (Optimistic)
            if (preset.craftingRecipe.materials) {
                const newMaterials = { ...(user.materials || {}) };
                for (const [tier, amount] of Object.entries(preset.craftingRecipe.materials)) {
                    const t = parseInt(tier);
                    newMaterials[t] = (newMaterials[t] || 0) - amount;
                }
                setUser(prev => ({ ...prev, materials: newMaterials }));
            }

            // Deduct Items (Optimistic)
            if (preset.craftingRecipe.items) {
                const newInventory = [...inventory];
                for (const [imgId, amount] of Object.entries(preset.craftingRecipe.items)) {
                    for (let k = 0; k < amount; k++) {
                        const index = newInventory.findIndex(i => i.typeId === imgId);
                        if (index !== -1) newInventory.splice(index, 1);
                    }
                }
                setInventory(newInventory);
            }

            // Log Transaction (Only for demo mode since real mode logs on backend)
            if (user.isDemo) {
                MockDB.logTransaction({ userId: user.id, type: 'ASSET_PURCHASE', amount: 0, status: 'COMPLETED', description: `สร้าง: ${getLocalized(preset.name)}` });
            }

        } else {
            // Normal Purchase via API
            if (user.balance < preset.price) { alert(language === 'th' ? 'เงินไม่พอ' : 'Insufficient Balance'); return; }

            setIsCharging(true);
            try {
                // Call API or MockDB if Demo
                const durationDays = preset.durationDays || (preset.durationMonths || 1) * 30;
                let result;

                if (user.isDemo) {
                    // Demo Mode: Buy locally (Fixed signature: userId, presetId, slotIndex)
                    result = MockDB.buyRig(user.id, preset.id, 0);
                    // Simulate delay
                    await new Promise(r => setTimeout(r, 800));
                } else {
                    // Real Mode: Call API
                    result = await api.buyRig(getLocalized(preset.name), preset.price, preset.dailyProfit, durationDays, preset.repairCost, preset.energyCostPerDay, preset.bonusProfit);
                }

                // Show Gold Rain Animation
                triggerGoldRain();

                // Show Glove Reveal Animation if glove was received
                if (result.glove) {
                    setGloveReveal({
                        name: getLocalized(result.glove.name),
                        rarity: result.glove.rarity,
                        bonus: result.glove.dailyBonus || 0
                    });
                }

                // Optimistic UI Update: Add the new rig and glove to the state immediately
                if (result.rig) {
                    setRigs(prev => [...prev, result.rig]);
                }
                if (result.glove) {
                    setInventory(prev => [...prev, result.glove]);
                }

                setUser(prev => ({ ...prev, balance: prev.balance - (preset.price || 0) }));

                refreshData();
                addNotification({ id: Date.now().toString(), userId: user.id, message: `${language === 'th' ? 'ซื้อเครื่องขุดสำเร็จ' : 'Rig purchased successfully'}: ${getLocalized(preset.name)}`, type: 'SUCCESS', read: false, timestamp: Date.now() });

            } catch (err: any) {
                alert((language === 'th' ? "การซื้อล้มเหลว: " : "Purchase failed: ") + (err.response?.data?.message || err.message));
            } finally {
                setIsCharging(false);
            }
            return; // Exit normal purchase flow
        }

        // Create the Rig (Crafting Success)
        setIsCharging(true);
        console.log(`[HANDEL_PURCHASE] Starting craft for: ${getLocalized(preset.name)}, isDemo: ${user.isDemo}`);
        try {
            let result;
            if (user.isDemo) {
                const durationDays = preset.durationDays || (preset.durationMonths || 1) * 30;
                // Correctly call MockDB.buyRig for demo mode crafting
                result = MockDB.buyRig(user.id, preset.id, 0);
                await new Promise(r => setTimeout(r, 800));
            } else {
                // Real Mode: Call Crafting API
                console.log(`[HANDEL_PURCHASE] Calling api.craftRig("${getLocalized(preset.name)}")`);
                result = await api.craftRig(preset.name.th);
                console.log(`[HANDEL_PURCHASE] api.craftRig result:`, result);
            }

            // Optimistic UI Update: Add the new rig and glove to the state immediately
            if (result.rig) {
                setRigs(prev => [...prev, result.rig]);
            }
            if (result.glove) {
                setInventory(prev => [...prev, result.glove]);
            }

            // Refresh everything to sync with server
            refreshData();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `${language === 'th' ? 'ผลิตเครื่องจักรสำเร็จ' : 'Rig crafted successfully'}: ${getLocalized(preset.name)}`, type: 'SUCCESS', read: false, timestamp: Date.now() });

        } catch (err: any) {
            console.error("Crafting Failed", err);
            // If it failed, we should probably revert the local state if it was deducted, 
            // but refreshData() will handle that sync-back.
            alert((language === 'th' ? "การคราฟต์ล้มเหลว: " : "Crafting failed: ") + (err.response?.data?.message || err.message));
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
            addNotification({ id: Date.now().toString(), userId: user.id, message: `เก็บเกี่ยวสำเร็จ: ${formatCurrency(claimedAmount)}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) {
            console.error("Claim failed", e);
            alert("เคลมเหรียญไม่สำเร็จ: " + (e.response?.data?.message || e.message));
        }
    };

    const handleGiftClaim = async (rigId: string) => {
        try {
            if (user.isDemo) {
                // Keep existing local logic for demo if needed, but for now we focus on Real mode.
                // Re-implementing simplified local version or just alerting.
                alert("Demo mode is not supported for persistent gifts yet.");
                return;
            }

            const res = await api.claimRigGift(rigId);
            refreshData();

            if (res.type === 'ITEM' || res.item) {
                const newItem = res.item;
                setLootResult({ rarity: newItem.rarity, bonus: newItem.dailyBonus, itemTypeId: newItem.typeId, itemName: getLocalized(newItem.name) });
                addNotification({ id: Date.now().toString(), userId: user.id, message: `${language === 'th' ? 'ได้รับของขวัญ' : 'Received gift'}: ${getLocalized(newItem.name)}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
            } else {
                // Fallback for legacy material responses if any
                setLootResult({ rarity: 'SUPER_RARE', bonus: 0, itemName: `${getLocalized(res.name)} x${res.amount}`, materialId: res.tier });
                addNotification({ id: Date.now().toString(), userId: user.id, message: `${language === 'th' ? 'ได้รับของขวัญ' : 'Received gift'}: ${getLocalized(res.name)} x${res.amount}`, type: 'SUCCESS', read: false, timestamp: Date.now() });
            }
        } catch (e: any) {
            const errMsg = e.response?.data?.message || e.message;
            alert(errMsg);
        }
    };


    const handleRenew = (rigId: string) => { try { const cost = MockDB.renewRig(user.id, rigId, 0); refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ต่ออายุเครื่องจักรสำเร็จ (-${formatCurrency(cost)})`, type: 'SUCCESS', read: false, timestamp: Date.now() }); } catch (e: any) { alert(e.message); } };
    const handleRepair = async (rigId: string) => {
        try {
            let cost = 0;
            if (user.isDemo) {
                cost = MockDB.repairRig(user.id, rigId);
            } else {
                const res = await api.repairRig(rigId);
                cost = res.cost;
            }
            refreshData();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ซ่อมแซมเครื่องจักรสำเร็จ (-${formatCurrency(cost)})`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) {
            alert(e.response?.data?.message || e.message);
        }
    };
    const handleCollectMaterials = async (rigId: string) => {
        try {
            const rig = rigs.find(r => r.id === rigId);
            if (!rig) throw new Error('Rig not found');

            const count = rig.currentMaterials || 0;
            if (count <= 0) {
                // No materials to collect, silently return
                return;
            }

            // Determine tier based on investment
            const tier = (() => {
                const investment = rig.investment;
                if (investment === 0) return 7;
                if (investment >= 3000) return 5;
                if (investment >= 2500) return 4;
                if (investment >= 2000) return 3;
                if (investment >= 1500) return 2;
                return 1;
            })();

            if (user.isDemo) {
                MockDB.collectRigMaterials(user.id, rigId);
            } else {
                // Tier is now ignored by backend as it always grants keys
                const res = await api.collectMaterials(rigId, count, 0);
                if (res.item) {
                    addNotification({
                        id: Date.now().toString(),
                        userId: user.id,
                        message: language === 'th' ? `ยินดีด้วย! คุณพบ "กุญแจเข้าเหมือง" x${count}` : `Congratulations! You found "Mining Key" x${count}`,
                        type: 'SUCCESS',
                        read: false,
                        timestamp: Date.now()
                    });
                }
            }

            refreshData();
        } catch (e: any) {
            console.error('[CollectMaterials] Error:', e);
            // Don't show alert for robot auto-collection failures
        }
    };
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
            const isOverclockActive = user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() > Date.now() : false;
            const drainRate = isOverclockActive ? 8.333333333333334 : 4.166666666666667;
            const drain = elapsedHours * drainRate;
            const currentEnergy = Math.max(0, Math.min(100, (targetRig.energy ?? 100) - drain));

            const needed = 100 - currentEnergy;

            // Check for Uniform (5% Discount)
            let discountMultiplier = 1.0;
            if (targetRig.slots && targetRig.slots.length > 0 && user.inventory) {
                const equippedItems = user.inventory.filter((i: any) => targetRig.slots.includes(i.id));
                const hasUniform = equippedItems.some((i: any) => i.typeId === 'uniform');
                if (hasUniform) discountMultiplier = 0.95;
            }

            const cost = Math.max(0.1, (needed / 100) * energyCostPerDay * discountMultiplier);

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
                    message: `ชาร์จไฟสำเร็จ (-${formatCurrency(cost)})`,
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
                    message: `ชาร์จไฟสำเร็จ (-${formatCurrency(res.cost)})`,
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
            }
        } catch (e: any) {
            skipRefreshRef.current = false; // Unblock on error
            refreshData(); // Revert on error
            addNotification({ id: Date.now().toString(), userId: user.id, message: e.message || 'เกิดข้อผิดพลาดในการชาร์จไฟ', type: 'ERROR', read: false, timestamp: Date.now() });
        }
    };

    const handleBuyAccessory = async (itemId: string) => {
        try {
            // Find item info locally first for the request
            const itemInfo = SHOP_ITEMS.find(i => i.id === itemId);
            if (!itemInfo) throw new Error('Item not found');

            const res = await api.buyAccessory({
                itemId: itemInfo.id,
                price: itemInfo.price,
                name: itemInfo.name.th,
                dailyBonus: (itemInfo as any).dailyBonus,
                rarity: (itemInfo as any).rarity,
                lifespanDays: itemInfo.lifespanDays
            });

            const newItem = res.item;

            // Optimistic Update: Add to inventory immediately
            setInventory(prev => [...prev, newItem]);
            setUser(prev => ({ ...prev, balance: res.balance }));

            addNotification({ id: Date.now().toString(), userId: user.id, message: `ได้รับ ${newItem.name} เรียบร้อย!`, type: 'SUCCESS', read: false, timestamp: Date.now() });
            return res;
        } catch (e: any) {
            addNotification({ id: Date.now().toString(), userId: user.id, message: e.response?.data?.message || e.message, type: 'ERROR', read: false, timestamp: Date.now() });
            throw e;
        }
    };

    // ... rest of the component ...
    const handleWithdraw = async (amount: number, pin: string, method: 'BANK' | 'USDT' = 'BANK', walletAddress?: string) => {
        try {
            if (user.isDemo) {
                MockDB.withdraw(user.id, amount, method, walletAddress);
            } else {
                await api.createWithdrawalRequest(amount, pin, method, walletAddress);
            }
            refreshData();
            triggerGoldRain();
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ส่งคำร้องขอถอนเงินผ่าน ${method} จำนวน ${amount.toLocaleString()} ${CURRENCY} แล้ว`, type: 'INFO', read: false, timestamp: Date.now() });
        } catch (e: any) {
            alert(e.response?.data?.message || e.message);
        }
    };
    const handleSaveQr = async (base64: string) => {
        try {
            await api.user.updateBankQr(base64);
            refreshData();
        } catch (err: any) {
            addNotification({ id: Date.now().toString(), userId: user.id, message: "บันทึกล้มเหลว: " + (err.response?.data?.message || err.message), type: 'ERROR', read: false, timestamp: Date.now() });
        }
    };
    const handleDepositSuccess = () => { refreshData(); addNotification({ id: Date.now().toString(), userId: user.id, message: `ส่งคำร้องฝากเงินแล้ว กรุณารออนุมัติ`, type: 'INFO', read: false, timestamp: Date.now() }); };

    // Glove Management Handlers
    const handleManageAccessoryOpen = (rigId: string, slotIndex: number) => {
        setManagingAccessory({ rigId, slotIndex });
    };

    const handleAccessoryEquip = async (itemId: string) => {
        if (!managingAccessory) return;
        try {
            await api.equipAccessory(managingAccessory.rigId, itemId, managingAccessory.slotIndex);
            refreshData();
            setManagingAccessory(null);
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ติดตั้งอุปกรณ์สำเร็จ`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) { alert(e.message); }
    };

    const handleAccessoryUnequip = async () => {
        if (!managingAccessory) return;
        try {
            await api.unequipAccessory(managingAccessory.rigId, managingAccessory.slotIndex);
            refreshData();
            setManagingAccessory(null);
            addNotification({ id: Date.now().toString(), userId: user.id, message: `ถอดอุปกรณ์สำเร็จ`, type: 'SUCCESS', read: false, timestamp: Date.now() });
        } catch (e: any) { alert(e.message); }
    };

    const handleClaimReward = async (notificationId: string) => {
        try {
            const res = await api.claimNotificationReward(notificationId);
            if (res.success) {
                // Update user state with new balance/inventory/notifications
                setUser(prev => ({
                    ...prev,
                    balance: res.user.balance,
                    inventory: res.user.inventory,
                    notifications: res.user.notifications
                }));
                addNotification({ id: Date.now().toString(), userId: user.id, message: res.message || (language === 'th' ? 'รับรางวัลสำเร็จ!' : 'Reward claimed!'), type: 'SUCCESS', read: false, timestamp: Date.now() });
            }
        } catch (e: any) {
            addNotification({ id: Date.now().toString(), userId: user.id, message: e.response?.data?.message || e.message, type: 'ERROR', read: false, timestamp: Date.now() });
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        try {
            const res = await api.deleteNotification(notificationId);
            setUser(prev => ({
                ...prev,
                notifications: res.user.notifications
            }));
        } catch (e: any) {
            console.error("Failed to delete notification", e);
            // Optimistically remove
            setUser(prev => ({
                ...prev,
                notifications: prev.notifications.filter(n => n.id !== notificationId)
            }));
        }
    };

    const rigDaily = rigs.reduce((acc, rig) => {
        // Exclude rigs currently in an expedition
        if (user.activeExpedition && user.activeExpedition.rigId === rig.id && !user.activeExpedition.isCompleted) {
            return acc;
        }

        const nameStr = typeof rig.name === 'string' ? rig.name : (rig.name?.en || rig.name?.th || '');
        const isNoBonusRig = ['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(nameStr);
        const effectiveBonusProfit = isNoBonusRig ? 0 : (rig.bonusProfit || 0);

        // Legacy Scale Fallback: If profit is tiny (< 5), it's likely old USD scale
        const baseDailyProfit = (rig.dailyProfit < 5 && rig.dailyProfit > 0) ? rig.dailyProfit * 35 : rig.dailyProfit;

        const equippedBonus = (rig.slots || []).reduce((sum, itemId) => {
            if (!itemId) return sum;
            const item = inventory.find(i => i.id === itemId);
            if (item) {
                // Legacy Scale Fallback for accessories
                const effectiveItemBonus = (item.dailyBonus < 0.5 && item.dailyBonus > 0) ? item.dailyBonus * 35 : item.dailyBonus;
                return sum + effectiveItemBonus;
            }
            return sum;
        }, 0);
        return acc + baseDailyProfit + effectiveBonusProfit + equippedBonus;
    }, 0) * globalMultiplier * currentOverclockMultiplier;



    return (
        <div className="min-h-screen font-sans pb-24 landscape:pb-16 lg:pb-20 bg-stone-950 text-stone-200">
            {showGoldRain && <GoldRain />}

            {/* ... Navbar (omitted for brevity, assume same structure) ... */}
            <nav className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-yellow-900/30 shadow-2xl">
                <div className="w-full px-4 sm:px-6 py-3 landscape:py-2 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 rounded-sm shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                            <Hammer size={18} className="text-stone-900 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 tracking-tight">GOLD RUSH</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden lg:flex items-center gap-2">
                            <button id="guide-warehouse-btn" onClick={() => setIsWarehouseOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-800/50 bg-blue-900/20 text-blue-500 hover:bg-blue-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Package size={14} /> {t('dashboard.warehouse')}
                            </button>
                            <button id="guide-market-btn" onClick={() => setIsMarketOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-900/20 text-emerald-500 hover:bg-emerald-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <BarChart2 size={14} /> {t('dashboard.market')}
                            </button>
                            <button onClick={() => setIsDailyBonusOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-900/20 text-emerald-500 hover:bg-emerald-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <CalendarCheck size={14} /> {t('dashboard.check_in')}
                            </button>
                            <button onClick={() => setIsMissionOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-800/50 bg-blue-900/20 text-blue-500 hover:bg-blue-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Target size={14} /> {t('dashboard.missions')}
                            </button>
                            <button id="guide-dungeon-btn" onClick={() => setIsDungeonOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-900/50 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Skull size={14} /> {t('dashboard.secret_mine')}
                            </button>
                            <button onClick={() => setIsVIPOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-800/50 bg-yellow-900/20 text-yellow-500 hover:bg-yellow-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Crown size={14} /> VIP
                            </button>
                            <button onClick={() => setIsLeaderboardOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-800/50 bg-orange-900/20 text-orange-500 hover:bg-orange-900/40 text-xs font-bold uppercase tracking-wider transition-colors">
                                <Trophy size={14} /> {t('dashboard.rank')}
                            </button>
                        </div>

                        <button
                            id="guide-shop-btn"
                            onClick={() => setIsShopOpen(true)}
                            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-600/50 bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/30 transition-colors text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        >
                            <ShoppingBag size={14} /> {t('dashboard.shop')}
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3 bg-stone-900/50 p-1.5 rounded-lg border border-stone-800">
                            <div className="flex flex-col items-end px-2 mr-1 sm:mr-2 border-r border-stone-800">
                                <span className="text-[8px] sm:text-[10px] text-stone-500 uppercase tracking-widest leading-none mb-1">{t('common.balance')}</span>
                                <span className="text-base sm:text-lg font-mono font-bold text-white tabular-nums leading-none">
                                    {formatCurrency(user.balance)}
                                </span>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                                <button onClick={() => setIsDepositModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 sm:px-3 sm:py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1 transition-colors shadow-lg shadow-emerald-900/20">
                                    <PlusCircle size={14} /> <span className="hidden sm:inline">{t('common.deposit')}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (!inventory?.some(i => i.typeId === 'vip_withdrawal_card')) {
                                            addNotification({
                                                id: Date.now().toString(),
                                                userId: user.id,
                                                message: language === 'th' ? 'ต้องมี "บัตร VIP ปลดล็อกถอนเงิน" ก่อนถอนเงิน' : 'Must have "VIP Withdrawal Card" first',
                                                type: 'ERROR',
                                                read: false,
                                                timestamp: Date.now()
                                            });
                                            return;
                                        }
                                        setIsWithdrawModalOpen(true);
                                    }}
                                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 p-1.5 sm:px-3 sm:py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1 transition-colors hover:text-white hover:border-stone-500"
                                >
                                    <Wallet size={14} /> <span className="hidden sm:inline">{t('common.withdraw')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="hidden lg:flex gap-2">
                            <button
                                onClick={() => setIsReferralOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-yellow-900/80 to-stone-900 border border-yellow-700/50 text-yellow-500 hover:text-yellow-400 hover:border-yellow-500 transition-all text-[10px] font-bold uppercase shadow-lg shadow-yellow-900/20 active:scale-95 group"
                            >
                                <Users size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden xl:inline">{t('referral.button') || (language === 'th' ? 'แนะนำเพื่อน' : 'Referral')}</span>
                                {user.referralCount > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] px-1 rounded-full">{user.referralCount}</span>}
                            </button>
                            <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-stone-500 hover:text-yellow-500 transition-colors bg-stone-900 border border-stone-800 rounded relative">
                                <History size={20} />
                                {hasPendingTx && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                            </button>
                            <button
                                onClick={() => setIsMailOpen(true)}
                                className="p-2 text-stone-500 hover:text-yellow-500 transition-colors bg-stone-900 border border-stone-800 rounded relative"
                            >
                                <Mail size={20} className={user.notifications?.some(n => !n.read) ? "text-yellow-500" : ""} />
                                {user.notifications?.some(n => !n.read) && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setIsSettingsOpen(true)} className="text-stone-500 hover:text-white transition-colors p-2"><Settings size={20} /></button>
                            <button onClick={onLogout} className="text-stone-500 hover:text-red-400 transition-colors p-2"><LogOut size={20} /></button>
                        </div>

                        <button
                            onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-yellow-500 hover:border-yellow-500 transition-all text-[10px] font-bold uppercase"
                        >
                            <Languages size={14} />
                            {language === 'th' ? 'EN' : 'TH'}
                        </button>

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
            < main className="w-full px-4 sm:px-6 py-6 landscape:py-4 sm:py-8 pb-24 landscape:pb-16 lg:pb-8" >

                {/* Global Stats Ticker */}


                {/* Dashboard Headers & Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
                    {/* Active Rigs */}
                    <div
                        onClick={() => document.getElementById('rigs-list')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-stone-900 p-4 sm:p-6 border-l-4 border-yellow-600 shadow-xl relative overflow-hidden group rounded-r-lg cursor-pointer hover:bg-stone-800 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        <div className="absolute right-0 top-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Hammer size={40} className="sm:w-[60px] sm:h-[60px]" />
                        </div>
                        <div className="text-stone-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2">{t('dashboard.active_rigs')}</div>
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
                        <div className="text-stone-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2">{t('dashboard.total_revenue')}</div>
                        <div className="flex flex-col">
                            <div className="text-2xl sm:text-4xl font-display font-bold text-green-400 flex items-center gap-2 group-hover:text-green-300">
                                {isPowered ?
                                    formatCurrency(rigDaily, { precision: 1 })
                                    : '0.0'}
                                {hasVibranium && isPowered && <span className="text-[10px] sm:text-xs bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500 animate-pulse font-mono">x2 Boost</span>}
                                {!isPowered && <span className="text-[10px] sm:text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded border border-red-500 font-bold animate-pulse">{language === 'th' ? 'หยุดทำงาน' : 'SHUTDOWN'}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Energy - Electric Furnace Style */}
                    <div className={`sm:col-span-2 lg:col-span-1 relative group rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-stone-900 border-2 ${isCharging ? 'border-yellow-400' : 'border-stone-700'}`}>

                        {/* Furnace Background Detail */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950"></div>

                        {/* Vents / Grills */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#000_4px,#000_6px)] opacity-50"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#000_4px,#000_6px)] opacity-50"></div>

                        <div className="relative z-10 p-4 flex flex-col h-full items-center justify-between text-center">

                            {/* Header Text */}
                            <div className="w-full flex justify-between items-start">
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-stone-800">
                                    {t('dashboard.energy_status')}
                                </span>
                                <div className="flex items-center gap-2">
                                    {/* VIP Card Indicator - Permanent Slot */}
                                    <div title={inventory?.some(i => i.typeId === 'vip_withdrawal_card') ? 'VIP Withdrawal Active' : 'VIP Withdrawal Locked'} className={`rounded-full p-1 shadow-md border transition-all duration-500 cursor-help
                                        ${inventory?.some(i => i.typeId === 'vip_withdrawal_card')
                                            ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.6)] border-yellow-200 animate-bounce ring-1 ring-yellow-400/50'
                                            : 'bg-stone-800 border-stone-700 opacity-60'}
                                    `}>
                                        <CreditCard size={12} className={inventory?.some(i => i.typeId === 'vip_withdrawal_card') ? 'text-stone-900' : 'text-stone-400'} />
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${isCharging ? 'bg-yellow-400 animate-ping' : 'bg-red-900'}`}></div>
                                </div>
                            </div>

                            {/* THE CORE (Furnace Window) */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 my-1 sm:my-2 flex items-center justify-center">

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
                                    <div
                                        className="absolute inset-0 opacity-50"
                                        style={{
                                            backgroundImage: 'repeating-conic-gradient(#000 0% 5%, transparent 5% 25%)',
                                            animation: `spin ${isOverclockActive ? '2s' : '10s'} linear infinite`
                                        }}
                                    ></div>

                                    {/* Success Flash Effect */}
                                    {isCharging && <div className="absolute inset-2 rounded-full bg-white/40 animate-ping pointer-events-none"></div>}

                                    {/* Zap Icon - Intense Breathing Animation */}
                                    <Zap
                                        size={24}
                                        className={`relative z-10 transition-all duration-300 sm:scale-125
                                            ${energyLevel > 20 ? 'text-white' : 'text-red-900'}
                                            ${isCharging ? 'scale-150 animate-bounce' : 'animate-breathing'}
                                        `}
                                    />

                                    {/* Additional Overclock Lightning "Strikes" */}
                                    {/* Additional Overclock Lightning "Strikes" -> Epic Lightning Animation */}

                                </div>

                                {/* Success Flash Effect */}
                                {isCharging && <div className="absolute inset-2 rounded-full bg-white/40 animate-ping pointer-events-none"></div>}

                                {/* Epic Lightning Animation (Moved Outside Overflow-Hidden) */}
                                {/* Epic Lightning Animation (Realistic) */}
                                {isOverclockActive && (
                                    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
                                        {/* Main Thunderbolt */}
                                        {/* Bolt 1: 0 deg - Long Fork */}
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] opacity-0 animate-[pulse_0.05s_ease-in-out_infinite] mix-blend-screen drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" style={{ filter: 'url(#lightning-filter)', transform: 'translate(-50%, -50%) rotate(0deg)' }}>
                                            {/* Main Branch */}
                                            <path d="M50,50 L52,40 L48,30 L53,20 L47,10 L50,0" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            {/* Side Branch */}
                                            <path d="M48,30 L40,25" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M53,20 L60,15" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Bolt 2: 72 deg - S Curve Split */}
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] opacity-0 animate-[pulse_0.08s_ease-in-out_infinite] mix-blend-screen drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" style={{ filter: 'url(#lightning-filter)', transform: 'translate(-50%, -50%) rotate(72deg)', animationDelay: '0.03s' }}>
                                            <path d="M50,50 L55,35 L45,25 L50,10" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M55,35 L65,30" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Bolt 3: 144 deg - Jagged Strike */}
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] opacity-0 animate-[pulse_0.12s_ease-in-out_infinite] mix-blend-screen drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" style={{ filter: 'url(#lightning-filter)', transform: 'translate(-50%, -50%) rotate(144deg)', animationDelay: '0.07s' }}>
                                            <path d="M50,50 L48,35 L52,25 L47,15 L50,5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M52,25 L58,20 L62,10" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Bolt 4: 216 deg - Tree Root */}
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] opacity-0 animate-[pulse_0.06s_ease-in-out_infinite] mix-blend-screen drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" style={{ filter: 'url(#lightning-filter)', transform: 'translate(-50%, -50%) rotate(216deg)', animationDelay: '0.02s' }}>
                                            <path d="M50,50 L45,30 L55,10" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M45,30 L35,25" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M50,20 L60,15" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Bolt 5: 288 deg - Chaotic ZigZag */}
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] opacity-0 animate-[pulse_0.1s_ease-in-out_infinite] mix-blend-screen drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100" style={{ filter: 'url(#lightning-filter)', transform: 'translate(-50%, -50%) rotate(288deg)', animationDelay: '0.05s' }}>
                                            <path d="M50,50 L53,35 L42,20 L55,5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M53,35 L60,30" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M42,20 L35,15" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Central Constant Glow (White-Hot) */}
                                        <div className="absolute inset-0 bg-white/30 blur-3xl animate-pulse rounded-full mix-blend-screen"></div>
                                    </div>
                                )}

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
                                    <span>{t('dashboard.time_remaining')}:</span>
                                    {energyLevel > 0 ? <EnergyTimer percent={energyLevel} /> : '--:--:--'}
                                </div>

                                <div className="h-1.5 w-full bg-black rounded-full mt-1 overflow-hidden border border-stone-800">
                                    <div
                                        className={`h-full transition-all duration-500 ${energyLevel > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                        style={{ width: `${energyLevel}%`, boxShadow: `0 0 10px ${energyLevel > 20 ? '#fbbf24' : '#ef4444'}` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-2 w-full">
                                {/* 1. Energy Refill Button (Always Visible) */}
                                <button
                                    onClick={handleRefillEnergyClick}
                                    className={`w-full py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md text-[10px] 
                                        bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border border-orange-500 shadow-orange-900/50 hover:shadow-orange-700/50 active:scale-95 cursor-pointer
                                    `}
                                >
                                    <Zap size={12} className="fill-white animate-pulse" />
                                    {energyLevel >= 100 ? `${t('dashboard.refill_energy')} (${t('dashboard.refill_full')})` : `${t('dashboard.refill_energy')} (2 ฿)`}
                                </button>

                                {/* 2. Overclock Toggle (Mobile Style) */}
                                <div className={`w-full p-3 rounded-xl border transition-all duration-300 flex items-center justify-between relative overflow-hidden group
                                    ${isOverclockActive
                                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                        : 'bg-stone-900/40 border-stone-800'
                                    }`}
                                >


                                    {/* The icon now acts as a Payment/Resume Button */}
                                    <div
                                        onClick={() => !isOverclockActive && handleActivateOverclock()}
                                        className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border shadow-inner transition-all duration-300 group/paybtn relative z-10
                                        ${isOverclockActive
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-[bounce_1s_infinite]'
                                                : (user.overclockRemainingMs || 0) > 0
                                                    ? 'bg-blue-800 border-blue-600 text-blue-200 hover:border-blue-400 cursor-pointer active:scale-95'
                                                    : 'bg-stone-800 border-stone-700 text-stone-500 hover:border-emerald-500/50 hover:bg-stone-800/80 cursor-pointer active:scale-95'}`}
                                    >
                                        <div className="relative">
                                            {isOverclockActive && <div className="absolute inset-0 bg-yellow-400 blur-md animate-ping opacity-50"></div>}
                                            <Zap size={22} className={isOverclockActive ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-pulse' : 'group-hover/paybtn:text-emerald-500 transition-colors'} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase leading-none ${isOverclockActive ? 'text-emerald-400' : 'text-stone-300'}`}>
                                            {isOverclockActive ? 'ACTIVE' : (user.overclockRemainingMs || 0) > 0 ? (language === 'th' ? 'ต่อเวลา' : 'RESUME') : '50 ฿'}
                                        </span>
                                        <span className="text-[7px] opacity-60 font-bold uppercase leading-none tracking-tighter">
                                            Speed x{isOverclockActive ? currentOverclockMultiplier : getOverclockMultiplier(rigs.length)}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-1 relative z-10 pl-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isOverclockActive ? 'bg-yellow-400 animate-[ping_0.5s_infinite]' : 'bg-stone-700'}`}></div>
                                            <h4 className={`text-[13px] font-bold font-display uppercase tracking-widest leading-none ${isOverclockActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 animate-pulse drop-shadow-[0_0_5px_rgba(253,224,71,0.5)]' : 'text-white'}`}>
                                                OVERCLOCK MODE
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {isOverclockActive ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] backdrop-blur-sm w-fit">
                                                        <Timer size={14} className="text-emerald-400 animate-spin" />
                                                        <span className="text-lg font-mono font-bold text-emerald-300 tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                                            {(() => {
                                                                const expiry = new Date(user.overclockExpiresAt!).getTime();
                                                                const left = expiry - Date.now();
                                                                const hours = Math.floor(Math.max(0, left) / (1000 * 60 * 60));
                                                                const mins = Math.floor((Math.max(0, left) % (1000 * 60 * 60)) / (1000 * 60));
                                                                const secs = Math.floor((Math.max(0, left) % (1000 * 60)) / 1000);
                                                                return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-emerald-400 font-bold">Bonus Production: +{Math.round((currentOverclockMultiplier - 1) * 100)}%</span>
                                                </div>
                                            ) : (user.overclockRemainingMs || 0) > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 bg-blue-950/80 px-2 py-1 rounded-md border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] backdrop-blur-sm w-fit">
                                                        <Clock size={14} className="text-blue-400" />
                                                        <span className="text-lg font-mono font-bold text-blue-300 tabular-nums">
                                                            {(() => {
                                                                const left = user.overclockRemainingMs || 0;
                                                                const hours = Math.floor(left / (1000 * 60 * 60));
                                                                const mins = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
                                                                const secs = Math.floor((left % (1000 * 60)) / 1000);
                                                                return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-blue-400 font-bold">{language === 'th' ? 'พักเปร่งพลัง (กดเพื่อต่อ)' : 'Overclock Paused'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-emerald-500 tracking-tight">{t('dashboard.overclock_desc')}</span>
                                                    <span className="text-[9px] text-stone-500 font-mono italic">{t('dashboard.overclock_timer')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* The Toggle Switch Wrapper (Activate System Tooltip) */}
                                    <div className="flex flex-col items-end gap-1.5 z-20 relative">
                                        <span className="text-[8px] font-bold text-stone-500 uppercase tracking-tighter">{isOverclockActive ? t('dashboard.deactivate_x2') : t('dashboard.activate_x2')}</span>
                                        <div
                                            onClick={() => !overclockLoading && (isOverclockActive ? handleDeactivateOverclock() : handleActivateOverclock())}
                                            className={`w-14 h-7 rounded-full p-1 transition-all duration-300 relative 
                                                ${overclockLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                                                ${isOverclockActive ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] border border-yellow-300' : (user.overclockRemainingMs || 0) > 0 ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400' : 'bg-stone-700 hover:bg-stone-600'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform shadow-md flex items-center justify-center
                                                ${isOverclockActive ? 'translate-x-7' : 'translate-x-0'}`}
                                            >
                                                {isOverclockActive && <Zap size={12} className="text-emerald-600 fill-emerald-600 animate-pulse" />}
                                            </div>
                                        </div>

                                        <div className="text-[9px] text-stone-500 font-mono flex items-center gap-1 opacity-70">
                                            <Clock size={8} /> {language === 'th' ? '48 ชม.' : '48h'}
                                        </div>
                                    </div>

                                </div>
                                {!isOverclockActive && (
                                    <div className="mt-2 pt-2 border-t border-stone-800/50 text-[9px] text-center text-stone-500 font-mono flex items-center justify-center gap-1">
                                        {language === 'th' ? 'คลิกที่สวิตช์เพื่อเริ่มใช้งานทันที หรือคลิกไอคอนเพื่อดูรายละเอียด' : 'Click the switch to start immediately or click the icon for details'}
                                    </div>
                                )}
                            </div>
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
                            onClick={() => addNotification({ id: 'community', userId: user.id, title: t('dashboard.online_miners'), message: language === 'th' ? `มีผู้เล่นที่กำลังขุดทองรุ่งเรืองอยู่ในขณะนี้ ${globalStats.onlineMiners.toLocaleString()} ท่าน!` : `There are ${globalStats.onlineMiners.toLocaleString()} miners active right now!`, type: 'INFO', timestamp: Date.now(), read: false })}
                            className="cursor-pointer hover:bg-stone-900/50 p-2 rounded-lg transition-all active:scale-95 group"
                        >
                            <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 mb-1 group-hover:text-blue-400">
                                <Users size={12} /> {t('dashboard.online_miners')}
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
                                <BarChart2 size={12} /> {language === 'th' ? 'มูลค่าตลาด' : 'Market Volume'}
                            </div>
                            <div className="text-xl sm:text-2xl font-display font-bold text-emerald-400 font-mono group-hover:text-emerald-300">
                                {formatCurrency(globalStats.marketVolume)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SLOT SYSTEM GRID --- */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Grid size={24} className="text-yellow-500" /> {t('dashboard.slots_title')}
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
                                        isOverclockActive={isOverclockActive}
                                        overclockMultiplier={currentOverclockMultiplier}
                                        addNotification={addNotification}
                                    />
                                );
                            } else if (isUnlocked) {
                                return (
                                    <div
                                        key={`empty-${slotNumber}`}
                                        onClick={() => setIsBuyModalOpen(true)}
                                        className="border-2 border-dashed border-stone-800 bg-stone-900/30 rounded-xl flex flex-col items-center justify-center p-4 sm:p-8 cursor-pointer hover:bg-stone-900/60 hover:border-yellow-600/50 transition-all group min-h-[220px] sm:min-h-[400px]"
                                    >
                                        <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-stone-800 flex items-center justify-center mb-3 sm:mb-4 shadow-inner group-hover:scale-110 transition-transform">
                                            <Plus size={24} className="text-stone-600 sm:w-10 sm:h-10 group-hover:text-yellow-500" />
                                        </div>
                                        <h4 className="text-sm sm:text-lg font-bold text-stone-500 group-hover:text-yellow-500 uppercase tracking-widest">{t('dashboard.empty_slot')}</h4>
                                        <p className="text-[10px] sm:text-xs text-stone-600 mt-1 sm:mt-2">{t('dashboard.click_to_buy')}</p>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={`locked-${slotNumber}`}
                                        onClick={() => setUnlockTargetSlot(slotNumber)}
                                        className="border-2 border-stone-800 bg-black/40 rounded-xl flex flex-col items-center justify-center p-4 sm:p-8 cursor-pointer relative overflow-hidden group min-h-[220px] sm:min-h-[400px]"
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                                        <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center mb-3 sm:mb-4 z-10 group-hover:border-red-500/50 transition-colors">
                                            <Lock size={20} className="text-stone-600 sm:w-8 sm:h-8 group-hover:text-red-500" />
                                        </div>
                                        <h4 className="text-sm sm:text-lg font-bold text-stone-500 uppercase tracking-widest z-10 group-hover:text-stone-300">{t('dashboard.locked_slot')}</h4>
                                        <p className="text-[10px] sm:text-xs text-stone-600 mt-1 sm:mt-2 z-10 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">Slot #{slotNumber}</p>
                                        <div className="mt-6 px-6 py-2 bg-stone-900/80 rounded border border-stone-700 text-xs font-bold text-stone-400 uppercase tracking-wide group-hover:bg-red-900/20 group-hover:text-red-400 group-hover:border-red-900/50 transition-all z-10">
                                            {t('dashboard.unlock_slot')}
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
                                <span className="text-2xl font-mono font-bold text-white">
                                    {formatCurrency(energyConfirm.cost, { showDecimals: true })}
                                </span>
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
            <div className="fixed bottom-24 lg:bottom-4 right-4 z-[150] flex flex-col gap-2 pointer-events-none">
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
            <InvestmentModal
                isOpen={isBuyModalOpen}
                onClose={() => setIsBuyModalOpen(false)}
                onConfirm={handlePurchase}
                onOpenRates={() => setIsRatesModalOpen(true)}
                walletBalance={user.balance}
                currentRigCount={rigs.length}
                maxRigs={user.unlockedSlots || 3}
                materials={user.materials || {}}
                inventory={inventory}
                rigs={rigs}
                user={user}
                addNotification={addNotification}
            />
            <AccessoryShopModal
                isOpen={isShopOpen}
                onClose={() => setIsShopOpen(false)}
                walletBalance={user.balance}
                onBuy={handleBuyAccessory}
                onRefresh={refreshData}
                addNotification={addNotification}
                userId={user.id}
            />
            <WarehouseModal
                isOpen={isWarehouseOpen}
                onClose={() => setIsWarehouseOpen(false)}
                userId={user.id}
                inventory={inventory}
                materials={user.materials || {}}
                balance={user.balance}
                marketState={marketState}
                onSell={async (tier, amount) => {
                    try {
                        const price = ((marketState?.trends as any)?.[tier]?.currentPrice || MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES]) * amount;
                        MockDB.sellMaterial(user.id, tier, amount);

                        if (!user.isDemo) {
                            const result = await api.sellMaterial(tier, amount);
                            // result.balance is updated on backend
                        }

                        refreshData();
                        triggerGoldRain();
                        addNotification({
                            id: Date.now().toString(),
                            userId: user.id,
                            message: `ขายสำเร็จ! ได้รับ +${formatCurrency(price)}`,
                            type: 'SUCCESS',
                            read: false,
                            timestamp: Date.now()
                        });
                    } catch (e: any) {
                        addNotification({
                            id: Date.now().toString(),
                            userId: user.id,
                            message: "การขายล้มเหลว: " + (e.response?.data?.message || e.message),
                            type: 'ERROR',
                            read: false,
                            timestamp: Date.now()
                        });
                    }
                }}
                onCraft={async (sourceTier) => {
                    try {
                        const res = await api.craftMaterial(sourceTier);
                        refreshData();
                        addNotification({
                            id: Date.now().toString(),
                            userId: user.id,
                            message: `${t('warehouse.craft_success')} ${getLocalized(res.sourceName)} -> ${getLocalized(res.targetName)}`,
                            type: 'SUCCESS',
                            read: false,
                            timestamp: Date.now()
                        });
                        return res;
                    } catch (e: any) {
                        const errMsg = e.response?.data?.message || e.message || t('warehouse.extract_error');
                        addNotification({
                            id: Date.now().toString(),
                            userId: user.id,
                            message: errMsg,
                            type: 'ERROR',
                            read: false,
                            timestamp: Date.now()
                        });
                        throw e;
                    }
                }}
                onPlayGoldRain={triggerGoldRain}
                onOpenMarket={(tier) => {
                    setMarketTier(tier);
                    setIsMarketOpen(true);
                }}
                addNotification={addNotification}
            />

            <AIHelpBot
                tutorialStep={tutorialStep}
                onTutorialNext={handleTutorialNext}
                onTutorialClose={() => {
                    setTutorialStep(0);
                    localStorage.setItem(`tutorial_finished_${user.id}`, 'true');
                }}
                language={language as any}
                user={user}
                onOpenShop={() => setIsShopOpen(true)}
                onOpenWarehouse={() => setIsWarehouseOpen(true)}
                onOpenMarket={() => setIsMarketOpen(true)}
                onOpenDungeon={() => setIsDungeonOpen(true)}
            />

            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                walletBalance={user.balance}
                onWithdraw={handleWithdraw}
                savedQrCode={user.bankQrCode}
                onSaveQr={handleSaveQr}
                currentWalletAddress={user.walletAddress}
                addNotification={addNotification}
                inventory={inventory}
            />
            <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} user={user} onDepositSuccess={handleDepositSuccess} addNotification={addNotification} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} onSuccess={refreshData} addNotification={addNotification} />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} addNotification={addNotification} />
            <GiftSystemModal isOpen={isGiftSystemOpen} onClose={() => setIsGiftSystemOpen(false)} addNotification={addNotification} />
            <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} addNotification={addNotification} />
            <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} referralCode={user.username} referralCount={user.referralCount || 0} />
            <DevToolsModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} user={user} onRefresh={refreshData} addNotification={addNotification} />
            <MarketModal isOpen={isMarketOpen} onClose={() => { setIsMarketOpen(false); setMarketTier(undefined); }} userId={user.id} onSuccess={refreshData} initialTier={marketTier} addNotification={addNotification} />
            <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} inventory={inventory} userId={user.id} onRefresh={refreshData} addNotification={addNotification} marketState={marketState} materials={user.materials} />

            {/* New Modals */}
            <DailyBonusModal isOpen={isDailyBonusOpen} onClose={() => setIsDailyBonusOpen(false)} user={user} onRefresh={refreshData} addNotification={addNotification} />
            <MissionModal isOpen={isMissionOpen} onClose={() => setIsMissionOpen(false)} user={user} onRefresh={refreshData} addNotification={addNotification} />
            <VIPModal isOpen={isVIPOpen} onClose={() => setIsVIPOpen(false)} user={user} addNotification={addNotification} />
            <DungeonModal isOpen={isDungeonOpen} onClose={() => setIsDungeonOpen(false)} user={user} rigs={rigs} onRefresh={refreshData} addNotification={addNotification} />

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
                            materials={user.materials}
                            addNotification={addNotification}
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
                            <div><h2 className="text-2xl font-bold text-white font-display">{t('dashboard.main_menu')}</h2><p className="text-stone-500 text-xs">{t('dashboard.main_menu_desc')}</p></div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-stone-900 rounded-full text-stone-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => { setIsShopOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><ShoppingBag className="text-orange-500" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.shop')}</span></button>
                            <button onClick={() => { setIsWarehouseOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><Package className="text-blue-500" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.warehouse')}</span></button>
                            <button onClick={() => { setIsLeaderboardOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><Trophy className="text-yellow-500" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.rank')}</span></button>
                            <button onClick={() => { setIsDailyBonusOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><CalendarCheck className="text-emerald-500" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.check_in')}</span></button>
                            <button onClick={() => { setIsDungeonOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><Skull className="text-purple-500" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.secret_mine')}</span></button>
                            <button onClick={() => { setIsMissionOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><Target className="text-blue-400" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.missions')}</span></button>
                            <button onClick={() => { setIsVIPOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><Crown className="text-yellow-400" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">VIP</span></button>
                            <button onClick={() => { setIsMarketOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><BarChart2 className="text-emerald-500" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.market')}</span></button>
                            <button onClick={() => { setIsMailOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all relative">
                                <Mail className="text-cyan-400" size={24} />
                                <span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{language === 'th' ? 'จดหมาย' : 'Inbox'}</span>
                                {user.notifications?.some(n => !n.read) && (
                                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-stone-900 animate-pulse"></span>
                                )}
                            </button>
                            <button onClick={() => { setIsReferralOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all relative">
                                <Users className="text-emerald-400" size={24} />
                                <span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{language === 'th' ? 'แนะนำเพื่อน' : 'Referral'}</span>
                                {showReferralAnnouncement && (
                                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-stone-900"></span>
                                )}
                            </button>
                            <button onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><History className="text-stone-400" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('common.history')}</span></button>
                            <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex flex-col items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-all"><Settings className="text-stone-400" size={24} /><span className="text-[10px] font-bold text-stone-300 text-center line-clamp-1">{t('dashboard.settings')}</span></button>
                        </div>
                        <div className="mt-auto">
                            <button onClick={onLogout} className="w-full py-4 bg-red-900/20 text-red-400 border border-red-900/50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-900/30 transition-colors"><LogOut size={20} /> {t('common.logout')}</button>
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
                        <span className="text-[10px] font-medium">{t('dashboard.buy_rig')}</span>
                    </button>
                    <button
                        onClick={() => setIsWarehouseOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-blue-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <Package size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">{t('dashboard.warehouse')}</span>
                    </button>
                    <button
                        onClick={() => setIsMarketOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-emerald-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <BarChart2 size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">{t('dashboard.market')}</span>
                    </button>
                    <button
                        onClick={() => setIsDungeonOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-purple-500 hover:bg-stone-800/50 transition-all active:scale-95"
                    >
                        <Skull size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">{t('dashboard.secret_mine')}</span>
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/50 transition-all active:scale-95 relative"
                    >
                        <Grid size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">{t('dashboard.menu')}</span>
                        {user.notifications?.some(n => !n.read) && (
                            <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full border border-stone-950 animate-pulse"></span>
                        )}
                    </button>
                </div>
            </nav>

            {/* Chat System */}
            <ChatSystem currentUser={user} />

            {/* Mail Modal */}
            <MailModal
                isOpen={isMailOpen}
                onClose={() => setIsMailOpen(false)}
                user={user}
                onClaimReward={handleClaimReward}
                onDeleteNotification={handleDeleteNotification}
            />

            {/* Referral Announcement */}
            {showReferralAnnouncement && (
                <ReferralAnnouncement onClose={handleCloseAnnouncement} />
            )}

            {/* Global Modals */}

            {/* Glove Reveal Modal */}
            <GloveRevealModal
                isOpen={gloveReveal !== null}
                onClose={() => setGloveReveal(null)}
                gloveName={gloveReveal?.name || ''}
                gloveRarity={gloveReveal?.rarity || 'COMMON'}
                gloveBonus={gloveReveal?.bonus || 0}
            />

            {/* SVG Filter Definition for Realistic Lightning */}
            <svg className="hidden">
                <filter id="lightning-filter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.15" numOctaves="3" result="noise" seed="0" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
                </filter>
            </svg>

        </div >
    );
};
