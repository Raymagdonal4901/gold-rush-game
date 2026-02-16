import React, { useEffect, useState, useRef } from 'react';
import { RigLootModal } from './RigLootModal';
import { RigMergeModal } from './RigMergeModal';
import { OilRig, AccessoryItem } from '../services/types';
import { OilRigAnimation } from './OilRigAnimation';
import { BASE_CLAIM_AMOUNT, CURRENCY, RARITY_SETTINGS, GIFT_CYCLE_DAYS, RENEWAL_CONFIG, REPAIR_CONFIG, MATERIAL_CONFIG, RIG_PRESETS, MAX_SLOTS_PER_RIG, DEMO_SPEED_MULTIPLIER, EQUIPMENT_SERIES, ENERGY_CONFIG, RIG_LOOT_TABLES, SHOP_ITEMS, MINING_VOLATILITY_CONFIG } from '../constants';
import { Pickaxe, Clock, Coins, Sparkles, Zap, Timer, Crown, Hexagon, Check, X, Gift, Briefcase, RefreshCw, AlertTriangle, Wrench, Hammer, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, ShoppingBag, BoxSelect, Info, Lock, Key, ArrowDownToLine, ZapOff, CheckCircle2, CalendarClock, Eye, Truck, Plus, Cpu, Trash2, Skull, Package, Factory, Search, Flame, Home, Fan, Wifi, Server, Grid, HardDrive, Calculator, Star, Settings, TrainFront, Clover } from 'lucide-react';
import { MaterialIcon } from './MaterialIcon';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { AutomatedBotOverlay } from './AutomatedBotOverlay';

interface RigCardProps {
    rig: OilRig;
    availableRigs?: OilRig[];
    onMerge?: (newRig: OilRig) => void;
    accessoryBonus?: number;
    durationBonusDays?: number;
    inventory?: AccessoryItem[];
    botStatus?: 'WORKING' | 'COOLDOWN' | 'PAUSED';
    botCooldown?: number;
    botWorkTimeLeft?: number;
    userLastClaimedAt?: string | number | Date;
    onToggleBotPause?: () => void;
    onClaim: (id: string, amount: number) => Promise<any> | void;
    onClaimGift: (id: string) => void;
    onRenew?: (rig: any) => void;
    onRepair?: (id: string) => void;
    onCollect?: (id: string) => void;
    onMaterialUpdate?: (id: string, count: number) => void;
    onScrap?: (rig: any) => void;
    onEquipSlot?: (rigId: string, slotIndex: number) => void;
    onUnequipSlot?: (rigId: string, slotIndex: number) => void;
    onManageAccessory?: (rigId: string, slotIndex: number) => void;
    onCharge?: (id: string) => void;
    globalMultiplier?: number;
    reactorMultiplier?: number;
    isPowered?: boolean;
    isExploring?: boolean;
    isOverclockActive?: boolean;
    overclockMultiplier?: number;
    isFurnaceActive?: boolean;
    isDemo?: boolean;
    addNotification?: (n: any) => void;
}

export const RigCard: React.FC<RigCardProps> = ({
    rig,
    availableRigs = [],
    onMerge,
    durationBonusDays = 0,
    inventory = [],
    onClaim,
    onClaimGift,
    onRenew,
    onRepair,
    onCollect,
    onMaterialUpdate,
    onScrap,
    onEquipSlot,
    onUnequipSlot,
    onManageAccessory,
    onCharge,
    globalMultiplier = 1,
    reactorMultiplier = 1,
    isPowered = true,
    isExploring = false,
    isOverclockActive = false,
    overclockMultiplier = 1,
    isFurnaceActive = false,
    isDemo = false,
    addNotification,
    botStatus,
    botCooldown,
    botWorkTimeLeft,
    userLastClaimedAt,
    onToggleBotPause
}) => {
    const { t, language, getLocalized, formatCurrency, formatBonus } = useTranslation();
    const handleDestroyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isExploring) return;
        if (!window.confirm(t('rig.destroy_confirm'))) return;

        try {
            const result = await api.destroyRig(rig.id);
            if (result.success) {
                if (addNotification) addNotification({ id: Date.now().toString(), userId: rig.ownerId || '', message: t('rig.destroy_success'), type: 'SUCCESS', read: false, timestamp: Date.now() });
                if (onRenew) onRenew(rig.id);
            }
        } catch (e: any) {
            console.error('[DESTROY_RIG] Error:', e);
            if (addNotification) addNotification({ id: Date.now().toString(), userId: rig.ownerId || '', message: e.response?.data?.message || t('common.error'), type: 'ERROR', read: false, timestamp: Date.now() });
        }
    };
    const [currentAmount, setCurrentAmount] = useState(BASE_CLAIM_AMOUNT);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [currentMaterials, setCurrentMaterials] = useState(rig.currentMaterials || 0);
    const [pendingMaterial, setPendingMaterial] = useState<{ name: any; tier: number; amount: number } | null>(null);
    const [globalCooldownSeconds, setGlobalCooldownSeconds] = useState(0);

    // --- GLOBAL CLAIM COOLDOWN LOGIC (24H) ---
    useEffect(() => {
        if (!userLastClaimedAt) {
            setGlobalCooldownSeconds(0);
            return;
        }

        const COOLDOWN_MS = 24 * 60 * 60 * 1000;
        const updateCooldown = () => {
            const lastClaimTime = new Date(userLastClaimedAt).getTime();
            const now = Date.now();
            const elapsed = now - lastClaimTime;
            const remaining = Math.max(0, COOLDOWN_MS - elapsed);
            setGlobalCooldownSeconds(Math.floor(remaining / 1000));
        };

        updateCooldown();
        const interval = setInterval(updateCooldown, 1000);
        return () => clearInterval(interval);
    }, [userLastClaimedAt]);

    const formatGlobalCooldown = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };
    const [currentEnergyPercent, setCurrentEnergyPercent] = useState(rig.energy ?? 100);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [isRenewConfirming, setIsRenewConfirming] = useState(false);
    const [isRepairConfirming, setIsRepairConfirming] = useState(false);
    const [isScrapConfirming, setIsScrapConfirming] = useState(false);
    const [isChargeConfirming, setIsChargeConfirming] = useState(false);
    const [isJustCharged, setIsJustCharged] = useState(false);
    const [isLootModalOpen, setIsLootModalOpen] = useState(false);

    const [isRepairing, setIsRepairing] = useState(false);
    const [showRestored, setShowRestored] = useState(false);
    const [showRenewed, setShowRenewed] = useState(false);
    const lastChargedAtRef = useRef<number>(0);

    const lastUpdateRef = useRef<number>(Date.now());
    const requestRef = useRef<number | null>(null);
    const materialIntervalRef = useRef<number | null>(null);

    const [displayAmount, setDisplayAmount] = useState<string | number>('???');
    const [isIdleRolling, setIsIdleRolling] = useState(false);

    const nameStr = typeof rig.name === 'string' ? rig.name : (rig.name?.en || rig.name?.th || '');
    const preset = RIG_PRESETS.find(p =>
        (p.name.en && p.name.en === nameStr) ||
        (p.name.th && p.name.th === nameStr)
    ) || RIG_PRESETS.find(p => p.price === rig.investment && rig.investment > 0);

    const rarityKey = (preset?.type?.toUpperCase() || rig.rarity || 'COMMON') as keyof typeof RARITY_SETTINGS;
    const rarityConfig = RARITY_SETTINGS[rarityKey] || RARITY_SETTINGS['COMMON'];

    const safeNumber = (val: any) => {
        const n = Number(val);
        return isNaN(n) ? 0 : n;
    };

    let equippedBonus = 0;
    const equippedItems = (rig.slots || Array(MAX_SLOTS_PER_RIG).fill(null)).map(itemId => {
        if (!itemId) return null;
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            const effectiveItemBonus = (item.dailyBonus < 0.5 && item.dailyBonus > 0) ? item.dailyBonus * 35 : item.dailyBonus;
            equippedBonus += effectiveItemBonus;
        }
        return item;
    });

    const isNoBonusRig = [t('rig.rusty_shovel'), t('rig.portable_drill'), 'Rusty Shovel', 'Portable Drill'].includes(nameStr);
    const effectiveBonusProfit = isNoBonusRig ? 0 : safeNumber(rig.bonusProfit);

    const rawProfit = safeNumber(rig.dailyProfit) || safeNumber(preset?.dailyProfit);
    const baseDailyProfit = (rawProfit < 5 && rawProfit > 0) ? rawProfit * 35 : rawProfit;

    let totalDailyProfit = safeNumber(baseDailyProfit + effectiveBonusProfit + equippedBonus) * safeNumber(globalMultiplier) * safeNumber(reactorMultiplier);

    if (isOverclockActive) {
        totalDailyProfit *= overclockMultiplier;
    }
    if (isFurnaceActive) {
        totalDailyProfit *= 2;
    }

    const totalRatePerSecond = totalDailyProfit / 86400;

    const volConfig = MINING_VOLATILITY_CONFIG[preset?.id || 1];
    const hashrateText = volConfig ? `${volConfig.hashrateMin} - ${volConfig.hashrateMax} MH/s` : '??? MH/s';
    const stabilityStars = volConfig?.stabilityStars || 0;
    const stabilityLabel = volConfig?.stabilityLabel || '';

    const tier = (investment: number) => {
        if (investment === 0) return 7;
        if (investment >= 3000) return 5;
        if (investment >= 2500) return 4;
        if (investment >= 2000) return 3;
        if (investment >= 1500) return 2;
        return 1;
    };
    const currentTier = tier(rig.investment);

    const getAccessoryIcon = (item: AccessoryItem, className: string) => {
        const getNeonIcon = (typeId: string) => {
            if (!typeId) return <Briefcase className={className} />;
            if (typeId.startsWith('hat')) return <HardHat className={`${className} text-yellow-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]`} />;
            if (typeId.startsWith('glasses')) return <Glasses className={`${className} text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]`} />;
            if (typeId.startsWith('uniform') || typeId.startsWith('shirt')) return <Shirt className={`${className} text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]`} />;
            if (typeId.startsWith('bag')) return <Backpack className={`${className} text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]`} />;
            if (typeId.startsWith('boots')) return <Footprints className={`${className} text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]`} />;
            if (typeId.startsWith('mobile')) return <Smartphone className={`${className} text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]`} />;
            if (typeId.startsWith('pc')) return <Monitor className={`${className} text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]`} />;
            if (typeId === 'auto_excavator') return <Truck className={`${className} text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]`} />;
            if (typeId === 'upgrade_chip') return <Cpu className={`${className} text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]`} />;
            if (typeId === 'chest_key') return <Key className={`${className} text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]`} />;

            if (typeId.startsWith('repair_kit')) {
                let glowColor = 'bg-emerald-500';
                let IconComp = Wrench;
                if (typeId === 'repair_kit_1') { glowColor = 'bg-emerald-500'; IconComp = Hammer; }
                else if (typeId === 'repair_kit_2') { glowColor = 'bg-purple-500'; IconComp = Briefcase; }
                else if (typeId === 'repair_kit_3') { glowColor = 'bg-yellow-500'; IconComp = Cpu; }
                else if (typeId === 'repair_kit_4') { glowColor = 'bg-red-600'; IconComp = Settings; }
                return (
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute inset-0 ${glowColor} rounded-full scale-125 blur-md opacity-20 animate-pulse`}></div>
                        <IconComp className={`${className} relative z-10`} />
                    </div>
                );
            }
            return <Briefcase className={className} />;
        };
        return getNeonIcon(item.typeId || '');
    };

    const isInfiniteDurability = preset?.specialProperties?.infiniteDurability;
    const isZeroEnergy = preset?.specialProperties?.zeroEnergy;

    const durationDaysTotal = rig.durationDays || (rig.durationMonths ? rig.durationMonths * 30 : 0) || (preset?.durationDays || (preset?.durationMonths || 0) * 30);
    const baseDurationMs = (durationDaysTotal * 24 * 60 * 60 * 1000);
    const isInfiniteContract = (rig.durationMonths >= 900) || (preset?.specialProperties?.infiniteDurability === true);

    const now = Date.now();
    const bonusDurationMs = (safeNumber(rig.renewalCount)) * (RENEWAL_CONFIG.WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const expiryTime = safeNumber(rig.expiresAt) + bonusDurationMs;
    const timeLeftMs = Math.max(0, expiryTime - now);
    const isExpired = !isInfiniteContract && timeLeftMs <= 0;

    const durabilityMs = (REPAIR_CONFIG.DURABILITY_DAYS * 24 * 60 * 60 * 1000);
    const timeSinceRepair = now - (safeNumber(rig.lastRepairAt) || safeNumber(rig.purchasedAt) || now);
    const healthPercent = (isInfiniteContract || isInfiniteDurability) ? 100 : Math.max(0, 100 * (1 - timeSinceRepair / durabilityMs));
    const isBroken = healthPercent <= 0;

    let baseRepairCost = isInfiniteDurability ? 0 : (safeNumber(rig.repairCost) || (preset ? safeNumber(preset.repairCost) : Math.floor(safeNumber(rig.investment) * 0.06)));
    if (baseRepairCost > 0 && baseRepairCost < 1) baseRepairCost *= 35;

    let energyCostPerDay = safeNumber(rig.energyCostPerDay) || (preset ? safeNumber(preset.energyCostPerDay) : 0);
    if (energyCostPerDay > 0 && energyCostPerDay < 1) energyCostPerDay *= 35;

    const hasSilverBuff = false; // Mock
    let discountMultiplier = 0;
    if (hasSilverBuff) discountMultiplier += 0.05;

    const hatId = (rig.slots || []).find(id => {
        if (!id) return false;
        const item = inventory.find(i => i.id === id);
        return item && (item.typeId === 'hat' || item.typeId.startsWith('hat'));
    });
    let hatDiscountPercent = 0;
    if (hatId) {
        const item = inventory.find(i => i.id === hatId);
        if (item) {
            if (item.rarity === 'COMMON') hatDiscountPercent = 0.05;
            else if (item.rarity === 'RARE') hatDiscountPercent = 0.10;
            else if (item.rarity === 'EPIC') hatDiscountPercent = 0.15;
            else if (item.rarity === 'LEGENDARY') hatDiscountPercent = 0.20;
        }
    }

    const isVibranium = rig.investment === 0 || (rig.name && (typeof rig.name === 'string' ? rig.name.includes('Vibranium') : (rig.name.en?.includes('Vibranium') || rig.name.th?.includes('Vibranium'))));
    const totalDiscount = safeNumber(discountMultiplier) + hatDiscountPercent;
    const repairCost = isVibranium ? 0 : Math.floor(baseRepairCost * (1 - safeNumber(totalDiscount)));

    const uniformId = (rig.slots || []).find(id => {
        if (!id) return false;
        const item = inventory.find(i => i.id === id);
        return item && (item.typeId === 'uniform' || item.typeId.startsWith('uniform'));
    });
    const energyDiscount = uniformId ? 0.05 : 0;
    const effectiveEnergyCostPerDay = energyCostPerDay * (1 - safeNumber(energyDiscount));

    const lastUpdate = Number(rig.lastEnergyUpdate) || Number(rig.purchasedAt) || Date.now();
    const elapsedMs = now - lastUpdate;
    const speedMultiplier = isDemo ? DEMO_SPEED_MULTIPLIER : 1;
    let drainRatePerHour = 4.166666666666667;
    if (isOverclockActive) drainRatePerHour *= overclockMultiplier;

    const elapsedHours = (elapsedMs * speedMultiplier) / (1000 * 60 * 60);
    const drain = elapsedHours * drainRatePerHour;
    const energyPercent = isZeroEnergy ? 100 : Math.max(0, Math.min(100, safeNumber(rig.energy) - drain));
    const isOutOfEnergy = energyPercent <= 0;

    const daysRemaining = (timeLeftMs / (1000 * 60 * 60 * 24));
    const isRenewable = !isInfiniteContract && daysRemaining <= RENEWAL_CONFIG.WINDOW_DAYS && safeNumber(rig.renewalCount) < RENEWAL_CONFIG.MAX_RENEWALS;
    const renewalCost = safeNumber(rig.investment) * (1 - RENEWAL_CONFIG.DISCOUNT_PERCENT);

    const effectiveIsPowered = isPowered || !!isZeroEnergy;

    let matTier = -1;
    if (preset) {
        if (preset.id === 3) matTier = 1;
        else if (preset.id === 4) matTier = 2;
        else if (preset.id === 5) matTier = 3;
        else if (preset.id === 6) matTier = 4;
        else if (preset.id === 7) matTier = 5;
        else if (preset.id === 8) matTier = 6;
    }

    const overclockBoost = (isPowered && !isZeroEnergy && isOverclockActive) ? overclockMultiplier : (isPowered && !isZeroEnergy) ? ENERGY_CONFIG.BOX_DROP_SPEED_BOOST : 1;
    const giftIntervalMs = (GIFT_CYCLE_DAYS * 24 * 60 * 60 * 1000) / (overclockBoost);
    const lastGiftTimestamp = rig.lastGiftAt ? new Date(rig.lastGiftAt).getTime() : (rig.purchasedAt ? new Date(rig.purchasedAt).getTime() : Date.now());
    const nextGiftTime = lastGiftTimestamp + giftIntervalMs;
    const noGift = preset?.specialProperties?.noGift === true;
    const isGiftAvailable = !isExpired && (now >= nextGiftTime) && !noGift;
    const timeUntilGift = Math.max(0, nextGiftTime - now);
    const nextGiftProgress = Math.min(100, ((now - lastGiftTimestamp) / giftIntervalMs) * 100);

    const keyCount = inventory.filter(i => i.typeId === 'chest_key').length;
    const hasKey = keyCount > 0;

    const formatTimeLeft = (ms: number) => {
        if (isInfiniteContract) return t('rig.permanent');
        if (ms <= 0) return t('rig.contract_expired');
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `${days}${t('time.days')} ${hours}${t('time.hours')}`;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor((ms % (1000 * 60)) / 1000).toString().padStart(2, '0')}`;
    };

    const formatGiftCooldown = (ms: number) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}${t('time.days')}`;
        if (hours > 0) return `${hours}${t('time.hours')}`;
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes}${t('time.minutes')}`;
    };

    useEffect(() => {
        if (isExpired || isBroken || !effectiveIsPowered || isExploring || isRolling) return;
        const cycleInterval = setInterval(() => {
            setIsIdleRolling(true);
            setTimeout(() => setIsIdleRolling(false), 1000);
        }, 3000 + Math.random() * 1000);
        return () => clearInterval(cycleInterval);
    }, [isExpired, isBroken, effectiveIsPowered, isExploring, isRolling]);

    useEffect(() => {
        if (!isIdleRolling && !isRolling) {
            if (!isRolling) setDisplayAmount('???');
            return;
        }
        const interval = setInterval(() => {
            const randomVal = (Math.random() * 99).toFixed(2);
            setDisplayAmount(randomVal);
        }, 50);
        return () => clearInterval(interval);
    }, [isIdleRolling, isRolling]);

    const animate = () => {
        const now = Date.now();
        const lastClaimAt = Number(rig.lastClaimAt) || Number(rig.purchasedAt) || now;
        const timeElapsedSeconds = ((now - lastClaimAt) / 1000);
        if (!isExpired && !isBroken && effectiveIsPowered && !isExploring && !isOutOfEnergy) {
            const minedValue = timeElapsedSeconds * totalRatePerSecond;
            setCurrentAmount(BASE_CLAIM_AMOUNT + minedValue);
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [rig.lastClaimAt, totalRatePerSecond, isExpired, isBroken, isPowered, isExploring]);

    useEffect(() => {
        if (preset?.specialProperties?.zeroEnergy) {
            setCurrentEnergyPercent(100);
            return;
        }
        const updateEnergy = () => {
            if (isJustCharged) { setCurrentEnergyPercent(100); return; }
            const now = Date.now();
            const lastUpdate = safeNumber(rig.lastEnergyUpdate) || safeNumber(rig.purchasedAt) || now;
            const elapsedMs = now - lastUpdate;
            const elapsedHours = elapsedMs / (1000 * 60 * 60);
            const drainRate = isOverclockActive ? (drainRatePerHour * overclockMultiplier) : drainRatePerHour;
            const drain = elapsedHours * drainRate;
            setCurrentEnergyPercent(Math.max(0, Math.min(100, safeNumber(rig.energy ?? 100) - drain)));
        };
        updateEnergy();
        const interval = setInterval(updateEnergy, 1000);
        return () => clearInterval(interval);
    }, [rig.energy, rig.lastEnergyUpdate, rig.purchasedAt, rig.name, isJustCharged]);

    useEffect(() => {
        if (rig.currentMaterials !== undefined) setCurrentMaterials(rig.currentMaterials);
        if (!isExpired && !isBroken && !isExploring && !isOutOfEnergy) {
            materialIntervalRef.current = window.setInterval(() => {
                setCurrentMaterials(prev => {
                    if (prev < 1) {
                        if (Math.random() < MATERIAL_CONFIG.DROP_CHANCE) {
                            const newCount = prev + 1;
                            if (onMaterialUpdate) onMaterialUpdate(rig.id, newCount);
                            return newCount;
                        }
                    }
                    return prev;
                });
            }, MATERIAL_CONFIG.DROP_INTERVAL_MS / overclockBoost);
        }
        return () => { if (materialIntervalRef.current) clearInterval(materialIntervalRef.current); };
    }, [isExpired, isBroken, effectiveIsPowered, rig.id, rig.currentMaterials, isExploring, isOutOfEnergy]);

    const handleClaimClick = () => {
        if ((isExpired || isBroken || !effectiveIsPowered || isExploring) && currentAmount <= 0) return;
        setIsConfirming(true);
    };

    const confirmClaim = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirming(false);
        setIsRolling(true);
        try {
            const result = await onClaim(rig.id, 0);
            if (result && result.success && result.amount !== undefined) {
                setIsRolling(false);
                setDisplayAmount(Number(result.amount).toFixed(2));
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (err) { console.error(err); } finally {
            setIsRolling(false);
            setCurrentAmount(0);
            setDisplayAmount('???');
        }
    };

    const handleRenewClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsRenewConfirming(true); };
    const confirmRenew = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRenew) {
            onRenew(rig);
            setIsRenewConfirming(false);
            setShowRenewed(true);
            setTimeout(() => setShowRenewed(false), 3000);
        }
    };

    const handleRepairClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsRepairConfirming(true); };
    const confirmRepair = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRepairConfirming(false);
        setIsRepairing(true);
        setTimeout(() => {
            if (onRepair) onRepair(rig.id);
            setIsRepairing(false);
            setShowRestored(true);
            setTimeout(() => setShowRestored(false), 2000);
        }, 2000);
    };

    const handleChargeClick = (e: React.MouseEvent) => { e.stopPropagation(); if (isExploring) return; setIsChargeConfirming(true); };
    const confirmCharge = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsChargeConfirming(false);
        setIsJustCharged(true);
        setCurrentEnergyPercent(100);
        setTimeout(() => setIsJustCharged(false), 2000);
        if (onCharge) onCharge(rig.id);
    };

    const handleScrapClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsScrapConfirming(true); };
    const confirmScrap = (e: React.MouseEvent) => { e.stopPropagation(); if (onScrap) onScrap(rig); setIsScrapConfirming(false); };

    const handleGiftClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isGiftAvailable) {
            if (!isOutOfEnergy) onClaimGift(rig.id);
            else if (addNotification) addNotification({ id: Date.now().toString(), userId: rig.ownerId || '', message: t('rig.out_of_energy_msg'), type: 'ERROR', read: false, timestamp: Date.now() });
        }
    };

    const handleCollectMaterialsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCollect && currentMaterials > 0) {
            onCollect(rig.id);
            setCurrentMaterials(0);
        }
    };

    const getTierStyles = () => {
        switch (currentTier) {
            case 7: return { container: 'bg-stone-950 border-purple-500 shadow-lg', headerBg: 'bg-gradient-to-r from-purple-950 via-stone-900 to-stone-900', accentColor: 'text-purple-400', icon: <Cpu size={14} className="text-purple-400 animate-pulse" />, wrench: 'hidden' };
            case 5: return { container: 'bg-stone-950 border-yellow-500 shadow-lg', headerBg: 'bg-gradient-to-r from-yellow-900/50 via-stone-900 to-stone-900', accentColor: 'text-yellow-400', icon: <Crown size={14} className="text-yellow-400 fill-yellow-400/20" />, wrench: 'text-cyan-400' };
            case 4: return { container: 'bg-stone-950 border-orange-700 shadow-md', headerBg: 'bg-gradient-to-r from-orange-950 via-stone-900 to-stone-900', accentColor: 'text-orange-500', icon: <Hexagon size={14} className="text-orange-500" />, wrench: 'text-yellow-400' };
            case 3: return { container: 'bg-stone-950 border-sky-600 shadow-md', headerBg: 'bg-gradient-to-r from-sky-950 via-stone-900 to-stone-900', accentColor: 'text-sky-400', icon: <Home size={14} className="text-sky-500" />, wrench: 'text-slate-300' };
            case 2: return { container: 'bg-stone-950 border-emerald-600 shadow-md', headerBg: 'bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900', accentColor: 'text-emerald-400', icon: <Home size={14} className="text-emerald-500" />, wrench: 'text-orange-600' };
            default: return { container: 'bg-stone-950 border-stone-800 shadow-sm', headerBg: 'bg-stone-900', accentColor: 'text-stone-400', icon: <Home size={14} className="text-stone-600" />, wrench: 'text-stone-500' };
        }
    };

    const styles = getTierStyles();

    const BatteryUI = ({ percent, colorClass, isEnergy = false }: { percent: number; colorClass: string, isEnergy?: boolean }) => {
        const segments = 5;
        const filledSegments = Math.ceil((percent / 100) * segments);
        let barColor = 'bg-[#4ADE80]';
        if (percent <= 10) barColor = 'bg-[#EF4444]';
        else if (percent <= 30) barColor = 'bg-[#F97316]';
        else if (percent <= 50) barColor = 'bg-[#EAB308]';

        return (
            <div className="flex flex-col items-center gap-1">
                <div className="relative w-8 h-12 border-2 border-stone-400 rounded-md p-0.5 flex flex-col justify-end bg-stone-900/50">
                    <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-4 h-[3px] bg-stone-400 rounded-t-sm" />
                    <div className="flex flex-col-reverse w-full h-full gap-[1px]">
                        {Array.from({ length: segments }).map((_, i) => (
                            <div key={i} className={`w-full h-[18%] rounded-[1px] ${i < filledSegments ? barColor : 'bg-transparent'} ${percent <= 10 && i < filledSegments ? 'animate-pulse' : ''}`} />
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-[10px] font-bold text-black">{percent.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`relative rounded-xl p-0.5 transition-all duration-300 sm:hover:-translate-y-1 group border 
            ${((globalMultiplier || 1) > 1 || (reactorMultiplier || 1) > 1) ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : (styles.container || '').replace('bg-stone-950', '').replace('shadow-', '') + ' ' + (styles.container || '')}
        `}>
            <div className={`absolute inset-0 bg-stone-950`}></div>
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 
                ${(globalMultiplier || 1) > 1 ? 'bg-purple-500 opacity-40 animate-pulse' : currentTier >= 5 ? 'bg-yellow-500' : 'bg-stone-700'}
            `}></div>

            {isConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <Coins className="text-yellow-500 animate-pulse mb-3" size={24} />
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_claim')}</h4>
                    {(() => {
                        const furnaceMult = isFurnaceActive ? 2 : 1;
                        const overclockMultActual = isOverclockActive ? overclockMultiplier : 1;
                        const commonMult = safeNumber(globalMultiplier) * safeNumber(reactorMultiplier);

                        const minYield = (safeNumber(volConfig?.baseValue || 0) + effectiveBonusProfit + equippedBonus) * commonMult * overclockMultActual * furnaceMult;
                        const maxYield = (safeNumber(volConfig?.baseValue || 0) + safeNumber(volConfig?.maxRandom || 0) + effectiveBonusProfit + equippedBonus) * commonMult * overclockMultActual * furnaceMult;

                        return (
                            <div className="text-2xl font-mono font-bold text-white mb-1">
                                {formatCurrency(minYield, { hideSymbol: true })} - {formatCurrency(maxYield, { showDecimals: true })}
                            </div>
                        );
                    })()}
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }} className="py-2.5 rounded border border-stone-700 text-stone-400 text-xs font-bold uppercase">{t('common.cancel')}</button>
                        <button onClick={confirmClaim} className="py-2.5 rounded bg-emerald-600 text-white text-xs font-bold uppercase flex items-center justify-center gap-1"><Check size={14} /> {t('common.confirm')}</button>
                    </div>
                </div>
            )}

            {isExploring && (
                <div className="absolute inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <Skull className="text-purple-400 animate-pulse mb-4" size={32} />
                    <h4 className="text-purple-300 font-bold text-lg uppercase tracking-wider mb-2">{t('dungeon.exploring')}</h4>
                    <p className="text-purple-200/60 text-xs px-4">{t('rig.exploring_desc')}</p>
                </div>
            )}

            {isRenewConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <RefreshCw className="text-blue-500 animate-spin-slow mb-3" size={24} />
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_renew')}</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1">-{formatCurrency(renewalCost)}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRenewConfirming(false); }} className="py-2.5 rounded border border-stone-700 text-stone-400 text-xs font-bold uppercase">{t('common.cancel')}</button>
                        <button onClick={confirmRenew} className="py-2.5 rounded bg-blue-600 text-white text-xs font-bold uppercase flex items-center justify-center gap-1"><Check size={14} /> {t('rig.pay')}</button>
                    </div>
                </div>
            )}

            {isRepairConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <Wrench className="text-red-500 animate-bounce mb-3" size={24} />
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_repair')}</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1">-{formatCurrency(repairCost)}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRepairConfirming(false); }} className="py-2.5 rounded border border-stone-700 text-stone-400 text-xs font-bold uppercase">{t('common.cancel')}</button>
                        <button onClick={confirmRepair} className="py-2.5 rounded bg-red-600 text-white text-xs font-bold uppercase flex items-center justify-center gap-1"><Check size={14} /> {t('rig.repair_now')}</button>
                    </div>
                </div>
            )}

            {isRepairing && (
                <div className="absolute inset-0 z-50 bg-stone-950/90 flex flex-col items-center justify-center">
                    <Wrench className="text-orange-500 animate-spin mb-4" size={48} />
                    <div className="text-orange-400 font-bold uppercase tracking-widest">{t('rig.repairing')}</div>
                </div>
            )}

            {isChargeConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <Zap className="text-emerald-500 animate-pulse mb-3" size={24} />
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_refill')}</h4>
                    <div className="text-xl font-mono text-white mb-4">-{formatCurrency(((100 - energyPercent) / 100) * effectiveEnergyCostPerDay)}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsChargeConfirming(false); }} className="py-2.5 rounded border border-stone-700 text-stone-400 text-xs font-bold uppercase">{t('common.cancel')}</button>
                        <button onClick={confirmCharge} className="py-2.5 rounded bg-emerald-600 text-white text-xs font-bold uppercase flex items-center justify-center gap-1"><Check size={14} /> {t('rig.refill_now')}</button>
                    </div>
                </div>
            )}

            {isScrapConfirming && (
                <div className="absolute inset-0 z-50 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border-2 border-red-900/50 rounded-xl">
                    <Trash2 className="text-red-500 animate-bounce mb-4" size={32} />
                    <h4 className="text-red-400 text-sm uppercase tracking-[0.2em] font-black mb-2">{t('rig.confirm_demolish')}</h4>
                    <p className="text-stone-300 text-xs mb-4 leading-relaxed">
                        {language === 'th' ? 'คุณแน่ใจหรือไม่ที่จะหลอมเครื่องขุดนี้? เครื่องขุดจะถูกทำลายและคุณจะได้รับวัตถุดิบบางส่วนคืน' : 'Are you sure you want to melt this rig? It will be destroyed and you will receive some materials back.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsScrapConfirming(false); }} className="py-3 rounded-lg border border-stone-600 text-stone-300 text-xs font-bold uppercase">{t('common.cancel')}</button>
                        <button onClick={confirmScrap} className="py-3 rounded-lg bg-red-600 text-white text-xs font-bold uppercase flex items-center justify-center gap-2"><Trash2 size={14} /> {t('rig.destroy')}</button>
                    </div>
                </div>
            )}

            {showRestored && (
                <div className="absolute inset-0 z-50 bg-emerald-950/90 flex flex-col items-center justify-center zoom-in">
                    <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                    <div className="text-emerald-400 font-bold uppercase tracking-widest">{t('rig.repair_complete')}</div>
                </div>
            )}

            {showRenewed && (
                <div className="absolute inset-0 z-50 bg-blue-950/90 flex flex-col items-center justify-center zoom-in">
                    <CalendarClock className="text-blue-400 mb-4 animate-bounce" size={48} />
                    <div className="text-blue-500 text-xs uppercase tracking-widest">{t('rig.renew_complete')}</div>
                </div>
            )}

            <div className="relative rounded-[10px] h-full flex flex-col">
                <div className={`flex justify-between items-start z-10 p-2 border-b ${styles.headerBg} pb-3 relative`}>
                    <div className="flex flex-col">
                        <span className={`text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 ${styles.accentColor}`}>
                            {React.cloneElement(styles.icon as React.ReactElement, { size: 12 })}
                            {preset ? getLocalized(preset.name) : getLocalized(rig.name)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${rarityConfig.color} ${rarityConfig.border} bg-black/40`}>{rarityConfig.label}</div>
                            <span className="text-[9px] text-stone-600 font-mono">Lvl {currentTier}</span>
                        </div>
                        <div className={`text-[9px] flex items-center gap-1 mt-1 font-mono ${isExpired ? 'text-red-500' : 'text-stone-400'}`}>
                            <Timer size={10} /> <span>{formatTimeLeft(timeLeftMs)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {volConfig && (
                            <div className={`px-1.5 py-0.5 rounded border text-[9px] flex items-center gap-1 bg-stone-900/40 ${volConfig.type === 'Chaos' ? 'text-red-300 border-red-500' : 'text-cyan-400 border-cyan-900/50'}`}>
                                <Zap size={10} />
                                <span className="font-mono font-bold">{volConfig.hashrateMin}-{volConfig.hashrateMax} MH/s</span>
                            </div>
                        )}
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={8} className={i < volConfig.stabilityStars ? 'text-yellow-400 fill-yellow-400' : 'text-stone-700'} />)}
                        </div>
                    </div>
                </div>

                <div className={`flex z-10 flex-1 ${isExpired || isBroken || !isPowered ? 'opacity-50 grayscale' : ''} relative p-3 gap-3`}>
                    <div className="flex flex-col items-center gap-3 pr-2 border-r border-stone-800/30">
                        <BatteryUI percent={energyPercent} colorClass="" isEnergy={true} />
                        {!isZeroEnergy && (
                            <button onClick={handleChargeClick} disabled={isExploring || energyPercent >= 100} className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center hover:bg-stone-800 group relative">
                                <Zap size={18} className="text-emerald-400 group-hover:scale-110" />
                                {isOutOfEnergy && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-black" />}
                            </button>
                        )}
                        <div className="flex flex-col gap-2.5 mt-4">
                            {equippedItems.slice(1, 5).map((item, index) => (
                                <div key={index} onClick={(e) => { e.stopPropagation(); if (!isExploring && onManageAccessory) onManageAccessory(rig.id, index + 1); }} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${item ? 'border-yellow-400 bg-stone-800' : 'border-white/10 border-dashed bg-black/40'}`}>
                                    {item ? (
                                        (() => {
                                            const thName = getLocalized(item.name);
                                            let IconComp = Briefcase;
                                            if (thName.includes('หมวก') || thName.includes('HardHat')) IconComp = HardHat;
                                            else if (thName.includes('แว่น')) IconComp = Glasses;
                                            else if (thName.includes('ชุด')) IconComp = Shirt;
                                            else if (thName.includes('กระเป๋า')) IconComp = Backpack;
                                            else if (thName.includes('รองเท้า')) IconComp = Footprints;
                                            else if (thName.includes('มือซื้อ')) IconComp = Smartphone;
                                            else if (thName.includes('คอม')) IconComp = Monitor;
                                            return <IconComp size={20} className="text-yellow-100" />;
                                        })()
                                    ) : <Plus size={12} className="text-white/10" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative min-h-[160px]">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-black/60 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1.5">
                            <Wrench size={10} className={healthPercent <= 20 ? 'text-red-500' : 'text-stone-300'} />
                            <div className="flex gap-[2px]">
                                {Array.from({ length: 10 }).map((_, i) => <div key={i} className={`h-1.5 w-2 rounded-[1px] ${healthPercent >= (i + 1) * 10 ? (healthPercent > 20 ? 'bg-green-500' : 'bg-red-500 animate-pulse') : 'bg-stone-800'}`} />)}
                            </div>
                            <span className="text-[9px] text-stone-400 font-mono">{Math.ceil(healthPercent)}%</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <OilRigAnimation isActive={!isExpired && !isBroken && !isExploring && !isOutOfEnergy} rarity={rig.rarity} tier={currentTier} rigName={getLocalized(rig.name)} isOverclockActive={isOverclockActive} />
                        </div>
                    </div>

                    {!isExpired && (
                        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                            {!isInfiniteDurability && !isVibranium && (
                                <button onClick={handleRepairClick} disabled={isExploring} className={`w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center hover:bg-stone-800 group relative ${isBroken ? 'animate-bounce border-red-500' : ''}`}>
                                    <Wrench size={18} className="text-stone-300 group-hover:rotate-45" />
                                    {isBroken && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-black" />}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {isBroken && !isExpired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"><div className="bg-red-900 px-3 py-1.5 rounded border border-red-500 text-white text-xs font-bold uppercase animate-pulse"><AlertTriangle size={14} /> {t('rig.broken')}</div></div>
                )}

                <div className="mt-auto z-10 p-3 pt-0 space-y-2.5">
                    {!isExpired && (
                        <div className={`mb-2 flex items-center justify-between p-1.5 rounded-lg border-2 ${currentMaterials > 0 ? 'bg-stone-950 border-yellow-600' : 'bg-stone-950/30 border-stone-800'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${currentMaterials > 0 ? 'border-yellow-500 bg-stone-900' : 'border-stone-800 bg-stone-950'}`}>
                                    <Key size={18} className={currentMaterials > 0 ? 'text-yellow-400' : 'text-stone-800'} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase ${currentMaterials > 0 ? 'text-yellow-400' : 'text-stone-400'}`}>{currentMaterials > 0 ? t('rig.mining_key') : t('rig.waiting_discovery')}</span>
                                    <div className="text-[10px] mt-0.5">{currentMaterials > 0 ? <span className="text-red-500 font-extrabold">{language === 'th' ? 'เต็ม (FULL)' : 'FULL'}</span> : <span className="text-stone-500">{t('rig.capacity')} 1</span>}</div>
                                </div>
                            </div>
                            {currentMaterials > 0 && !isExploring && (
                                <button onClick={handleCollectMaterialsClick} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1"><ArrowDownToLine size={14} /> {t('rig.collect')}</button>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-end px-1 border-t border-stone-800 pt-3">
                        <div className="text-right w-full">
                            <div className="text-xl font-mono font-bold text-white flex items-center justify-end gap-1">
                                {isOverclockActive && <span className="text-emerald-400 text-xs animate-pulse">x1.5</span>}
                                <span className="text-yellow-400 tracking-widest">{displayAmount}</span>
                                <Sparkles size={12} className={!isExpired && !isBroken && isPowered && !isExploring && (isRolling || isIdleRolling) ? "text-yellow-500 animate-spin" : "hidden"} />
                            </div>
                        </div>
                    </div>

                    {rig.isDead && (
                        <div className="mb-2">
                            {!isRenewConfirming ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {rig.investment > 0 && (
                                        <button onClick={handleRenewClick} className="px-3 py-2 rounded-lg font-bold uppercase text-[12px] flex items-center justify-center gap-1.5 bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700 h-10"><RefreshCw size={14} /> {t('actions.renew')}</button>
                                    )}
                                    <button onClick={handleDestroyClick} className="px-3 py-2 rounded-lg font-bold uppercase text-[12px] flex items-center justify-center gap-1.5 bg-red-600 text-white border border-red-500 hover:bg-red-500 h-10"><Trash2 size={14} /> {t('rig.destroy')}</button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {!rig.isDead && (
                        <div className="mb-2">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {rig.investment > 0 && (
                                    <button onClick={handleRenewClick} disabled={!isExpired} className={`px-3 py-2 rounded-lg font-bold uppercase text-[12px] flex items-center justify-center gap-1.5 border h-10 ${!isExpired ? 'bg-stone-800 text-stone-600 border-stone-700' : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'}`}><RefreshCw size={14} /> {language === 'th' ? 'ต่อสัญญา' : 'Renew'}</button>
                                )}
                                <button onClick={handleScrapClick} className={`px-3 py-2 rounded-lg font-bold uppercase text-[12px] flex items-center justify-center gap-1.5 bg-red-600 text-white border border-red-500 hover:bg-red-500 h-10 ${(rig.investment <= 0 || preset?.id === 9) && !onMerge ? 'col-span-2' : (preset?.id === 9 ? 'col-span-2' : '')}`}><Trash2 size={14} /> {t('rig.destroy')}</button>
                            </div>

                            {!isExpired && !isBroken && !isExploring && onMerge && !preset?.specialProperties?.cannotMerge && (
                                <button
                                    onClick={() => setIsMergeModalOpen(true)}
                                    className="w-full mb-2 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-2 rounded border border-yellow-500/50 flex items-center justify-center gap-2 h-10 shadow-lg shadow-yellow-900/20"
                                >
                                    <Sparkles size={16} className="text-yellow-200 animate-pulse" />
                                    <span className="uppercase text-xs tracking-wider">Merge / Evolve</span>
                                </button>
                            )}

                            <button
                                onClick={handleClaimClick}
                                disabled={(isExpired || !effectiveIsPowered || isExploring || globalCooldownSeconds > 0) && currentAmount <= 0}
                                className={`w-full font-bold py-2 rounded border flex items-center justify-center gap-2 h-10 transition-all
                                    ${(isExpired || !effectiveIsPowered || isExploring || globalCooldownSeconds > 0)
                                        ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                                        : (currentTier >= 5 && preset?.id !== 9) ? 'bg-yellow-600 text-white border-yellow-500 hover:bg-yellow-500' : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                                    }`}
                            >
                                {isExploring ? (
                                    <><Skull size={18} /> {language === 'th' ? 'กำลังสำรวจ...' : 'Exploring...'}</>
                                ) : globalCooldownSeconds > 0 ? (
                                    <><Timer size={18} className="text-orange-400" /> <span className="text-orange-400 font-mono text-xs">{language === 'th' ? 'รับได้อีกใน:' : 'Next Claim:'} {formatGlobalCooldown(globalCooldownSeconds)}</span></>
                                ) : (
                                    <><Coins size={18} className={isRolling ? "animate-spin" : "animate-pulse"} /> {isExpired ? t('rig.expired') : t('rig.claim_rent')}</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <RigLootModal isOpen={isLootModalOpen} onClose={() => setIsLootModalOpen(false)} rig={rig} />
            <RigMergeModal
                isOpen={isMergeModalOpen}
                onClose={() => setIsMergeModalOpen(false)}
                baseRig={rig}
                availableRigs={availableRigs}
                onMergeSuccess={(newRig) => {
                    if (onMerge) onMerge(newRig);
                    setIsMergeModalOpen(false);
                }}
            />
        </div>
    );
};
