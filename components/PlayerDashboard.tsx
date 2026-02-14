import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Wallet, Download, CheckCircle, ArrowRight, Package, RefreshCw, Zap, Hammer, Sparkles, AlertTriangle, Key, Cpu, ShieldCheck, Wrench, Pickaxe, ArrowUp, Info, Activity, Menu, Users, ShoppingBag, User, Mail, Settings, Coins, CreditCard, Banknote, Power, BarChart2, ChevronRight, ArrowDown, Flame, Target, Trophy, History, LogOut, Plus, Lock, CalendarCheck, Ghost, Truck } from 'lucide-react';
import { api } from '../services/api';
// import { MockDB } from '../services/db'; // Not using MockDB directly for now unless needed
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../services/translations';
import { ROBOT_CONFIG, SHOP_ITEMS, MATERIAL_CONFIG, REPAIR_CONFIG, ENERGY_CONFIG } from '../constants';
import { MaterialIcon } from './MaterialIcon';

// Utility functions moved here since utils folder is missing
const calculateMiningPower = (rig: any) => rig.dailyProfit || 0;
const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 0 });
const formatCountdown = (ms: number | null) => {
    if (ms === null) return '--:--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} `;
};

import { RigCard } from './RigCard';
import { InvestmentModal } from './InvestmentModal';
import { AccessoryShopModal } from './AccessoryShopModal';
import { LeaderboardModal } from './LeaderboardModal';
import { InventoryModal } from './InventoryModal';
import { DailyBonusModal } from './DailyBonusModal';
import { MissionModal } from './MissionModal';
import { LootBoxModal } from './LootBoxModal';
import { DungeonModal } from './DungeonModal';
import { VIPModal } from './VIPModal';
import { MarketModal } from './MarketModal';
import { AccessoryManagementModal } from './AccessoryManagementModal'; // Import Management Modal
import { SlotUnlockModal } from './SlotUnlockModal'; // Import Slot Unlock Modal
import { WarehouseModal } from './WarehouseModal';
import { LootRatesModal } from './LootRatesModal';
import { GloveRevealModal } from './GloveRevealModal';
import { MaterialRevealModal } from './MaterialRevealModal';
import { AutomatedBotOverlay } from './AutomatedBotOverlay';
import { ChatSystem } from './ChatSystem';
import { AIHelpBot } from './AIHelpBot';
import { MailModal } from './MailModal';
import { ReferralModal } from './ReferralModal';
import { DevToolsModal } from './DevToolsModal';
import { SettingsModal } from './SettingsModal';
import { UserGuideModal } from './UserGuideModal';
import { HistoryModal } from './HistoryModal';
// import { AnnouncementModal } from './AnnouncementModal'; // Also likely missing if not in list
import { WithdrawModal } from './WithdrawModal';
import { DepositModal } from './DepositModal';
import { TransactionConfirmModal } from './TransactionConfirmModal';
import { ClaimResultModal } from './ClaimResultModal';
import { SuccessModal } from './SuccessModal';

interface PlayerDashboardProps {
    user: any;
    onLogout: () => void;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ user: propUser, onLogout }) => {
    const { t, language, setLanguage, formatCurrency, formatBonus } = useLanguage();

    const [user, setUser] = useState<any>(propUser);

    if (!user) return null;
    const [rigs, setRigs] = useState<any[]>([]); // Initialize as empty array
    // const [inventory, setInventory] = useState<any[]>([]); // Use user.inventory
    const [marketState, setMarketState] = useState<any>(null);
    const [globalStats, setGlobalStats] = useState<any>(null);

    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Modals
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isDailyBonusOpen, setIsDailyBonusOpen] = useState(false);
    const [isMissionOpen, setIsMissionOpen] = useState(false);
    const [isLootBoxOpen, setIsLootBoxOpen] = useState(false);
    const [isDungeonOpen, setIsDungeonOpen] = useState(false);
    const [isVipOpen, setIsVipOpen] = useState(false);
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [isAccessoryManagerOpen, setIsAccessoryManagerOpen] = useState(false);
    const [isSlotUnlockOpen, setIsSlotUnlockOpen] = useState(false);
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
    const [isLootRatesOpen, setIsLootRatesOpen] = useState(false);
    const [isGloveRevealOpen, setIsGloveRevealOpen] = useState(false);
    const [isMaterialRevealOpen, setIsMaterialRevealOpen] = useState(false);
    const [isClaimResultOpen, setIsClaimResultOpen] = useState(false);
    const [isMailOpen, setIsMailOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAccessoryShopOpen, setIsAccessoryShopOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalConfig, setSuccessModalConfig] = useState<{ title: string; message: string; type: 'SUCCESS' | 'KEY' | 'BATTERY' }>({
        title: '',
        message: '',
        type: 'SUCCESS'
    });
    const [pendingGlove, setPendingGlove] = useState<any>(null);
    const [pendingMaterial, setPendingMaterial] = useState<any>(null);
    const [claimedAmount, setClaimedAmount] = useState<number>(0);
    const [isFurnaceActive, setIsFurnaceActive] = useState(true); // Default true for now
    const [nextCollectMs, setNextCollectMs] = useState<number | null>(null);
    const [isConfirmRefillOpen, setIsConfirmRefillOpen] = useState(false);

    const [selectedRig, setSelectedRig] = useState<any>(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);
    const [unlockTargetSlot, setUnlockTargetSlot] = useState<number | null>(null);

    const [notifications, setNotifications] = useState<any[]>([]);
    const addNotification = (n: any) => setNotifications(prev => [n, ...prev]);

    // --- TUTORIAL STATE ---
    const [tutorialStep, setTutorialStep] = useState(0);

    const handleTutorialNext = () => {
        setTutorialStep(prev => prev + 1);
    };

    const handleTutorialClose = () => {
        setTutorialStep(0);
        // Optionally mark tutorial as completed in backend if needed
    };

    // --- AUTOMATION REFS ---
    const workerRef = useRef<NodeJS.Timeout | null>(null);
    const lastAutoRefillRef = useRef<Record<string, number>>({});
    const lastAutoCollectRef = useRef<Record<string, number>>({});
    const lastAutoKeyCollectRef = useRef<Record<string, number>>({});
    const lastAutoBatteryRefillRef = useRef<number>(0);
    const lastAutoRepairRef = useRef<Record<string, number>>({});

    // --- ROBOT STATE ---
    const [botStatus, setBotStatus] = useState<'WORKING' | 'COOLDOWN' | 'PAUSED'>('WORKING');
    const [botCooldownRemaining, setBotCooldownRemaining] = useState<number>(0);
    const [botWorkTimeRemaining, setBotWorkTimeRemaining] = useState<number>(0);
    const BOT_COOLDOWN_DURATION = 10000; // 10 seconds cooldown cycle
    const BOT_WORK_DURATION = 20000; // 20 seconds work cycle
    const lastBotActionRef = useRef<number>(Date.now());

    // Toggle Pause
    const toggleBotPause = () => {
        setBotStatus(prev => prev === 'PAUSED' ? (botCooldownRemaining > 0 ? 'COOLDOWN' : 'WORKING') : 'PAUSED');
    };

    const userRef = useRef(user);
    const rigsRef = useRef(rigs);
    const isFurnaceActiveRef = useRef(isFurnaceActive);
    const botStatusRef = useRef(botStatus);
    const botCooldownRef = useRef(botCooldownRemaining);

    // Update refs
    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { rigsRef.current = rigs; }, [rigs]);
    useEffect(() => { isFurnaceActiveRef.current = isFurnaceActive; }, [isFurnaceActive]);
    useEffect(() => { botStatusRef.current = botStatus; }, [botStatus]);
    useEffect(() => { botCooldownRef.current = botCooldownRemaining; }, [botCooldownRemaining]);

    const handleRefillEnergy = () => {
        setIsConfirmRefillOpen(false);
        api.refillEnergy('overclock').then(res => {
            if (res.success) {
                setUser((prev: any) => ({ ...prev, balance: res.balance, energy: res.energy }));
                setIsFurnaceActive(true);
                if (addNotification) {
                    addNotification({
                        id: Date.now().toString(),
                        title: language === 'th' ? 'เติมพลังงานสำเร็จ!' : 'Refill Successful!',
                        message: language === 'th' ? 'เติมพลังงานเตาหลอมเรียบร้อยแล้ว' : 'Furnace energy has been refilled.',
                        type: 'SUCCESS',
                        read: false,
                        timestamp: Date.now()
                    });
                }
            } else {
                alert(res.message || 'Refill failed');
            }
        }).catch(err => {
            console.error("Refill failed", err);
            const errMsg = err.response?.data?.message || err.message || 'Refill failed';
            alert(`Error: ${errMsg}`);
        });
    };

    // Fetch Data
    const fetchData = async () => {
        try {
            // Parallel fetch for speed
            const [u, r, m, s] = await Promise.all([
                api.getMe(),
                api.getMyRigs(),
                api.getMarketStatus(),
                api.getGlobalStats().catch(() => ({ onlineMiners: 0, totalOreMined: 0, marketVolume: 0 })) // Fallback
            ]);

            if (u) {
                setUser(u);
                setNotifications(u.notifications || []);
            }
            if (r) setRigs(r);
            if (m) setMarketState(prev => JSON.stringify(prev) !== JSON.stringify(m) ? m : prev);
            if (s) setGlobalStats(s);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    // Countdown timer for AI Robot
    // Next collect countdown removed (AI Robot removed)
    useEffect(() => {
        setNextCollectMs(null);
    }, []);

    // --- AUTOMATED ACTIONS (AI ROBOT) ---
    useEffect(() => {
        const checkAutomation = async () => {
            const currentUser = userRef.current;
            const currentRigs = rigsRef.current;
            const currentIsFurnaceActive = isFurnaceActiveRef.current;
            const currentBotStatus = botStatusRef.current;
            let currentCooldown = botCooldownRef.current;

            // --- 0. BOT CYCLE LOGIC ---
            if (currentBotStatus === 'PAUSED') {
                return; // Do nothing if paused
            }

            if (currentBotStatus === 'COOLDOWN') {
                if (currentCooldown > 0) {
                    const newCooldown = Math.max(0, currentCooldown - 1000);
                    setBotCooldownRemaining(newCooldown);
                    if (newCooldown <= 0) {
                        setBotStatus('WORKING');
                        lastBotActionRef.current = Date.now(); // Reset work timer
                    }
                }
                return; // In cooldown, no work
            }


            // --- 1. AUTOMATION LOGIC (AI ROBOT - WORKING STATE) ---
            const workDone = Date.now() - lastBotActionRef.current;
            const timeLeft = Math.max(0, BOT_WORK_DURATION - workDone);
            setBotWorkTimeRemaining(timeLeft);

            // Check if we should switch to cooldown (simulate work cycle)
            if (timeLeft <= 0) {
                setBotStatus('COOLDOWN');
                setBotCooldownRemaining(BOT_COOLDOWN_DURATION);
                return;
            }

            // Auto Repair
            for (const rig of currentRigs) {
                // Calculate durability based on repairCost and Rigs Config? 
                // Simplified: If backend doesn't send "durability", we use lastRepair timestamp logic or assume constant decay?
                // For this demo, let's assume we check for "BROKEN" or low health if available.
                // Since frontend doesn't track health % explicitly in `rig` object here (it's in RigCard logic), 
                // we'll use a placeholder check or assume if status is 'maintenance' ref repair.
                // BUT, user asked for "Working Robot". We will simulate it working.

                // Auto Collect (Claim)
                // Collect every 10 minutes or if pending rewards > threshold?
                // Let's claim if unclaimed for > 1 hour
                const now = Date.now();
                if (now - rig.lastClaimAt > 3600000) { // 1 Hour
                    // Don't actually call API too often in loop without flags, this is just visual simulation of logic
                    // to actually claim, we need to be careful not to spam API.
                    // For "Visual", we just show the robot.
                }
            }

            // Real Automation Implementation (Throttled)
            const now = Date.now();

            // A. Auto Refill Energy (every 5 min check)
            if (currentIsFurnaceActive && currentUser?.energy < ROBOT_CONFIG.ENERGY_THRESHOLD && (now - lastAutoBatteryRefillRef.current > 300000)) {
                // Trigger refill if user has money? 
                // api.refillEnergy('overclock'); // Uncomment to enable real auto-spend
                // console.log("AI Robot: Auto Refill Energy");
                lastAutoBatteryRefillRef.current = now;
            }

            // --- 2. FURNACE ENERGY DRAIN SIMULATION ---
            if (currentIsFurnaceActive && currentRigs.length > 0) {
                const extraDrainPercent = currentRigs.length * 0.10; // 0.10 to 0.60
                const baseDrainPerSecond = 0.0007; // Adjusted to match backend (total with 6 rigs ~0.0011)
                const totalDrain = baseDrainPerSecond * (1 + extraDrainPercent);

                setUser((prev: any) => {
                    if (!prev) return prev;
                    let newEnergy = (prev.energy || 100) - totalDrain;
                    if (newEnergy <= 0) {
                        newEnergy = 0;
                        setIsFurnaceActive(false); // Auto-turn off
                    }
                    return { ...prev, energy: newEnergy };
                });
            }
        };

        const interval = setInterval(checkAutomation, 1000);
        return () => clearInterval(interval);
    }, []); // Empty dependency array, using refs


    // Handlers
    const handleClaim = async (rigId: string, amount: number) => {
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) return;

        try {
            if (!amount || amount <= 0 || isNaN(amount)) {
                console.warn('Invalid profit calculation:', amount);
                return;
            }

            // In api.ts, claimReward takes (rigId, amount). 
            const res = await api.claimReward(rigId, amount);

            // Optimistic update from backend response (faster & safer than refetch)
            if (res.success) {
                setUser((prev: any) => ({ ...prev, balance: res.balance }));
                setRigs((prevRigs: any[]) => prevRigs.map((r: any) =>
                    r.id === rigId ? { ...r, lastClaimAt: new Date(res.lastClaimAt).getTime() } : r
                ));

                // Show Claim Result Popup
                setClaimedAmount(amount);
                setIsClaimResultOpen(true);
            } else {
                fetchData(); // Fallback if no specific data returned
            }
        } catch (err) {
            console.error("Claim failed", err);
            const errMsg = err?.response?.data?.message || err?.message || t('common.error');
            alert(`${t('common.error')}: ${errMsg}`);
        }
    };

    const handleConfirmBuyRig = async (rigPreset: any) => {
        try {
            const res = await api.buyRig(rigPreset.name, rigPreset.price, rigPreset.dailyProfit, (rigPreset.durationMonths || 1) * 30);
            if (res.glove) {
                setPendingGlove(res.glove);
                setIsGloveRevealOpen(true);
            }
            fetchData();
            setIsShopOpen(false);
        } catch (err: any) {
            console.error("Buy rig failed", err);
            alert(err.response?.data?.message || "Buy rig failed");
        }
    };

    const handleAddRig = () => {
        setIsShopOpen(true);
    };

    const handleBuyAccessory = async (itemId: string) => {
        try {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return;

            // Ensure name and specialEffect are strings for the API
            const itemName = typeof item.name === 'string' ? item.name : (item.name[language as 'th' | 'en'] || item.name.th);
            const specialEffect = item.specialEffect ? (item.specialEffect[language as 'th' | 'en'] || item.specialEffect.th) : undefined;

            await api.buyAccessory({
                typeId: item.id,
                name: itemName,
                price: item.price,
                rarity: 'COMMON', // Default for shop items
                dailyBonus: item.minBonus || 0,
                durationBonus: item.durationBonus || 0,
                specialEffect: specialEffect,
                lifespanDays: item.lifespanDays,
            });
            fetchData();
        } catch (err: any) {
            console.error("Buy accessory failed", err);
            alert(err.response?.data?.message || "Buy accessory failed");
        }
    };

    const handleEquip = async (itemId: string) => {
        if (!selectedRig || selectedSlotIndex === -1) return;
        try {
            await api.equipAccessory(selectedRig.id, itemId, selectedSlotIndex);
            setIsAccessoryManagerOpen(false);
            fetchData();
        } catch (err) {
            console.error("Equip failed", err);
            alert("Equip failed");
        }
    };

    const handleUnequip = async () => {
        if (!selectedRig || selectedSlotIndex === -1) return;
        try {
            await api.unequipAccessory(selectedRig.id, selectedSlotIndex);
            setIsAccessoryManagerOpen(false);
            fetchData();
        } catch (err) {
            console.error("Unequip failed", err);
            alert("Unequip failed");
        }
    };

    const handleOpenAccessoryManager = (rig: any, slotIndex: number) => {
        setSelectedRig(rig);
        setSelectedSlotIndex(slotIndex);
        setIsAccessoryManagerOpen(true);
    };

    const handleUpgradeRig = (rig: any) => {
        // setSelectedRig(rig);
        // setIsUpgradeOpen(true);
        alert("Upgrade feature unavailable.");
    };

    const handleUnlockSlot = (rig: any, slotIndex: number) => {
        setSelectedRig(rig);
        setUnlockTargetSlot(slotIndex);
        setIsSlotUnlockOpen(true);
    };

    const handleSlotUnlockConfirm = async () => {
        if (!selectedRig || unlockTargetSlot === null) return;
        try {
            // Unlock slot logic might be missing in API or specific to user level?
            // api.user.unlockSlot takes 'targetSlot' number.
            await api.user.unlockSlot(unlockTargetSlot);
            setIsSlotUnlockOpen(false);
            fetchData();
        } catch (err) {
            console.error("Unlock failed", err);
            alert("Unlock failed");
        }
    };

    const handleRenew = async (rigInput: any) => {
        try {
            const rigId = typeof rigInput === 'string' ? rigInput : rigInput.id;
            const res = await api.renewRig(rigId);
            if (res.success) {
                fetchData();
            }
        } catch (err: any) {
            console.error("Renew failed", err);
        }
    };

    const handleRepair = async (rigInput: any) => {
        try {
            const rigId = typeof rigInput === 'string' ? rigInput : rigInput.id;
            const res = await api.repairRig(rigId);
            fetchData();
        } catch (err) {
            console.error("Repair failed", err);
            alert("Repair failed");
        }
    };

    const handleChargeRigEnergy = async (rig: any) => {
        try {
            const rigId = typeof rig === 'string' ? rig : rig.id;
            const res = await api.refillRigEnergy(rigId);
            if (res.success) {
                fetchData();
                setSuccessModalConfig({
                    title: language === 'th' ? 'พลังงานเต็มแล้ว!' : 'Refill Successful!',
                    message: language === 'th' ? 'เครื่องขุดชาร์จแบตเตอรี่เต็ม 100% พร้อมทำงานต่อ!' : 'Rig battery is now 100% and ready to mine!',
                    type: 'BATTERY'
                });
                setIsSuccessModalOpen(true);
            } else {
                alert(res.message || "Refill failed");
            }
        } catch (err: any) {
            console.error("Refill energy failed", err);
            const errMsg = err.response?.data?.message || err.message || "Refill failed";
            alert(`Refill failed: ${errMsg}`);
        }
    };

    const handleCollectMaterials = async (rigInput: any) => {
        try {
            // Resolve rig from ID if needed
            const rig = typeof rigInput === 'string'
                ? rigs.find((r: any) => r.id === rigInput)
                : rigInput;

            if (!rig) {
                console.error("Rig not found for collection:", rigInput);
                return;
            }

            // Logic duplicated from auto-collect to determine tier
            const investment = rig.investment || 0;
            let tier = 1;
            if (investment >= 30000) tier = 5;
            else if (investment >= 10000) tier = 4;
            else if (investment >= 5000) tier = 3;
            else if (investment >= 1000) tier = 2;

            const res = await api.collectMaterials(rig.id, rig.currentMaterials, tier);

            if (res && res.type === 'ITEM') {
                const nameTh = typeof res.name === 'object' ? res.name.th : res.name;
                const isKey = res.itemId === 'chest_key';

                if (isKey) {
                    setSuccessModalConfig({
                        title: language === 'th' ? 'ได้รับกุญแจเข้าเหมือง!' : 'Key Received!',
                        message: language === 'th' ? `คุณได้รับ ${nameTh} จำนวน ${res.amount} ดอก` : `You received ${res.amount}x ${typeof res.name === 'object' ? res.name.en : res.name}`,
                        type: 'KEY'
                    });
                    setIsSuccessModalOpen(true);
                } else {
                    setPendingMaterial({
                        name: res.name,
                        tier: 999,
                        amount: res.amount
                    });
                    setIsMaterialRevealOpen(true);
                }
            } else if (res && res.type === 'MATERIAL' && res.tier === 7) {
                // Check if it's the old Vibranium that was confused for keys, now explicitly just material
                // No special modal needed, just auto-collect or maybe show small toast?
                // Current logic just refreshes data.
            }

            fetchData();
        } catch (err: any) {
            console.error("Collect materials failed", err);
            const errMsg = err.response?.data?.message || "Collect failed";
            alert(errMsg);
        }
    };

    const handleScrap = async (rigInput: any) => {
        // Confirmation is handled in RigCard UI now
        try {
            const rigId = typeof rigInput === 'string' ? rigInput : rigInput.id;
            const res = await api.destroyRig(rigId);
            if (res.success) {
                fetchData();
            }
        } catch (err: any) {
            console.error("Scrap rig failed", err);
        }
    };

    const handleClaimGift = async (rigInput: any) => {
        try {
            const rigId = typeof rigInput === 'string' ? rigInput : rigInput.id;
            const res = await api.claimRigGift(rigId);

            if (res && res.type === 'ITEM') {
                const nameTh = typeof res.name === 'object' ? res.name.th : res.name;
                const isKey = res.itemId === 'chest_key';

                if (isKey) {
                    setSuccessModalConfig({
                        title: language === 'th' ? 'ได้รับกุญแจเข้าเหมือง!' : 'Key Received!',
                        message: language === 'th' ? `คุณได้รับ ${nameTh} จำนวน ${res.amount} ดอก` : `You received ${res.amount}x ${typeof res.name === 'object' ? res.name.en : res.name}`,
                        type: 'KEY'
                    });
                    setIsSuccessModalOpen(true);
                } else {
                    // Generic Item Reward Modal (Reuse Material Modal or Create New)
                    setPendingMaterial({
                        name: res.name,
                        tier: 999, // Dummy tier for items
                        amount: res.amount
                    });
                    setIsMaterialRevealOpen(true);
                }
                fetchData();
            } else if (res && res.type === 'MATERIAL') {
                // Show specialized SuccessModal if it's a key (Legacy fallback)
                const nameTh = typeof res.name === 'object' ? res.name.th : res.name;
                // Strict check: Only treat as key if explicitly chest_key or specifically handled legacy logic
                // Vibranium (Tier 7) should NOT be a key anymore
                const isKey = nameTh.includes('กุญแจ') && res.tier !== 7;

                if (isKey) {
                    setSuccessModalConfig({
                        title: language === 'th' ? 'ได้รับกุญแจเข้าเหมือง!' : 'Key Received!',
                        message: language === 'th' ? `คุณได้รับ ${nameTh} จำนวน ${res.amount} ดอก` : `You received ${res.amount}x ${typeof res.name === 'object' ? res.name.en : res.name}`,
                        type: 'KEY'
                    });
                    setIsSuccessModalOpen(true);
                } else {
                    setPendingMaterial({
                        name: res.name,
                        tier: res.tier,
                        amount: res.amount
                    });
                    setIsMaterialRevealOpen(true);
                }
                fetchData();
            } else if (res && res.glove) {
                setPendingGlove(res.glove);
                setIsGloveRevealOpen(true);
                fetchData();
            } else {
                alert("No gift found!");
            }
        } catch (err: any) {
            console.error("Claim gift failed", err);
            // alert(err.response?.data?.message || "Claim gift failed");
            if (addNotification) addNotification({
                id: Date.now().toString(),
                message: err.response?.data?.message || t('rig.claim_gift_failed'),
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }
    };

    // --- WAREHOUSE HANDLERS ---
    const handleSellMaterial = async (tier: number, amount: number) => {
        try {
            await api.sellMaterial(tier, amount);
            fetchData();
        } catch (err: any) {
            console.error("Sell material failed", err);
            alert(err.response?.data?.message || "Sell failed");
        }
    };

    const handleCraftMaterial = async (sourceTier: number) => {
        try {
            const res = await api.craftMaterial(sourceTier);
            fetchData();
            return res; // Return for modal animation
        } catch (err: any) {
            console.error("Craft material failed", err);
            alert(err.response?.data?.message || "Craft failed");
            throw err;
        }
    };

    const handleUpgradeEquipment = async (itemId: string, useInsurance: boolean) => {
        try {
            const res = await api.inventory.upgrade(itemId, useInsurance);
            fetchData();
            return res;
        } catch (err: any) {
            console.error("Upgrade equipment failed", err);
            alert(err.response?.data?.message || "Upgrade failed");
            throw err;
        }
    };

    const handleScrapEquipment = async (itemId: string) => {
        try {
            const res = await api.inventory.sell(itemId);
            fetchData();
            return res;
        } catch (err: any) {
            console.error("Scrap equipment failed", err);
            alert(err.response?.data?.message || "Scrap failed");
            throw err;
        }
    };

    const handleWithdraw = async (amount: number, pin: string, method: 'BANK' | 'USDT', walletAddress?: string) => {
        try {
            await api.createWithdrawalRequest(amount, pin, method, walletAddress);
            fetchData();
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user?.id || '',
                message: language === 'th' ? 'ส่งคำขอถอนเงินสำเร็จ' : 'Withdrawal request sent successfully',
                type: 'SUCCESS',
                read: false,
                timestamp: Date.now()
            });
        } catch (err: any) {
            console.error("Withdrawal failed", err);
            alert(err.response?.data?.message || "Withdrawal failed");
        }
    };

    const handleDeposit = async (amount: number, slipImage: string) => {
        try {
            await api.createDepositRequest(amount, slipImage);
            fetchData();
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user?.id || '',
                message: language === 'th' ? 'ส่งคำขอฝากเงินสำเร็จ' : 'Deposit request sent successfully',
                type: 'SUCCESS',
                read: false,
                timestamp: Date.now()
            });
        } catch (err: any) {
            console.error("Deposit failed", err);
            alert(err.response?.data?.message || "Deposit failed");
        }
    };

    // Notification handling
    const handleClaimNotification = async (n: any) => {
        if (n.claimed) return;
        try {
            const res = await api.claimNotificationReward(n.id);
            if (res.success) {
                // Update local notification state or fetch data
                setUser(res.user);
                // Mark locally
                setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, claimed: true, read: true } : notif));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await api.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-[90] bg-stone-950/80 backdrop-blur-md border-b border-stone-800 h-16">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 text-stone-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Pickaxe className="text-yellow-500" size={24} />
                            <span className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                GOLD RUSH
                            </span>
                        </div>
                    </div>

                    {/* Desktop Stats */}
                    <div className="hidden lg:flex items-center gap-6 bg-stone-900/50 px-4 py-1.5 rounded-full border border-stone-800/50">
                        <div className="flex items-center gap-2 px-2">
                            <Users size={14} className="text-blue-400" />
                            <span className="text-xs font-bold text-stone-300">
                                {globalStats?.onlineMiners || 0} {language === 'th' ? 'คนออนไลน์' : 'Online'}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-stone-800"></div>
                        <div className="flex items-center gap-2 px-2">
                            <ShoppingBag size={14} className="text-emerald-400" />
                            <span className="text-xs font-bold text-stone-300">
                                {language === 'th' ? 'รวม:' : 'Vol:'} {formatCurrency(globalStats?.marketVolume || 0, { hideSymbol: true })} {language === 'th' ? '฿' : '$'}
                            </span>
                        </div>
                    </div>

                    {/* User Profile & Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-white">{user?.username || 'User'}</span>
                            <span className="text-xs text-stone-400">ID: {user?.id || '...'}</span>
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-stone-700 bg-stone-800/80 hover:bg-stone-700 hover:border-stone-500 transition-all duration-200 text-xs font-black tracking-wider"
                            title={language === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai'}
                        >
                            <span className={language === 'th' ? 'text-yellow-400' : 'text-stone-500'}>TH</span>
                            <span className="text-stone-600">/</span>
                            <span className={language === 'en' ? 'text-blue-400' : 'text-stone-500'}>EN</span>
                        </button>

                        <div className="relative group cursor-pointer" onClick={() => setIsVipOpen(true)}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 p-0.5">
                                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center overflow-hidden">
                                    <User size={20} className="text-yellow-500" />
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-stone-900 rounded-full p-0.5">
                                <div className="bg-yellow-500 text-[10px] font-black text-stone-900 px-1.5 rounded-full">
                                    V{user?.vipLevel || 0}
                                </div>
                            </div>
                        </div>

                        <button
                            className="p-2 text-stone-400 hover:text-white transition-colors relative"
                            onClick={() => setIsMailOpen(true)}
                        >
                            <Mail size={20} />
                            {notifications?.filter((n: any) => !n.read).length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        <button
                            className="p-2 text-stone-400 hover:text-white transition-colors"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            {/* AI Robot Mascot removed */}
            {/* <AIHelpBot
                tutorialStep={tutorialStep}
                onTutorialNext={handleTutorialNext}
                onTutorialClose={handleTutorialClose}
                language={language as 'th' | 'en'}
                user={user}
                onOpenShop={() => setIsShopOpen(true)}
                onOpenWarehouse={() => setIsWarehouseOpen(true)}
                onOpenMarket={() => setIsMarketOpen(true)}
                onOpenDungeon={() => setIsDungeonOpen(true)}
            /> */}


            <main className="pt-20 pb-24 lg:pb-8 px-4 max-w-7xl mx-auto min-h-screen flex flex-col gap-6">

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {/* Balance */}
                    {(() => {
                        const hasVipWithdrawal = user?.inventory?.some((i: any) => i.typeId === 'vip_withdrawal_card' || i.typeId === 'vip_card_gold');
                        return (
                            <div className={`bg-stone-900 border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-500 ${hasVipWithdrawal ? 'vip-gold-card border-yellow-500/50' : 'border-stone-800'}`}>
                                <div className={`absolute top-0 right-0 p-3 transition-all duration-700 ${hasVipWithdrawal ? 'text-yellow-500 opacity-40 animate-pulse' : 'text-stone-400 opacity-10 group-hover:opacity-20'}`}>
                                    <Coins size={48} />
                                </div>
                                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">{language === 'th' ? 'ยอดเงินคงเหลือ' : 'Total Balance'}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl lg:text-3xl font-black text-white">{formatCurrency(user?.balance || 0, { hideSymbol: true })}</span>
                                    <span className="text-xs font-bold text-yellow-500">{language === 'th' ? 'THB' : 'USD'}</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <button onClick={() => setIsDepositOpen(true)} className="flex-1 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold text-white transition-colors">
                                        {language === 'th' ? 'ฝากเงิน' : 'Deposit'}
                                    </button>
                                    <button
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${hasVipWithdrawal
                                            ? 'vip-gold-button text-white border-yellow-400'
                                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors'
                                            }`}
                                    >
                                        {hasVipWithdrawal && <CreditCard size={14} className="text-yellow-200" />}
                                        {hasVipWithdrawal && <div className="shimmer-layer" />}
                                        {language === 'th' ? 'ถอนเงิน' : 'Withdraw'}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Mining Power */}
                    {/* Mining Rate (Elite Income Style) */}
                    <div
                        className="elite-income-card rounded-xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
                    >
                        {/* Decorative background icon */}
                        <div className="absolute top-0 right-0 p-3 text-emerald-500 opacity-20 group-hover:opacity-30 transition-all duration-700">
                            <Banknote size={48} />
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-emerald-500/80 text-[10px] font-black uppercase tracking-[0.2em]">{language === 'th' ? 'รายได้พิเศษ' : 'Elite Income'}</span>
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <h3 className="text-white text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'ผลผลิตรวม' : 'Total Yield'}</h3>
                        </div>

                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl lg:text-3xl font-black text-white">
                                {formatCurrency(rigs.reduce((acc: number, r: any) => acc + calculateMiningPower(r) * (isFurnaceActive ? 2 : 1), 0), { hideSymbol: true })}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-emerald-400">{language === 'th' ? '฿' : '$'} / Day</span>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-emerald-900/30 pt-2">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-emerald-950/50 border border-emerald-800/30">
                                    <Activity size={10} className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {language === 'th' ? 'เปิดเครื่อง:' : 'Active:'} <span className="text-emerald-400">{rigs.length} {language === 'th' ? 'ยูนิต' : 'Units'}</span>
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="h-1 w-3 rounded-full bg-emerald-500/20 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-400 animate-[shimmer_2s_infinite]"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Global Energy (Furnace UI - Grand & Explosive) */}
                    <div className={`
                        relative overflow-hidden rounded-xl border-2 transition-all duration-300
                        ${isFurnaceActive
                            ? 'bg-gradient-to-br from-orange-900 via-red-900 to-stone-900 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.6)] scale-[1.02]'
                            : 'bg-stone-900 border-stone-800'
                        }
`}>
                        {/* 🔥 REACTOR FURNACE ANIMATION — เตาปฏิกรขีดจำกัด */}
                        {isFurnaceActive && (
                            <>
                                {/* พื้นหลังเรืองแสง */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-600 rounded-full blur-[50px] animate-pulse opacity-40"></div>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600 rounded-full blur-[50px] animate-pulse opacity-40 delay-75"></div>
                                <div className="absolute top-[18%] left-[29%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500 rounded-full blur-[60px] opacity-30" style={{ animation: 'reactor-core-pulse 1.5s ease-in-out infinite' }}></div>

                                {/* === เตาปฏิกร (Reactor Core Visual) === */}
                                <div className="absolute top-[18%] left-[29%] -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] z-[5]" style={{ animation: 'reactor-shake 0.3s ease-in-out infinite' }}>

                                    {/* วงแหวน 1 — วงนอก (หมุนตามเข็ม) */}
                                    <div className="absolute inset-[-8px] rounded-full border-2 border-dashed border-orange-400/60" style={{ animation: 'reactor-ring-spin 4s linear infinite, reactor-ring-glow 2s ease-in-out infinite' }}></div>

                                    {/* วงแหวน 2 — วงกลาง (หมุนทวนเข็ม) */}
                                    <div className="absolute inset-[-2px] rounded-full border-[1.5px] border-red-500/50" style={{ animation: 'reactor-ring-spin-reverse 3s linear infinite, reactor-ring-glow 1.5s ease-in-out infinite 0.5s' }}></div>

                                    {/* วงแหวน 3 — วงใน (หมุนเร็ว) */}
                                    <div className="absolute inset-[6px] rounded-full border border-yellow-400/40 border-dashed" style={{ animation: 'reactor-ring-spin 2s linear infinite' }}></div>

                                    {/* แกนกลาง (Reactor Core) */}
                                    <div className="absolute inset-[14px] rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center overflow-hidden" style={{ animation: 'reactor-core-pulse 1s ease-in-out infinite' }}>
                                        {/* แสงจ้าจากแกนกลาง */}
                                        <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-white via-yellow-200 to-orange-300 opacity-90"></div>
                                        <div className="absolute inset-[10px] rounded-full bg-white/80" style={{ animation: 'reactor-flicker 0.5s ease-in-out infinite' }}></div>

                                        {/* 🔥 ไขนส่งไอคอนไฟมาไว้ตรงกลางแกน! */}
                                        <Flame size={28} fill="currentColor" className="text-red-600 relative z-10 animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                    </div>

                                    {/* คลื่นพลังระเบิด (Shockwave) — ซ้อน 3 ชั้น */}
                                    <div className="absolute inset-[10px] rounded-full border-2 border-orange-400/60" style={{ animation: 'reactor-shockwave 2s ease-out infinite' }}></div>
                                    <div className="absolute inset-[10px] rounded-full border-2 border-yellow-300/40" style={{ animation: 'reactor-shockwave 2s ease-out infinite 0.7s' }}></div>
                                    <div className="absolute inset-[10px] rounded-full border-2 border-red-400/30" style={{ animation: 'reactor-shockwave 2s ease-out infinite 1.4s' }}></div>

                                    {/* อนุภาคพลังงานลอยขึ้น */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full" style={{ animation: 'reactor-particle-rise 1.2s ease-out infinite' }}></div>
                                    <div className="absolute top-1 left-1/4 w-1 h-1 bg-orange-400 rounded-full" style={{ animation: 'reactor-particle-rise 1.5s ease-out infinite 0.3s' }}></div>
                                    <div className="absolute top-2 right-1/4 w-1 h-1 bg-red-400 rounded-full" style={{ animation: 'reactor-particle-rise 1.8s ease-out infinite 0.6s' }}></div>
                                    <div className="absolute top-0 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full" style={{ animation: 'reactor-particle-rise 1.3s ease-out infinite 0.9s' }}></div>
                                    <div className="absolute top-1 left-1/3 w-1 h-1 bg-orange-300 rounded-full" style={{ animation: 'reactor-particle-rise 1.6s ease-out infinite 0.4s' }}></div>

                                    {/* ควันลอยขึ้น */}
                                    <div className="absolute -top-2 left-1/4 w-3 h-3 bg-orange-400/20 rounded-full blur-sm" style={{ animation: 'reactor-smoke 2.5s ease-out infinite' }}></div>
                                    <div className="absolute -top-1 right-1/3 w-2 h-2 bg-red-400/15 rounded-full blur-sm" style={{ animation: 'reactor-smoke 3s ease-out infinite 0.8s' }}></div>

                                    {/* ⚡ สายฟ้าจากแกนกลาง (4 ทิศ) */}
                                    <div className="absolute top-1/2 -left-3 w-4 h-[1px] bg-gradient-to-l from-yellow-400 to-transparent" style={{ animation: 'reactor-flicker 0.3s ease-in-out infinite' }}></div>
                                    <div className="absolute top-1/2 -right-3 w-4 h-[1px] bg-gradient-to-r from-yellow-400 to-transparent" style={{ animation: 'reactor-flicker 0.3s ease-in-out infinite 0.15s' }}></div>
                                    <div className="absolute -top-3 left-1/2 h-4 w-[1px] bg-gradient-to-t from-orange-400 to-transparent" style={{ animation: 'reactor-flicker 0.4s ease-in-out infinite 0.1s' }}></div>
                                    <div className="absolute -bottom-3 left-1/2 h-4 w-[1px] bg-gradient-to-b from-red-400 to-transparent" style={{ animation: 'reactor-flicker 0.4s ease-in-out infinite 0.25s' }}></div>
                                </div>

                                {/* แสงวาบระเบิด (Flash overlay) */}
                                <div className="absolute inset-0 bg-white/10 pointer-events-none" style={{ animation: 'reactor-flash 3s ease-in-out infinite' }}></div>

                                {/* ประกายไฟเล็กๆ กระจาย */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute bottom-0 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-[ping_1s_ease-in-out_infinite]"></div>
                                    <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-orange-300 rounded-full animate-[ping_1.5s_ease-in-out_infinite_0.5s]"></div>
                                    <div className="absolute bottom-0 left-3/4 w-1 h-1 bg-red-300 rounded-full animate-[ping_1.2s_ease-in-out_infinite_0.2s]"></div>
                                    <div className="absolute top-2 left-[10%] w-0.5 h-0.5 bg-yellow-200 rounded-full animate-[ping_0.8s_ease-in-out_infinite_0.3s]"></div>
                                    <div className="absolute top-4 right-[15%] w-0.5 h-0.5 bg-orange-200 rounded-full animate-[ping_1.1s_ease-in-out_infinite_0.7s]"></div>
                                </div>
                            </>
                        )}

                        <div className="p-3 relative z-10 flex flex-col justify-between h-full min-h-[110px]">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${isFurnaceActive ? 'text-orange-200' : 'text-stone-500'}`}>
                                                {language === 'th' ? 'เตาหลอมไฮเปอร์' : 'Hyper Furnace'}
                                            </span>
                                            {isFurnaceActive && (
                                                <div className="flex">
                                                    <span className="text-[7px] px-1.5 py-0.5 mt-0.5 rounded bg-orange-600 text-white font-bold animate-pulse uppercase">
                                                        {language === 'th' ? 'กำลังสูงสุด' : 'MAX POWER'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-sm font-bold opacity-60 ${isFurnaceActive ? 'text-orange-300' : 'text-stone-500'}`}>
                                                {!isFurnaceActive && (language === 'th' ? 'เตรียมพร้อม' : 'STANDBY')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (user?.energy <= 0) {
                                            setIsConfirmRefillOpen(true);
                                        } else {
                                            setIsFurnaceActive(!isFurnaceActive);
                                        }
                                    }}
                                    className={`
w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 flex-shrink-0
                                    ${isFurnaceActive
                                            ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.8)] hover:scale-110 active:scale-95'
                                            : 'bg-stone-800 border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-500'
                                        }
`}
                                >
                                    <Power size={20} strokeWidth={isFurnaceActive ? 3 : 2} />
                                </button>
                            </div>

                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1.5 relative z-30">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold uppercase ${isFurnaceActive ? 'text-orange-200' : 'text-stone-500'}`}>
                                            {language === 'th' ? 'ความเสถียรของแกน' : 'Core Integrity'}
                                        </span>
                                        {user?.energy < 100 && (
                                            <button
                                                onClick={() => setIsConfirmRefillOpen(true)}
                                                className="mt-1 px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-[9px] font-black rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)] hover:scale-105 active:scale-95 transition-all animate-pulse"
                                            >
                                                🔥 {language === 'th' ? 'เติมพลัง 50 ฿' : 'REFILL 50 ฿'}
                                            </button>
                                        )}
                                    </div>
                                    <span className={`text-xs font-black ${user?.energy < 20 ? 'text-red-500 animate-pulse' : (isFurnaceActive ? 'text-yellow-400' : 'text-stone-400')}`}>
                                        {Math.floor(user?.energy || 0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-stone-900/50 border border-stone-700/50 h-3 rounded-full overflow-hidden p-[1px]">
                                    <div
                                        className={`
h-full rounded-full transition-all duration-1000 relative overflow-hidden
                                            ${isFurnaceActive
                                                ? 'bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                                                : 'bg-stone-600'
                                            }
`}
                                        style={{ width: `${user?.energy || 100}%` }}
                                    >
                                        {isFurnaceActive && (
                                            <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1s_infinite] skew-x-12 transform -translate-x-full"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* พลังงานหมด — ปุ่มเติมพลัง 50 บาท */}
                        {user?.energy <= 0 && (
                            <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-2 text-center">
                                <Flame size={28} className="text-red-500 animate-bounce mb-2" />
                                <span className="text-red-500 font-bold text-xs mb-2">{language === 'th' ? '⚠️ พลังงานหมด!' : '⚠️ ENERGY DEPLETED!'}</span>
                                <button
                                    onClick={handleRefillEnergy}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold py-2 px-5 rounded-full hover:from-orange-400 hover:to-red-500 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-all"
                                >
                                    {language === 'th' ? '🔥 เติมพลัง 50 ฿' : '🔥 REFILL 50 ฿'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Market Trend (Premium Central Market Style) */}


                    {/* Market Trend (Premium Central Market Style) */}
                    {(() => {
                        const trends = marketState?.trends || {};
                        const topMatId = Object.entries(trends).reduce((top: any, [id, data]: [string, any]) => {
                            if (!top || (data.multiplier > top.multiplier)) {
                                return { id, ...data };
                            }
                            return top;
                        }, null)?.id;

                        const topMatName = topMatId ? (MATERIAL_CONFIG.NAMES[Number(topMatId)]?.[language as 'th' | 'en'] || '') : '';
                        const topMultiplier = topMatId ? trends[Number(topMatId)]?.multiplier : 1;
                        const changePercent = ((topMultiplier - 1) * 100).toFixed(1);
                        const isPositive = topMultiplier >= 1;

                        return (
                            <div
                                className="premium-market-card rounded-xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer group"
                                onClick={() => setIsMarketOpen(true)}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                                    <BarChart2 size={40} className="text-slate-400" />
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className="live-indicator">
                                                <div className="live-indicator-pulse" />
                                                <div className="live-indicator-core" />
                                            </div>
                                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{language === 'th' ? 'ตลาดซื้อขายทรัพยากร' : 'Central Market'}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-white flex items-center gap-1">
                                            {language === 'th' ? 'เช็คราคาล่าสุด' : 'Live Rates'} <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                                        </h3>
                                    </div>
                                    {topMatId && (
                                        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 backdrop-blur-sm group-hover:border-slate-500 transition-all">
                                            <MaterialIcon id={Number(topMatId)} size="w-8 h-8" iconSize={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">
                                            {topMatName || 'Analyzing...'}
                                        </span>
                                        <div className={`text-sm font-black flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {isPositive ? '+' : ''}{changePercent}%
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="h-6 w-16 bg-slate-800/30 rounded flex items-center justify-center border border-slate-700/30">
                                            <div className="flex gap-[2px] items-end h-3">
                                                {[30, 60, 45, 80, 55].map((h, i) => (
                                                    <div key={i} className={`w-1 rounded-t-full ${isPositive ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {[
                        { icon: ShoppingBag, label: t('dashboard.shop'), action: handleAddRig, color: "text-blue-400" },
                        { icon: Package, label: t('dashboard.warehouse'), action: () => setIsWarehouseOpen(true), color: "text-orange-400" },
                        { icon: CalendarCheck, label: t('dashboard.daily_bonus'), action: () => setIsDailyBonusOpen(true), color: "text-emerald-400" },
                        { icon: Ghost, label: t('dashboard.dungeon'), action: () => setIsDungeonOpen(true), color: "text-purple-400" },
                        { icon: Target, label: t('dashboard.missions'), action: () => setIsMissionOpen(true), color: "text-red-400" },
                        { icon: BookOpen, label: t('user_guide.title'), action: () => setIsUserGuideOpen(true), color: "text-amber-400" },
                        { icon: Trophy, label: t('dashboard.leaderboard_title') || "Leaderboard", action: () => setIsLeaderboardOpen(true), color: "text-amber-200" },
                        {
                            icon: Truck,
                            label: language === 'th' ? "โลจิสติกส์" : "Logistics",
                            action: () => { },
                            color: "text-stone-500",
                            isComingSoon: true
                        },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            disabled={item.isComingSoon}
                            className={`flex flex-col items-center justify-center gap-2 bg-stone-900 border border-stone-800 rounded-xl p-3 relative overflow-hidden transition-all ${item.isComingSoon ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:bg-stone-800 hover:border-stone-700'}`}
                        >
                            <item.icon size={24} className={item.color} />
                            <span className="text-[10px] font-bold text-stone-400 text-center leading-tight">{item.label}</span>
                            {item.isComingSoon && (
                                <div className="absolute top-1 right-1">
                                    <span className="bg-stone-800 text-stone-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-stone-700 uppercase tracking-tighter">
                                        Coming soon
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* AI Robot Mascot removed */}



                {/* Rigs Grid */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                            <Pickaxe size={24} className="text-yellow-500" />
                            {language === 'th' ? 'เครื่องขุดของฉัน' : 'My Mining Rigs'} ({rigs.length}/{(user?.unlockedSlots || 3)})
                        </h2>
                        {rigs.length < (user?.unlockedSlots || 3) && (
                            <button
                                onClick={handleAddRig}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-yellow-900/20"
                            >
                                <Plus size={16} />
                                {language === 'th' ? 'ซื้อเครื่องเพิ่ม' : 'Add Rig'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => {
                            const slotNumber = index + 1;
                            const rig = rigs[index];
                            const isLocked = slotNumber > (user?.unlockedSlots || 3);

                            if (rig) {
                                return (
                                    <RigCard
                                        key={rig.id}
                                        rig={rig}
                                        onClaim={(id, amount) => handleClaim(id, amount)}
                                        onClaimGift={(r) => handleClaimGift(r)}
                                        onManageAccessory={(rigId, slotIndex) => handleOpenAccessoryManager(rig, slotIndex)}
                                        onUnlockSlot={(slotIndex) => handleUnlockSlot(rig, slotIndex)}
                                        onRenew={(r) => handleRenew(r)}
                                        onRepair={(r) => handleRepair(r)}
                                        onCharge={(r) => handleChargeRigEnergy(r)}
                                        onCollect={(r) => handleCollectMaterials(r)}
                                        onScrap={(r) => handleScrap(r)}
                                        inventory={user?.inventory || []}
                                        isFurnaceActive={isFurnaceActive}
                                        botStatus={botStatus}
                                        botCooldown={botCooldownRemaining}
                                        botWorkTimeLeft={botWorkTimeRemaining}
                                        onToggleBotPause={toggleBotPause}
                                        isOverclockActive={user?.isOverclockActive && new Date(user?.overclockExpiresAt).getTime() > Date.now()}
                                        overclockMultiplier={ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 2}
                                    />
                                );
                            }

                            if (isLocked) {
                                return (
                                    <div
                                        key={`locked-${index}`}
                                        onClick={() => {
                                            setUnlockTargetSlot(slotNumber);
                                            setIsSlotUnlockOpen(true);
                                        }}
                                        className="bg-stone-900/30 border-2 border-dashed border-stone-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group hover:border-yellow-600/30 transition-all min-h-[300px]"
                                    >
                                        <div className="bg-stone-800/50 p-4 rounded-full group-hover:bg-yellow-900/20 transition-all">
                                            <Lock size={32} className="text-stone-600 group-hover:text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-stone-500 group-hover:text-yellow-500">
                                                {language === 'th' ? `พื้นที่ขุดที่ ${slotNumber}` : `Mining Slot ${slotNumber}`}
                                            </h3>
                                            <p className="text-stone-600 text-xs mt-1">
                                                {language === 'th' ? 'ต้องปลดล็อกเพื่อใช้งาน' : 'Required expansion to use'}
                                            </p>
                                        </div>
                                        <button className="mt-2 bg-stone-800 group-hover:bg-yellow-600 text-stone-400 group-hover:text-stone-900 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                                            {language === 'th' ? 'ปลดล็อก' : 'Unlock'}
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={`empty-${index}`}
                                    onClick={handleAddRig}
                                    className="bg-stone-900/50 border-2 border-dashed border-stone-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group hover:border-yellow-600/50 transition-all min-h-[300px]"
                                >
                                    <div className="bg-stone-800 p-4 rounded-full group-hover:bg-yellow-900/30 transition-all">
                                        <Plus size={32} className="text-stone-500 group-hover:text-yellow-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-stone-400 group-hover:text-white">
                                            {language === 'th' ? 'ว่าง' : 'Empty Slot'}
                                        </h3>
                                        <p className="text-stone-500 text-xs mt-1">
                                            {language === 'th' ? 'คลิกเพื่อติดตั้งเครื่องขุด' : 'Click to add a rig'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl animate-in slide-in-from-left duration-200 lg:hidden">
                        <div className="flex flex-col h-full p-6">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-2">
                                    <Pickaxe className="text-yellow-500" size={24} />
                                    <span className="font-display font-black text-xl tracking-wider text-white">GOLD RUSH</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200">
                                    <Settings size={20} />
                                    <span className="font-bold">Settings</span>
                                </button>
                                <button onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200">
                                    <History size={20} />
                                    <span className="font-bold">History</span>
                                </button>
                                <button onClick={onLogout} className="flex items-center gap-4 p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400 mt-auto">
                                    <LogOut size={20} />
                                    <span className="font-bold">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modals */}
            <LeaderboardModal
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
            />

            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                inventory={user?.inventory || []}
                onUseItem={(item) => console.log("Use item", item)}
            />

            <DailyBonusModal
                isOpen={isDailyBonusOpen}
                onClose={() => setIsDailyBonusOpen(false)}
                user={user}
                onRefresh={fetchData}
            />

            <MissionModal
                isOpen={isMissionOpen}
                onClose={() => setIsMissionOpen(false)}
                user={user}
                onClaim={(id) => { console.log('Claim mission', id); }}
            />

            <LootBoxModal
                isOpen={isLootBoxOpen}
                onClose={() => setIsLootBoxOpen(false)}
                onOpen={(boxId) => console.log("Open box", boxId)}
                user={user}
                onRefresh={fetchData}
            />

            <UserGuideModal
                isOpen={isUserGuideOpen}
                onClose={() => setIsUserGuideOpen(false)}
            />

            <DungeonModal
                isOpen={isDungeonOpen}
                onClose={() => setIsDungeonOpen(false)}
                user={user}
                rigs={rigs}
                onRefresh={fetchData}
            />

            <VIPModal
                isOpen={isVipOpen}
                onClose={() => setIsVipOpen(false)}
                user={user}
            />

            <MarketModal
                isOpen={isMarketOpen}
                onClose={() => setIsMarketOpen(false)}
                marketState={marketState}
                userMaterials={user?.materials || {}}
                onBuy={() => fetchData()}
                onSell={() => fetchData()}
                userId={user?.id}
            />

            {/* Accessory Management */}
            {
                selectedRig && isAccessoryManagerOpen && (
                    <AccessoryManagementModal
                        isOpen={isAccessoryManagerOpen}
                        onClose={() => setIsAccessoryManagerOpen(false)}
                        rig={selectedRig}
                        slotIndex={selectedSlotIndex}
                        equippedItem={selectedRig.slots[selectedSlotIndex]}
                        inventory={user?.inventory || []}
                        userId={user?.id}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        onRefresh={fetchData}
                        materials={user?.materials}
                    />
                )
            }

            {/* Slot Unlock Modals */}
            {
                isSlotUnlockOpen && unlockTargetSlot !== null && (
                    <SlotUnlockModal
                        isOpen={isSlotUnlockOpen}
                        onClose={() => setIsSlotUnlockOpen(false)}
                        targetSlot={unlockTargetSlot}
                        user={user}
                        onSuccess={fetchData}
                    />
                )
            }

            <WarehouseModal
                isOpen={isWarehouseOpen}
                onClose={() => setIsWarehouseOpen(false)}
                userId={user?.id}
                materials={user?.materials || {}}
                inventory={user?.inventory || []}
                balance={user?.balance || 0}
                marketState={marketState}
                onSell={handleSellMaterial}
                onCraft={handleCraftMaterial}
                onUpgradeEquipment={handleUpgradeEquipment}
                onScrapEquipment={handleScrapEquipment}
            />

            <LootRatesModal
                isOpen={isLootRatesOpen}
                onClose={() => setIsLootRatesOpen(false)}
            />

            <GloveRevealModal
                isOpen={isGloveRevealOpen}
                onClose={() => setIsGloveRevealOpen(false)}
                gloveName={pendingGlove?.name || ''}
                gloveRarity={pendingGlove?.rarity || 'COMMON'}
                gloveBonus={pendingGlove?.dailyBonus || 0}
            />

            <MaterialRevealModal
                isOpen={isMaterialRevealOpen}
                onClose={() => setIsMaterialRevealOpen(false)}
                materialName={pendingMaterial?.name || ''}
                materialTier={pendingMaterial?.tier || 1}
                amount={pendingMaterial?.amount || 1}
            />

            <ClaimResultModal
                isOpen={isClaimResultOpen}
                onClose={() => setIsClaimResultOpen(false)}
                amount={claimedAmount}
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title={successModalConfig.title}
                message={successModalConfig.message}
                type={successModalConfig.type}
            />

            {/* AI Help Bot */}
            <MailModal
                isOpen={isMailOpen}
                onClose={() => setIsMailOpen(false)}
                user={user}
                onClaimReward={handleClaimNotification}
                onDeleteNotification={handleDeleteNotification}
            />

            <ReferralModal
                isOpen={isReferralOpen}
                onClose={() => setIsReferralOpen(false)}
                user={user}
            />

            <DevToolsModal
                isOpen={isDevToolsOpen}
                onClose={() => setIsDevToolsOpen(false)}
                onRefresh={fetchData}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
                onLogout={onLogout}
            />

            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                userId={user?.id}
            />

            <AccessoryShopModal
                isOpen={isAccessoryShopOpen || isShopOpen}
                onClose={() => { setIsAccessoryShopOpen(false); setIsShopOpen(false); }}
                walletBalance={user?.balance || 0}
                onBuy={handleBuyAccessory}
                onBuyRig={handleConfirmBuyRig}
                onOpenRates={() => setIsLootRatesOpen(true)}
                onRefresh={fetchData}
                addNotification={(n) => setNotifications(prev => [n, ...prev])}
                userId={user?.id}
                currentRigCount={rigs.length}
                maxRigs={user?.maxRigs || 6}
                materials={user?.materials || {}}
                inventory={user?.inventory || []}
                rigs={rigs}
            />

            <WithdrawModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                walletBalance={user?.balance || 0}
                onWithdraw={handleWithdraw}
                savedQrCode={user?.bankQrCode}
                onSaveQr={(qr) => api.user.updateBankQr(qr).then(() => fetchData())}
                currentWalletAddress={user?.walletAddress}
                inventory={user?.inventory}
            />

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                user={user}
                onDepositSuccess={() => fetchData()}
            />
            <TransactionConfirmModal
                isOpen={isConfirmRefillOpen}
                onClose={() => setIsConfirmRefillOpen(false)}
                onConfirm={handleRefillEnergy}
                title={language === 'th' ? 'ยืนยันการเติมพลังงาน' : 'Confirm Energy Refill'}
                message={language === 'th' ? 'คุณต้องการเติมพลังงานเตาหลอมในราคา 50 บาท ใช่หรือไม่?' : 'Do you want to refill furnace energy for 50 THB?'}
                confirmText={language === 'th' ? 'ยืนยันการเติม' : 'Confirm Refill'}
                cancelText={language === 'th' ? 'ยกเลิก' : 'Cancel'}
                type="furnace"
            />
        </div>
    );
};

export default PlayerDashboard;
