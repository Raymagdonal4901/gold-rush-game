import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Wallet, Download, CheckCircle, ArrowRight, Package, RefreshCw, Zap, Hammer, Sparkles, AlertTriangle, Key, Cpu, ShieldCheck, Wrench, Pickaxe, ArrowUp, Info, Activity, Menu, Users, ShoppingBag, User, Mail, Settings, Coins, CreditCard, Banknote, Power, BarChart2, ChevronRight, ArrowDown, Flame, Target, Trophy, History, LogOut, Plus, Lock, CalendarCheck, Ghost, Truck, ArrowDownLeft, ArrowUpRight, Play, Pause, Bomb, Dices, Upload, Crown } from 'lucide-react';
import { api } from '../services/api';
// import { MockDB } from '../services/db'; // Not using MockDB directly for now unless needed
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../services/translations';
import { ROBOT_CONFIG, SHOP_ITEMS, MATERIAL_CONFIG, REPAIR_CONFIG, ENERGY_CONFIG, MAX_RIGS_PER_USER, RIG_PRESETS, RIG_UPGRADE_RULES, RIG_LEVEL_STYLES, LEVEL_CONFIG } from '../constants';
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
import { RigMergeModal } from './RigMergeModal';
import { InvestmentModal } from './InvestmentModal';
import { AccountLevelModal } from './AccountLevelModal';
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
import { MaterialRevealModal } from './MaterialRevealModal';
import { AutomatedBotOverlay } from './AutomatedBotOverlay';
import { ChatSystem } from './ChatSystem';
import { AIHelpBot } from './AIHelpBot';
import { MailModal } from './MailModal';
import { SettingsModal } from './SettingsModal';
import { UserGuideModal } from './UserGuideModal';
import { HistoryModal } from './HistoryModal';
import { ReferralDashboard } from './ReferralDashboard';
// import { AnnouncementModal } from './AnnouncementModal'; // Also likely missing if not in list
import { WithdrawModal } from './WithdrawModal';
import { DepositModal } from './DepositModal';
import { TransactionConfirmModal } from './TransactionConfirmModal';
import { ClaimResultModal } from './ClaimResultModal';
import { SuccessModal } from './SuccessModal';
import { ClaimCooldownModal } from './ClaimCooldownModal';
import { MinesGameModal } from './MinesGameModal';
import { LuckyDrawModal } from './LuckyDrawModal';
import { NotificationContainer } from './NotificationContainer';
import { ToastProps } from './NotificationToast';
import { OverclockCard } from './OverclockCard';
import { SalvageResultModal } from './SalvageResultModal';

interface PlayerDashboardProps {
    user: any;
    onLogout: () => void;
    onOpenWallet?: () => void;
    onOpenAdmin?: () => void;
    onBack?: () => void;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ user: propUser, onLogout, onOpenWallet, onOpenAdmin, onBack }) => {
    const { t, language, setLanguage, formatCurrency, formatBonus } = useLanguage();

    const [user, setUser] = useState<any>(propUser);

    const [rigs, setRigs] = useState<any[]>([]); // Initialize as empty array
    // const [inventory, setInventory] = useState<any[]>([]); // Use user.inventory
    const [marketState, setMarketState] = useState<any>(null);
    const [globalStats, setGlobalStats] = useState<any>(null);

    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Modals
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [isAccountLevelOpen, setIsAccountLevelOpen] = useState(false);
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
    const [isMaterialRevealOpen, setIsMaterialRevealOpen] = useState(false);
    const [isClaimResultOpen, setIsClaimResultOpen] = useState(false);
    const [isMailOpen, setIsMailOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [referralData, setReferralData] = useState<any>(null);

    // --- UNIVERSAL NAVIGATION ---
    const handleGeneralBack = () => {
        // Close modals in reverse priority
        if (isMobileMenuOpen) { setIsMobileMenuOpen(false); return; }
        if (isShopOpen) { setIsShopOpen(false); return; }
        if (isAccountLevelOpen) { setIsAccountLevelOpen(false); return; }
        if (isUpgradeOpen) { setIsUpgradeOpen(false); return; }
        if (isLeaderboardOpen) { setIsLeaderboardOpen(false); return; }
        if (isInventoryOpen) { setIsInventoryOpen(false); return; }
        if (isDailyBonusOpen) { setIsDailyBonusOpen(false); return; }
        if (isMissionOpen) { setIsMissionOpen(false); return; }
        if (isLootBoxOpen) { setIsLootBoxOpen(false); return; }
        if (isDungeonOpen) { setIsDungeonOpen(false); return; }
        if (isVipOpen) { setIsVipOpen(false); return; }
        if (isMarketOpen) { setIsMarketOpen(false); return; }
        if (isAccessoryManagerOpen) { setIsAccessoryManagerOpen(false); return; }
        if (isSlotUnlockOpen) { setIsSlotUnlockOpen(false); return; }
        if (isWarehouseOpen) { setIsWarehouseOpen(false); return; }
        if (isMaterialRevealOpen) { setIsMaterialRevealOpen(false); return; }
        if (isMailOpen) { setIsMailOpen(false); return; }
        if (isReferralOpen) { setIsReferralOpen(false); return; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isUserGuideOpen) { setIsUserGuideOpen(false); return; }
        if (isHistoryOpen) { setIsHistoryOpen(false); return; }
        if (isAccessoryShopOpen) { setIsAccessoryShopOpen(false); return; }
        if (isWithdrawOpen) { setIsWithdrawOpen(false); return; }
        if (isDepositOpen) { setIsDepositOpen(false); return; }
        if (isBotModalOpen) { setIsBotModalOpen(false); return; }
        if (isMinesOpen) { setIsMinesOpen(false); return; }
        if (isLuckyDrawOpen) { setIsLuckyDrawOpen(false); return; }
        if (isMergeModalOpen) { setIsMergeModalOpen(false); return; }

        // If no modals are open, call the standard onBack
        if (onBack) onBack();
    };
    const [isAccessoryShopOpen, setIsAccessoryShopOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isBotModalOpen, setIsBotModalOpen] = useState(false);
    const [isMinesOpen, setIsMinesOpen] = useState(false);
    const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [selectedRigForMerge, setSelectedRigForMerge] = useState<any>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // Helper to compress image before uploading to avoid server payload limit
    const compressImage = (base64Str: string, maxWidth: number = 400, maxHeight: number = 400): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG with 70% quality
            };
        });
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const rawBase64 = reader.result as string;
                try {
                    // Compress image before sending to backend
                    const compressedBase64 = await compressImage(rawBase64);

                    const res = await api.user.updateProfile({ avatarUrl: compressedBase64 });
                    if (res) {
                        setUser({ ...user, avatarUrl: compressedBase64 });
                        addNotification({
                            id: Date.now().toString(),
                            userId: user.id,
                            message: language === 'th' ? 'อัปโหลดรูปโปรไฟล์สำเร็จ' : 'Avatar updated successfully',
                            type: 'SUCCESS',
                            read: false,
                            timestamp: Date.now()
                        });
                    }
                } catch (err) {
                    console.error("Failed to update avatar", err);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const [successModalConfig, setSuccessModalConfig] = useState<{ title: string; message: string; type: 'SUCCESS' | 'KEY' | 'BATTERY' | 'ERROR' }>({
        title: '',
        message: '',
        type: 'SUCCESS'
    });
    const [isSalvageResultOpen, setIsSalvageResultOpen] = useState(false);
    const [salvageResult, setSalvageResult] = useState<any>(null);
    const [pendingMaterial, setPendingMaterial] = useState<any>(null);
    const [claimedAmount, setClaimedAmount] = useState<number>(0);
    const [isFurnaceActive, setIsFurnaceActive] = useState(false); // Default false, was hardcoded true
    const [nextCollectMs, setNextCollectMs] = useState<number | null>(null);
    const [isConfirmRefillOpen, setIsConfirmRefillOpen] = useState(false);

    // Cooldown UI
    const [isCooldownModalOpen, setIsCooldownModalOpen] = useState(false);
    const [cooldownMessage, setCooldownMessage] = useState('');
    const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number | undefined>(undefined);

    const [selectedRig, setSelectedRig] = useState<any>(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);
    const [unlockTargetSlot, setUnlockTargetSlot] = useState<number | null>(null);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [activeToasts, setActiveToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

    const addNotification = (n: any) => {
        setNotifications(prev => [n, ...prev]);

        // Trigger premium toast
        const newToast: Omit<ToastProps, 'onClose'> = {
            id: n.id || Date.now().toString(),
            title: n.title || (n.type === 'ERROR' ? (language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error') : (language === 'th' ? 'แจ้งเตือน' : 'Notification')),
            message: n.message,
            type: n.type === 'REWARD' ? 'REWARD' : (n.type === 'SUCCESS' ? 'SUCCESS' : (n.type === 'ERROR' ? 'ERROR' : 'INFO')),
        };
        setActiveToasts(prev => [...prev, newToast]);

        if (n.type === 'ERROR') {
            setSuccessModalConfig({
                title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error Occurred',
                message: n.message,
                type: 'ERROR'
            });
            setIsSuccessModalOpen(true);
        }
    };

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
    const lastAutoGiftCollectRef = useRef<Record<string, number>>({});

    // --- ROBOT STATE ---
    const [botStatus, setBotStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
    const lastBotActionRef = useRef<number>(Date.now());

    // Check if user owns the AI Robot
    // Check if user owns an ACTIVE (non-expired) AI Robot
    const hasBot = user?.inventory?.some((item: any) =>
        item.typeId === 'ai_robot' && (!item.expireAt || item.expireAt > Date.now())
    );

    // Toggle Pause
    const toggleBotPause = () => {
        if (!hasBot) return;
        setBotStatus(prev => prev === 'PAUSED' ? 'ACTIVE' : 'PAUSED');
    };

    const userRef = useRef(user);
    const rigsRef = useRef(rigs);
    const isFurnaceActiveRef = useRef(isFurnaceActive);
    const botStatusRef = useRef(botStatus);

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { rigsRef.current = rigs; }, [rigs]);
    useEffect(() => { isFurnaceActiveRef.current = isFurnaceActive; }, [isFurnaceActive]);
    useEffect(() => { botStatusRef.current = botStatus; }, [botStatus]);

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
            const [u, r, m, s, refData] = await Promise.all([
                api.getMe(),
                api.getMyRigs(),
                api.getMarketStatus(),
                api.getGlobalStats().catch(() => ({ onlineMiners: 0, totalOreMined: 0, marketVolume: 0 })), // Fallback
                api.user.getReferrals().catch(() => null)
            ]);

            if (u) {
                setUser(u);
                setNotifications(u.notifications || []);
            }
            if (r) setRigs(r);
            if (m) setMarketState(prev => JSON.stringify(prev) !== JSON.stringify(m) ? m : prev);
            if (s) setGlobalStats(s);
            if (refData) setReferralData(refData);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll every 3s
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
            const currentBotStatus = botStatusRef.current;

            // --- BOT CYCLE LOGIC ---
            const activeBot = currentUser?.inventory?.find((item: any) =>
                item.typeId === 'ai_robot' && (!item.expireAt || item.expireAt > Date.now())
            );

            if (!activeBot || currentBotStatus === 'PAUSED') {
                return; // Do nothing if not owned, expired, or paused
            }

            const now = Date.now();

            // --- 1. AUTOMATION LOGIC (AI ROBOT - ACTIVE STATE) ---
            for (const rig of currentRigs) {
                // Throttling: 30 seconds per action per rig
                const cooldown = 30000;

                // A. Auto Repair
                // Check if rig is broken (health logic is usually backend or calculated in RigCard)
                // For safety, we check if rig status is 'maintenance' or if health is 0 (if tracked)
                const isBroken = rig.status === 'maintenance' || (rig.durability !== undefined && rig.durability <= (ROBOT_CONFIG.REPAIR_THRESHOLD || 0));
                if (isBroken && (!lastAutoRepairRef.current[rig.id] || now - lastAutoRepairRef.current[rig.id] > cooldown)) {
                    lastAutoRepairRef.current[rig.id] = now;
                    handleRepair(rig);
                    continue; // One action per cycle per rig
                }

                // B. Auto Collect Materials (Mine Key)
                // If rig has materials waiting to be collected
                if (rig.currentMaterials > 0 && (!lastAutoKeyCollectRef.current[rig.id] || now - lastAutoKeyCollectRef.current[rig.id] > cooldown)) {
                    lastAutoKeyCollectRef.current[rig.id] = now;
                    handleCollectMaterials(rig, true);
                    continue;
                }

                // B2. Auto Collect 24h Gift (Mine Key)
                const preset = RIG_PRESETS.find(p => p.id === rig.tierId);
                const isOverclockActive = currentUser?.isOverclockActive && new Date(currentUser?.overclockExpiresAt).getTime() > now;
                const overclockMultiplier = ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5;
                const overclockBoost = isOverclockActive ? overclockMultiplier : ENERGY_CONFIG.BOX_DROP_SPEED_BOOST || 1.1;
                const giftIntervalMs = (1 * 24 * 60 * 60 * 1000) / overclockBoost;
                const lastGiftTimestamp = rig.lastGiftAt ? new Date(rig.lastGiftAt).getTime() : (rig.purchasedAt ? new Date(rig.purchasedAt).getTime() : now);
                const nextGiftTime = lastGiftTimestamp + giftIntervalMs;
                const isGiftAvailable = now >= nextGiftTime && !preset?.specialProperties?.noGift;

                if (isGiftAvailable && (!lastAutoGiftCollectRef.current[rig.id] || now - lastAutoGiftCollectRef.current[rig.id] > cooldown)) {
                    lastAutoGiftCollectRef.current[rig.id] = now;
                    handleClaimGift(rig, true);
                    continue;
                }

                // C. Auto Charge Energy
                const lastUpdate = rig.lastEnergyUpdate || rig.purchasedAt || now;
                const elapsedMs = now - new Date(lastUpdate).getTime();
                let drainRatePerHour = 4.166666666666667;
                if (userRef.current?.overclockExpiresAt && new Date(userRef.current.overclockExpiresAt) > new Date()) {
                    drainRatePerHour *= 2;
                }
                const elapsedHours = elapsedMs / (1000 * 60 * 60);
                const drain = elapsedHours * drainRatePerHour;
                const energyPercent = Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));

                if (energyPercent < (ROBOT_CONFIG.ENERGY_THRESHOLD || 50) && (!lastAutoRefillRef.current[rig.id] || now - lastAutoRefillRef.current[rig.id] > cooldown)) {
                    lastAutoRefillRef.current[rig.id] = now;
                    handleChargeRigEnergy(rig, true);
                    continue; // One action per cycle per rig
                }

                // D. Auto Claim Profits (Money)
                // Backend cooldown is 24h (adjusted by buffs), we check every 1h or more to be safe but silent
                const timeSinceLastClaim = now - (rig.lastClaimAt || 0);
                const minClaimInterval = 3600000; // 1 Hour

                if (timeSinceLastClaim > minClaimInterval && (!lastAutoCollectRef.current[rig.id] || now - lastAutoCollectRef.current[rig.id] > cooldown)) {
                    lastAutoCollectRef.current[rig.id] = now;
                    handleClaim(rig.id, 0, true).catch(() => { });
                    continue;
                }
            }
        };

        const interval = setInterval(checkAutomation, 1000);
        return () => clearInterval(interval);
    }, []); // Empty dependency array, using refs

    if (!user) return null;


    // Handlers
    const handleClaim = async (rigId: string, amount: number, isAuto: boolean = false) => {
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) return;

        try {
            // NOTE: Amount is calculated on server now for security. 
            // We pass 0 or client-estimate but server ignores it.

            // In api.ts, claimReward takes (rigId, amount). 
            const res = await api.claimReward(rigId, amount || 0);

            // Optimistic update from backend response (faster & safer than refetch)
            if (res.success) {
                const finalAmount = res.amount || amount;

                setUser((prev: any) => ({ ...prev, balance: res.balance }));
                setRigs((prevRigs: any[]) => prevRigs.map((r: any) =>
                    r.id === rigId ? { ...r, lastClaimAt: new Date(res.lastClaimAt).getTime() } : r
                ));

                // Show Claim Result Popup (only if not auto)
                if (!isAuto) {
                    setClaimedAmount(finalAmount);
                    setIsClaimResultOpen(true);
                }

                return { success: true, amount: finalAmount };
            } else {
                fetchData(); // Fallback if no specific data returned
                return { success: false };
            }
        } catch (err: any) {
            console.error("Claim failed", err);
            const errMsg = err?.response?.data?.message || err?.message || t('common.error');
            const errCode = err?.response?.data?.code;

            if (!isAuto) {
                if (errCode === 'CLAIM_COOLDOWN') {
                    setCooldownMessage(errMsg);
                    setCooldownRemainingMs(err?.response?.data?.remainingMs);
                    setIsCooldownModalOpen(true);
                } else {
                    alert(`${t('common.error')}: ${errMsg}`);
                }
            }
            throw err; // Re-throw for RigCard to handle
        }
    };

    const handleConfirmBuyRig = async (rigPreset: any) => {
        try {
            const res = await api.buyRig(rigPreset.name, rigPreset.price, rigPreset.dailyProfit, (rigPreset.durationMonths || 1) * 30);
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
            if (!item) return null;

            // Ensure name and specialEffect are strings for the API
            const itemName = typeof item.name === 'string' ? item.name : (item.name[language as 'th' | 'en'] || item.name.th);
            const specialEffect = item.specialEffect ? (item.specialEffect[language as 'th' | 'en'] || item.specialEffect.th) : undefined;

            const res = await api.buyAccessory({
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
            return res.item; // Return the new item data
        } catch (err: any) {
            console.error("Buy accessory failed", err);
            alert(err.response?.data?.message || "Buy accessory failed");
            throw err;
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

    const handleUpgradeRig = async (rigId: string) => {
        try {
            const res = await api.upgradeRig(rigId);
            if (res.success) {
                // Success sound or notification could go here
                fetchData();
            }
        } catch (err: any) {
            console.error("Upgrade rig failed", err);
            const errMsg = err.response?.data?.message || "Upgrade failed";
            alert(errMsg);
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

    const handleChargeRigEnergy = async (rig: any, isAuto: boolean = false) => {
        try {
            const rigId = typeof rig === 'string' ? rig : rig.id;
            const res = await api.refillRigEnergy(rigId);
            if (res.success) {
                fetchData();
                if (!isAuto) {
                    setSuccessModalConfig({
                        title: language === 'th' ? 'พลังงานเต็มแล้ว!' : 'Refill Successful!',
                        message: language === 'th' ? 'เครื่องขุดชาร์จแบตเตอรี่เต็ม 100% พร้อมทำงานต่อ!' : 'Rig battery is now 100% and ready to mine!',
                        type: 'BATTERY'
                    });
                    setIsSuccessModalOpen(true);
                } else {
                    addNotification({
                        id: Date.now().toString(),
                        title: language === 'th' ? 'AI Robot: ชาร์จพลังงานสำเร็จ' : 'AI Robot: Energy Refilled',
                        message: language === 'th' ? `เติมพลังงานสำหรับ ${rig.name?.th || 'เครื่องขุด'} เรียบร้อยแล้ว` : `Energy refilled for ${rig.name?.en || 'mining rig'}.`,
                        type: 'SUCCESS'
                    });
                }
            } else {
                if (!isAuto) {
                    alert(res.message || "Refill failed");
                } else {
                    console.warn("Auto-refill failed:", res.message);
                    if (res.message?.includes('Insufficient balance') || res.message?.includes('ยอดเงินในวอลเลทไม่เพียงพอ')) {
                        addNotification({
                            id: Date.now().toString(),
                            title: language === 'th' ? 'AI Robot: พลังงานต่ำ' : 'AI Robot: Low Energy',
                            message: language === 'th' ? 'ไม่สามารถชาร์จพลังงานได้เนื่องจากยอดเงินไม่เพียงพอ' : 'Cannot refill energy due to insufficient balance.',
                            type: 'ERROR'
                        });
                    }
                }
            }
        } catch (err: any) {
            console.error("Refill energy failed", err);
            const errMsg = err.response?.data?.message || err.message || "Refill failed";
            if (!isAuto) {
                alert(`Refill failed: ${errMsg}`);
            }
        }
    };

    const handleCollectMaterials = async (rigInput: any, isAuto: boolean = false) => {
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

                if (!isAuto) {
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
                }
            } else if (res && res.type === 'MATERIAL' && res.tier === 7) {
                // Check if it's the old Vibranium that was confused for keys, now explicitly just material
                // No special modal needed, just auto-collect or maybe show small toast?
                // Current logic just refreshes data.
            }

            fetchData();
        } catch (err: any) {
            console.error("Collect materials failed", err);
            if (!isAuto) {
                const errMsg = err.response?.data?.message || "Collect failed";
                alert(errMsg);
            }
        }
    };

    const handleScrap = async (rigInput: any) => {
        // Confirmation is handled in RigCard UI now
        try {
            const rigId = typeof rigInput === 'string' ? rigInput : rigInput.id;
            const rigName = typeof rigInput === 'string' ? 'Machine' : (typeof rigInput.name === 'object' ? (language === 'th' ? rigInput.name.th : rigInput.name.en) : rigInput.name);
            const res = await api.destroyRig(rigId);
            if (res.success) {
                setSalvageResult({
                    rewards: res.rewards || [],
                    items: res.items || [],
                    rigName: rigName
                });
                setIsSalvageResultOpen(true);
                fetchData();
            }
        } catch (err: any) {
            console.error("Scrap rig failed", err);
        }
    };

    const handleClaimGift = async (rigInput: any, isAuto: boolean = false) => {
        try {
            const rigId = typeof rigInput === 'string' ? rigInput : rigInput.id;
            const res = await api.claimRigGift(rigId);

            if (res && res.type === 'ITEM') {
                const nameTh = typeof res.name === 'object' ? res.name.th : res.name;
                const isKey = res.itemId === 'chest_key';

                if (!isAuto) {
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
                }
                fetchData();
            } else if (res && res.type === 'MATERIAL') {
                // Show specialized SuccessModal if it's a key (Legacy fallback)
                const nameTh = typeof res.name === 'object' ? res.name.th : res.name;
                // Strict check: Only treat as key if explicitly chest_key or specifically handled legacy logic
                // Vibranium (Tier 7) should NOT be a key anymore
                const isKey = nameTh.includes('กุญแจ') && res.tier !== 7;

                if (!isAuto) {
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
                }
                fetchData();
            } else {
                if (!isAuto) alert("No gift found!");
            }
        } catch (err: any) {
            console.error("Claim gift failed", err);
            if (!isAuto) {
                // alert(err.response?.data?.message || "Claim gift failed");
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    message: err.response?.data?.message || t('rig.claim_gift_failed'),
                    type: 'ERROR',
                    read: false,
                    timestamp: Date.now()
                });
            }
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
    const handleClaimNotification = async (notificationId: string) => {
        // Prevent double claim if we have local state
        const isClaimed = notifications.find(n => n.id === notificationId)?.claimed;
        if (isClaimed) return;

        try {
            const res = await api.claimNotificationReward(notificationId);
            if (res.success) {
                // Update local notification state or fetch data
                // Backend returns partial user with { balance, inventory, notifications }
                // We should merge it carefully or just rely on the notifications list update
                setUser((prev: any) => ({
                    ...prev,
                    balance: res.user.balance,
                    inventory: res.user.inventory,
                    notifications: res.user.notifications
                }));

                // Mark locally
                setNotifications(prev => prev.map(notif => notif.id === notificationId ? { ...notif, claimed: true, read: true } : notif));

                // Show success toast or modal if needed (Backend returns message)
                if (res.message) {
                    addNotification({
                        id: Date.now().toString(),
                        message: res.message,
                        type: 'SUCCESS',
                        read: true,
                        timestamp: Date.now()
                    });
                }
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
        <div className="fixed inset-0 bg-black text-white font-sans selection:bg-yellow-500/30 flex flex-col overflow-hidden">
            <nav className="flex-shrink-0 z-[100] bg-stone-950 border-b border-stone-800 h-16 sm:h-20 pt-[env(safe-area-inset-top)] shadow-2xl relative">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Logo & Mobile Menu */}
                    {/* Logo & Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleGeneralBack}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-800 bg-stone-900/50 hover:bg-stone-800 text-[10px] font-black tracking-widest text-stone-400 hover:text-yellow-500 transition-all"
                        >
                            <ArrowRight size={14} className="rotate-180" />
                            <span className="hidden sm:inline">{language === 'th' ? 'กลับ' : 'BACK'}</span>
                        </button>
                        <div className="flex items-center gap-1.5 ml-1 sm:ml-2 whitespace-nowrap flex-nowrap shrink-0">
                            <Pickaxe className="text-yellow-500 shrink-0" size={16} sm:size={20} />
                            <span className="font-display font-black text-[10px] sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 block whitespace-nowrap leading-none">
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
                                {language === 'th' ? 'รวม:' : 'Vol:'} {formatCurrency(globalStats?.marketVolume || 0)}
                            </span>
                        </div>
                    </div>

                    {/* User Profile & Actions */}
                    <div className="flex items-center gap-1">
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

                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 p-0.5 relative overflow-hidden group">
                                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center overflow-hidden relative">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <User size={20} className="text-yellow-500" />
                                    )}
                                    {/* Upload Overlay */}
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="p-1.5 text-stone-400 hover:text-white transition-colors relative"
                            onClick={() => setIsMailOpen(true)}
                        >
                            <Mail size={20} />
                            {notifications?.filter((n: any) => !n.read).length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        <button
                            className="p-1.5 text-stone-400 hover:text-white transition-colors shrink-0"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                            <button
                                onClick={onOpenAdmin}
                                className="bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                title="Admin Panel"
                            >
                                <ShieldCheck size={14} />
                                <span className="hidden lg:inline">{language === 'th' ? 'แผงควบคุม' : 'Admin'}</span>
                            </button>
                        )}
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


            {/* Main Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pt-4 pb-24 lg:pb-8 px-2 lg:px-4">
                <main className="max-w-7xl mx-auto min-h-full flex flex-col gap-4 lg:gap-6">

                    {/* Tactical 2x2 Stats Grid for Mobile/Tablet */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-2">
                        {/* 1. Balance Card (Gold Theme) */}
                        <div className="col-span-1 lg:col-span-1 card-gold-premium rounded-2xl p-3 lg:p-5 flex flex-col justify-between relative gold-neon-border min-h-[160px] lg:min-h-[200px]">
                            <div className="relative z-10">
                                <div className="flex items-center gap-1.5 mb-1 lg:mb-2 text-stone-500 font-bold text-[10px] lg:text-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span>
                                    {language === 'th' ? 'ยอดเงินคงเหลือ' : 'Wallet Balance'}
                                    <div className="ml-auto premium-gold-icon p-1.5 rounded-full border border-yellow-500/30 relative">
                                        <CreditCard size={14} className="text-stone-900 drop-shadow-sm" />
                                        <div className="absolute -top-1 -right-1">
                                            <i className="fas fa-crown text-yellow-100 text-[8px] drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1 lg:mt-2">
                                    <span className="text-xl lg:text-3xl font-black text-white tracking-tighter">
                                        {formatCurrency(user?.balance || 0, { hideSymbol: true })}
                                    </span>
                                    <span className="text-xs lg:text-sm font-bold text-yellow-500 italic">{language === 'th' ? 'THB' : 'USD'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 mb-3">
                                <button
                                    onClick={() => setIsDepositOpen(true)}
                                    className="py-2.5 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-stone-900 text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-yellow-900/30"
                                >
                                    {language === 'th' ? 'ฝากเงิน' : 'Deposit'}
                                </button>
                                {user?.inventory?.some((i: any) => i.itemId === 'vip_withdrawal_card' || i.id === 'vip_withdrawal_card' || i.typeId === 'vip_withdrawal_card') ? (
                                    <button
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className="py-2.5 vip-withdraw-btn rounded-xl text-stone-950 text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1 relative overflow-hidden group hover:scale-[1.02] duration-300"
                                    >
                                        <div className="absolute inset-0 bg-yellow-400/20 blur-xl group-hover:bg-yellow-400/40 transition-all animate-pulse"></div>
                                        <span className="relative z-10 flex items-center gap-1 drop-shadow-md text-white md:text-stone-900">
                                            <CreditCard size={14} className="drop-shadow-sm" />
                                            {language === 'th' ? 'ถอนเงิน VIP' : 'VIP Withdraw'}
                                        </span>
                                        <div className="absolute top-1 right-1">
                                            <i className="fas fa-crown text-yellow-100 text-[8px] animate-ping"></i>
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className="py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-stone-300 text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1"
                                    >
                                        <CreditCard size={12} />
                                        {language === 'th' ? 'ถอนเงิน' : 'Withdraw'}
                                    </button>
                                )}
                            </div>

                            {/* Detailed Stats Badges */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-stone-950/40 backdrop-blur-sm rounded-xl p-2 border border-stone-800/50">
                                    <span className="text-[8px] font-bold text-stone-500 uppercase block mb-0.5">{language === 'th' ? 'ขุดได้ทั้งหมด' : 'Lifetime'}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-stone-200">{formatCurrency(user?.totalLifetimeMined || 0)}</span>
                                    </div>
                                </div>
                                <div className="bg-stone-950/40 backdrop-blur-sm rounded-xl p-2 border border-stone-800/50">
                                    <span className="text-[8px] font-bold text-stone-500 uppercase block mb-0.5">{language === 'th' ? 'ถอนแล้ว' : 'Withdrawn'}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black text-stone-200">{formatCurrency(user?.totalWithdrawn || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Referral System Card - PREMIUM SILVER REDESIGN */}
                        <div
                            onClick={() => setIsReferralOpen(true)}
                            className="col-span-1 lg:col-span-1 premium-silver-card rounded-2xl p-3 lg:p-5 flex flex-col justify-between relative min-h-[160px] lg:min-h-[200px] cursor-pointer group hover:scale-[1.02] hover:border-slate-400/50 transition-all duration-300 overflow-hidden"
                        >
                            {/* Premium Background Accents */}
                            <div className="shimmer-layer opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity flex gap-2">
                                <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                                <Crown size={32} className="text-yellow-500" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-[10px] lg:text-xs font-black text-white tracking-[0.1em] uppercase mb-4 italic flex items-center gap-1.5 flex-wrap">
                                    <Zap size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
                                    <span className="whitespace-nowrap">Referral <span className="text-yellow-500">Empire</span></span>
                                </h2>

                                <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-stone-500 text-[8px] font-bold uppercase tracking-wider truncate">{language === 'th' ? 'รายได้สะสม' : 'Total Earned'}</span>
                                        <div className="flex items-center gap-0.5">
                                            <span className="text-base lg:text-2xl font-black text-white tracking-tighter">
                                                {formatCurrency(user?.referralStats?.totalEarned || 0, { hideSymbol: true })}
                                            </span>
                                            <span className="text-yellow-500 text-[10px] font-bold leading-none">฿</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-stone-500 text-[8px] font-bold uppercase tracking-wider truncate">{language === 'th' ? 'รายได้ทีม/วัน' : 'Daily Yield'}</span>
                                        <div className="flex items-center gap-0.5">
                                            <span className="text-base lg:text-2xl font-black text-yellow-500 tracking-tighter">
                                                {formatCurrency(referralData?.teamDailyIncome || 0, { hideSymbol: true })}
                                            </span>
                                            <span className="text-yellow-600 text-[10px] font-bold leading-none">฿</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Network Hierarchy Grid */}
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-1.5 flex flex-col items-center">
                                        <span className="text-[7px] font-black text-yellow-500 uppercase opacity-60">L1</span>
                                        <span className="text-xs font-black text-white">{referralData?.stats?.l1Count || 0}</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-1.5 flex flex-col items-center">
                                        <span className="text-[7px] font-black text-blue-400 uppercase opacity-60">L2</span>
                                        <span className="text-xs font-black text-white">{referralData?.stats?.l2Count || 0}</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-1.5 flex flex-col items-center">
                                        <span className="text-[7px] font-black text-purple-400 uppercase opacity-60">L3</span>
                                        <span className="text-xs font-black text-white">{referralData?.stats?.l3Count || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">
                                        {language === 'th' ? `ทีมทั้งหมด: ${referralData?.stats?.totalTeam || 0}` : `Total Team: ${referralData?.stats?.totalTeam || 0}`}
                                    </span>
                                </div>
                                <div className="flex items-center text-[10px] text-yellow-500 font-black uppercase group-hover:translate-x-1 transition-transform">
                                    {language === 'th' ? 'จัดการ' : 'Manage'} <ChevronRight size={14} className="text-yellow-500" />
                                </div>
                            </div>
                        </div>

                        {/* 3. New Overclock Card */}
                        <OverclockCard
                            user={user}
                            language={language}
                            onActivate={() => setIsConfirmRefillOpen(true)}
                            formatCountdown={formatCountdown}
                            formatCurrency={formatCurrency}
                        />

                        {/* 4. Market Trends Card (Slate Theme) */}
                        <div
                            onClick={() => setIsMarketOpen(true)}
                            className="col-span-1 lg:col-span-1 card-slate-market rounded-2xl p-3 lg:p-5 flex flex-col justify-between relative min-h-[160px] lg:min-h-[200px] cursor-pointer group hover:border-blue-500/50 transition-all duration-300"
                        >
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
                                    <>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-1.5 mb-2 lg:mb-4">
                                                <div className="live-indicator">
                                                    <div className="live-indicator-pulse" />
                                                    <div className="live-indicator-core" />
                                                </div>
                                                <span className="text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-widest">{language === 'th' ? 'ตลาดซื้อขายทรัพยากร' : 'Economy Hub'}</span>
                                            </div>
                                            <h3 className="text-base lg:text-xl font-black text-white leading-tight">
                                                {language === 'th' ? 'เช็คราคาล่าสุด' : 'Live Analytics'}
                                            </h3>
                                        </div>

                                        <div className="mt-4 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">
                                                        {topMatName || 'Processing...'}
                                                    </span>
                                                    <div className={`text-sm lg:text-lg font-black flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                        {changePercent}%
                                                    </div>
                                                </div>
                                                {topMatId && (
                                                    <div className="bg-slate-800/50 p-1.5 rounded-xl border border-blue-500/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                                        <MaterialIcon id={Number(topMatId)} size="w-8 h-8 lg:w-10 lg:h-10" iconSize={24} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto h-8 lg:h-10 w-full bg-blue-900/20 rounded-lg flex items-center border border-blue-500/20 overflow-hidden market-ticker-container">
                                            <div className="market-ticker-content flex items-center h-full">
                                                {/* Repeat for seamless loop */}
                                                {(() => {
                                                    const pricedMaterials = [1, 2, 3, 4, 5, 6, 7];
                                                    const items = [...pricedMaterials, ...pricedMaterials, ...pricedMaterials, ...pricedMaterials];
                                                    return items.map((matId, idx) => {
                                                        const trend = trends[matId] || { multiplier: 1 };
                                                        const change = ((trend.multiplier - 1) * 100).toFixed(1);
                                                        const isUp = trend.multiplier >= 1;
                                                        const name = MATERIAL_CONFIG.NAMES[matId]?.[language as 'th' | 'en'] || '';

                                                        return (
                                                            <div key={idx} className="market-ticker-item flex items-center gap-2 px-4 border-r border-blue-500/10">
                                                                <MaterialIcon id={matId} size="w-5 h-5" iconSize={14} />
                                                                <div className="flex flex-col leading-none">
                                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{name}</span>
                                                                    <span className={`text-[10px] font-black flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                        {isUp ? '▲' : '▼'}{Math.abs(Number(change))}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>


                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 lg:gap-2 mb-4 lg:mb-6">
                        {[
                            { icon: ShoppingBag, label: t('dashboard.shop'), action: handleAddRig, color: "text-blue-200" },
                            { icon: Package, label: t('dashboard.warehouse'), action: () => setIsWarehouseOpen(true), color: "text-orange-400" },
                            { icon: CalendarCheck, label: t('dashboard.daily_bonus'), action: () => setIsDailyBonusOpen(true), color: "text-emerald-400" },
                            { icon: Ghost, label: t('dashboard.dungeon'), action: () => setIsDungeonOpen(true), color: "text-purple-400" },
                            { icon: Target, label: t('dashboard.missions'), action: () => setIsMissionOpen(true), color: "text-red-400" },
                            { icon: BookOpen, label: t('user_guide.title'), action: () => setIsUserGuideOpen(true), color: "text-amber-400" },
                            { icon: Bomb, label: t('mines.title') || "Mines", action: () => setIsMinesOpen(true), color: "text-red-500" },
                            { icon: Dices, label: t('lucky_draw.title') || "Lucky Draw", action: () => setIsLuckyDrawOpen(true), color: "text-purple-400" },
                            { icon: CreditCard, label: language === 'th' ? 'ประวัติธุรกรรม' : 'Transaction History', action: () => onOpenWallet(), color: "text-yellow-500" },
                            { icon: Trophy, label: t('dashboard.leaderboard_title') || "Leaderboard", action: () => setIsLeaderboardOpen(true), color: "text-amber-200" },
                            { icon: Truck, label: t('dashboard.logistics') || "Logistics", action: () => { }, color: "text-purple-400", comingSoon: true },
                        ].map((item: any, idx) => (
                            <button
                                key={idx}
                                onClick={item.comingSoon ? undefined : item.action}
                                className={`flex flex-col items-center justify-center gap-1 lg:gap-2 bg-stone-900 border border-stone-800 rounded-xl p-2 lg:p-3 relative overflow-hidden transition-all ${item.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:bg-stone-800 hover:border-stone-700 active:scale-95'}`}
                            >
                                <item.icon size={24} className={item.color} />
                                <span className="text-[10px] font-bold text-stone-400 text-center leading-tight">{item.label}</span>
                                {item.comingSoon && (
                                    <div className="absolute top-0 right-0 bg-stone-800 text-stone-500 text-[6px] font-black px-1.5 py-0.5 rounded-bl border-b border-l border-stone-700 uppercase tracking-tighter">
                                        {t('common.coming_soon')}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* AI Mascot (Permanent Center Position - Inline Controls) */}
                    {hasBot && (
                        <div className="my-6 flex flex-col items-center justify-center gap-4 group transition-all duration-300">
                            <div
                                className="relative cursor-pointer active:scale-95 transition-transform"
                                onClick={toggleBotPause}
                            >
                                <div className="absolute inset-0 bg-blue-500/15 blur-[30px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700"></div>

                                {/* Compact AI Bot Visuals */}
                                <div className={`relative transform scale-75 lg:scale-95 transition-transform duration-500 group-hover:scale-105 ${botStatus === 'PAUSED' ? 'ai-robot-sleeping' : ''}`}>
                                    <div className={`w-24 h-16 bg-stone-900 border-2 rounded-2xl relative shadow-[0_0_20px_rgba(59,130,246,0.2)] overflow-hidden transition-colors ${botStatus === 'ACTIVE' ? 'border-blue-500/50' : 'border-stone-700 grayscale'}`}>
                                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
                                        {/* Eyes */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-3">
                                            {botStatus === 'ACTIVE' ? (
                                                <>
                                                    <div className="w-4 h-6 rounded-full bg-blue-400/80 shadow-[0_0_8px_#60a5fa] ai-robot-eye ai-robot-pupil"></div>
                                                    <div className="w-4 h-6 rounded-full bg-blue-400/80 shadow-[0_0_8px_#60a5fa] ai-robot-eye-left ai-robot-pupil"></div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-5 h-1.5 bg-stone-600 rounded-full ai-robot-eyes-closed shadow-[0_0_4px_rgba(255,255,255,0.2)] opacity-50"></div>
                                                    <div className="w-5 h-1.5 bg-stone-600 rounded-full ai-robot-eyes-closed shadow-[0_0_4px_rgba(255,255,255,0.2)] opacity-50"></div>
                                                </>
                                            )}
                                        </div>

                                        {/* Status Lights */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-stone-700"></div>
                                            <div className={`w-1.5 h-1.5 rounded-full ${botStatus === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-stone-700'}`}></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-stone-700"></div>
                                        </div>
                                    </div>
                                    {/* Antenna */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                        <div className="w-[2px] h-4 bg-stone-700"></div>
                                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_#3b82f6] ${botStatus === 'ACTIVE' ? 'bg-blue-500 animate-pulse' : 'bg-stone-500'}`}></div>
                                    </div>
                                    {/* Ears/Side Plates */}
                                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-8 bg-stone-800 border-l border-blue-500/20 rounded-l-lg"></div>
                                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-8 bg-stone-800 border-r border-blue-500/20 rounded-r-lg"></div>

                                    {/* Working Indicator */}
                                    {botStatus === 'WORKING' && (
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-stone-950 shadow-[0_0_10px_#10b981] animate-bounce"></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <div className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform" onClick={toggleBotPause}>
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">
                                        {language === 'th' ? 'หุ่นยนต์ AI ควบคุมระบบ' : 'AI System Control'}
                                    </span>
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${botStatus === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                        <div className={`w-1 h-1 rounded-full ${botStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className={`text-[8px] font-black uppercase tracking-wider ${botStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {botStatus === 'ACTIVE'
                                                ? (language === 'th' ? 'กำลังทำงาน' : 'Active')
                                                : (language === 'th' ? 'หยุดทำงาน' : 'Paused')}
                                        </span>
                                    </div>
                                </div>

                                {/* Inline Status Badges */}
                                <div className="flex flex-col gap-2 scale-90">

                                    {/* Expiration Timer */}
                                    <div className="flex items-center gap-2 bg-stone-900/50 border border-red-500/30 rounded-full px-4 py-1.5 shadow-lg shadow-red-950/20 backdrop-blur-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></div>
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter mr-2">
                                            {language === 'th' ? 'จะหมดอายุใน:' : 'Expires In:'}
                                        </span>
                                        <span className="text-[11px] font-mono font-black text-white tracking-widest">
                                            {(() => {
                                                const botItem = user?.inventory?.find((i: any) => i.typeId === 'ai_robot' && (!i.expireAt || i.expireAt > Date.now()));
                                                if (!botItem || !botItem.expireAt) return language === 'th' ? 'ไม่มีกำหนด' : 'No Expiry';

                                                const timeLeft = botItem.expireAt - Date.now();
                                                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                                                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                                                if (days > 0) {
                                                    return `${days} ${language === 'th' ? 'วัน' : 'Days'} ${hours} ${language === 'th' ? 'ชม.' : 'Hrs'}`;
                                                }

                                                const m = Math.floor((timeLeft % 3600000) / 60000);
                                                const s = Math.floor((timeLeft % 60000) / 1000);
                                                return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rigs Grid */}
                    <div className="flex-1 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                <Pickaxe size={24} className="text-yellow-500" />
                                {language === 'th' ? 'เครื่องขุดของฉัน' : 'My Mining Rigs'} ({rigs.length}/{(user?.warehouseCapacity || user?.unlockedSlots || 3)})
                            </h2>
                            {rigs.length < (user?.warehouseCapacity || user?.unlockedSlots || 3) && (
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
                            {Array.from({ length: MAX_RIGS_PER_USER }).map((_, index) => {
                                const slotNumber = index + 1;
                                const rig = rigs[index];
                                const isLocked = slotNumber > (user?.warehouseCapacity || user?.unlockedSlots || 3);

                                if (rig) {
                                    return (
                                        <RigCard
                                            key={rig.id}
                                            rig={rig}
                                            availableRigs={rigs} // Pass all rigs for merge selection
                                            onOpenMerge={(r) => {
                                                setSelectedRigForMerge(r);
                                                setIsMergeModalOpen(true);
                                            }}
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
                                            botStatus={botStatus === 'ACTIVE' ? 'WORKING' : 'PAUSED'}
                                            botCooldown={0}
                                            botWorkTimeLeft={0}
                                            onToggleBotPause={toggleBotPause}
                                            isOverclockActive={user?.isOverclockActive && new Date(user?.overclockExpiresAt).getTime() > Date.now()}
                                            overclockMultiplier={ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5}
                                            addNotification={addNotification}
                                            onUpgrade={handleUpgradeRig}
                                            user={user}
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

                </main >
            </div>
            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl animate-in slide-in-from-left duration-200">
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
                                <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:bg-stone-800 transition-colors">
                                    <Settings size={20} className="text-yellow-500" />
                                    <div className="text-left">
                                        <p className="font-bold text-sm tracking-widest uppercase">{t('settings.title') || 'Settings'}</p>
                                        <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Security & Profile</p>
                                    </div>
                                </button>
                                <button onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:bg-stone-800 transition-colors">
                                    <History size={20} className="text-blue-500" />
                                    <div className="text-left">
                                        <p className="font-bold text-sm tracking-widest uppercase">{language === 'th' ? 'ประวัติ' : 'History'}</p>
                                        <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Activity Logs</p>
                                    </div>
                                </button>
                                <button onClick={() => { setIsUserGuideOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:bg-stone-800 transition-colors">
                                    <BookOpen size={20} className="text-emerald-500" />
                                    <div className="text-left">
                                        <p className="font-bold text-sm tracking-widest uppercase">{t('user_guide.title') || 'Guide'}</p>
                                        <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">How to play</p>
                                    </div>
                                </button>
                                <button onClick={onLogout} className="flex items-center gap-4 p-4 rounded-xl bg-red-900/10 border border-red-900/40 text-red-500 mt-auto hover:bg-red-900/20 transition-colors">
                                    <LogOut size={20} />
                                    <span className="font-bold uppercase tracking-widest">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modals */}
            <AccountLevelModal
                isOpen={isAccountLevelOpen}
                onClose={() => setIsAccountLevelOpen(false)}
                user={user}
                onSuccess={() => {
                    fetchData();
                    setIsAccountLevelOpen(false);
                }}
            />

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
                addNotification={addNotification}
            />

            <MissionModal
                isOpen={isMissionOpen}
                onClose={() => setIsMissionOpen(false)}
                user={user}
                onClaim={(id) => { console.log('Claim mission', id); }}
                addNotification={addNotification}
            />

            <LootBoxModal
                isOpen={isLootBoxOpen}
                onClose={() => setIsLootBoxOpen(false)}
                onOpen={(boxId) => console.log("Open box", boxId)}
                user={user}
                onRefresh={fetchData}
                addNotification={addNotification}
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
                addNotification={addNotification}
            />

            <VIPModal
                isOpen={isVipOpen}
                onClose={() => setIsVipOpen(false)}
                user={user}
            />

            <MarketModal
                isOpen={isMarketOpen}
                onClose={() => setIsMarketOpen(false)}
                userId={user?.id}
                onSuccess={fetchData}
                addNotification={addNotification}
            />

            {/* Accessory Management */}
            {
                selectedRig && isAccessoryManagerOpen && (
                    <AccessoryManagementModal
                        isOpen={isAccessoryManagerOpen}
                        onClose={() => setIsAccessoryManagerOpen(false)}
                        rig={selectedRig}
                        slotIndex={selectedSlotIndex}
                        equippedItem={(() => {
                            const itemId = selectedRig.slots[selectedSlotIndex];
                            return user?.inventory?.find((i: any) => i.id === itemId);
                        })()}
                        inventory={user?.inventory || []}
                        userId={user?.id}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        onRefresh={fetchData}
                        materials={user?.materials}
                        equippedItemIds={rigs.flatMap(r => r.slots || []).filter(id => id !== null) as string[]}
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
                addNotification={addNotification}
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

            <ClaimCooldownModal
                isOpen={isCooldownModalOpen}
                onClose={() => setIsCooldownModalOpen(false)}
                message={cooldownMessage}
                remainingMs={cooldownRemainingMs}
            />

            {/* AI Help Bot */}
            <MailModal
                isOpen={isMailOpen}
                onClose={() => setIsMailOpen(false)}
                user={user}
                onClaimReward={handleClaimNotification}
                onDeleteNotification={handleDeleteNotification}
            />

            <ReferralDashboard
                isOpen={isReferralOpen}
                onClose={() => setIsReferralOpen(false)}
                user={user}
            />

            {/*
            <DevToolsModal
                isOpen={isDevToolsOpen}
                onClose={() => setIsDevToolsOpen(false)}
                onRefresh={fetchData}
            />
            */}

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
                onRefresh={fetchData}
                addNotification={addNotification}
                userId={user?.id}
                currentRigCount={rigs.length}
                maxRigs={user?.maxRigs || 3}
                materials={user?.materials || {}}
                inventory={user?.inventory || []}
                rigs={rigs}
                purchasedRigIds={user?.purchasedRigIds || []}
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
                addNotification={addNotification}
            />

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                user={user}
                onDepositSuccess={() => fetchData()}
                addNotification={addNotification}
            />
            <TransactionConfirmModal
                isOpen={isConfirmRefillOpen}
                onClose={() => setIsConfirmRefillOpen(false)}
                onConfirm={handleRefillEnergy}
                title={language === 'th' ? 'ยืนยันการ Overclock' : 'Confirm Overclock'}
                message={language === 'th' ? `คุณต้องการจ่าย ${formatCurrency(50)} เพื่อเปิดระบบ Overclock เป็นเวลา 24 ชั่วโมง? (เพิ่มรายได้ 1.5x, เพิ่มโอกาส Jackpot +2%, แต่เครื่องขุดเสียหายเร็วขึ้น 2x)` : `Do you want to pay ${formatCurrency(50)} to Overclock for 24 hours? (1.5x Yield, +2% Jackpot, but 2x faster Durability Decay)`}
                confirmText={language === 'th' ? 'ยืนยันการ Overclock' : 'Confirm Overclock'}
                cancelText={language === 'th' ? 'ยกเลิก' : 'Cancel'}
                user={user}
            />

            <MinesGameModal
                isOpen={isMinesOpen}
                onClose={() => setIsMinesOpen(false)}
                user={user}
                onRefresh={fetchData}
            />

            <LuckyDrawModal
                isOpen={isLuckyDrawOpen}
                onClose={() => setIsLuckyDrawOpen(false)}
                user={user}
                onRefresh={fetchData}
                addNotification={addNotification}
            />

            {selectedRigForMerge && (
                <RigMergeModal
                    isOpen={isMergeModalOpen}
                    onClose={() => setIsMergeModalOpen(false)}
                    baseRig={selectedRigForMerge}
                    availableRigs={rigs}
                    onMergeSuccess={(newRig) => {
                        fetchData();
                        setIsMergeModalOpen(false);
                    }}
                />
            )}

            <SalvageResultModal
                isOpen={isSalvageResultOpen}
                onClose={() => setIsSalvageResultOpen(false)}
                data={salvageResult}
            />

            <NotificationContainer
                notifications={activeToasts}
                onClose={(id) => setActiveToasts(prev => prev.filter(t => t.id !== id))}
            />
        </div >
    );
};

export default PlayerDashboard;
