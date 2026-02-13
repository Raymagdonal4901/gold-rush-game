import React, { useEffect, useState, useRef } from 'react';
import { OilRig, AccessoryItem } from '../services/types';
import { OilRigAnimation } from './OilRigAnimation';
import { BASE_CLAIM_AMOUNT, CURRENCY, RARITY_SETTINGS, GIFT_CYCLE_DAYS, RENEWAL_CONFIG, REPAIR_CONFIG, MATERIAL_CONFIG, RIG_PRESETS, MAX_SLOTS_PER_RIG, DEMO_SPEED_MULTIPLIER, EQUIPMENT_SERIES, ENERGY_CONFIG, RIG_LOOT_TABLES } from '../constants';
import { Pickaxe, Clock, Coins, Sparkles, Zap, Timer, Crown, Hexagon, Check, X, Gift, Briefcase, RefreshCw, AlertTriangle, Wrench, Hammer, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, ShoppingBag, BoxSelect, Info, Lock, Key, ArrowDownToLine, ZapOff, CheckCircle2, CalendarClock, Eye, Truck, Plus, Cpu, Trash2, Skull, Package, Factory, Search, Flame, Home, Fan, Wifi, Server, Grid, HardDrive, Calculator, Star, Settings } from 'lucide-react';
import { InfinityGlove } from './InfinityGlove';
import { MaterialIcon } from './MaterialIcon';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

interface RigCardProps {
    rig: OilRig;
    accessoryBonus?: number;
    durationBonusDays?: number;
    inventory?: AccessoryItem[];
    onClaim: (id: string, amount: number) => void;
    onClaimGift: (id: string) => void;
    onRenew?: (id: string) => void;
    onRepair?: (id: string) => void;
    onSellMaterials?: (id: string) => void;
    onMaterialUpdate?: (id: string, count: number) => void;
    onEquipSlot?: (rigId: string, slotIndex: number) => void;
    onUnequipSlot?: (rigId: string, slotIndex: number) => void;
    onManageGlove?: (rigId: string) => void;
    onManageAccessory?: (rigId: string, slotIndex: number) => void;
    onCharge?: (id: string) => void;
    globalMultiplier?: number;
    reactorMultiplier?: number;
    isPowered?: boolean;
    isExploring?: boolean;
    isOverclockActive?: boolean; // Overclock boost active
    overclockMultiplier?: number; // Dynamic multiplier
    isDemo?: boolean;
    addNotification?: (n: any) => void;
}

export const RigCard: React.FC<RigCardProps> = ({
    rig,
    durationBonusDays = 0,
    inventory = [],
    onClaim,
    onClaimGift,
    onRenew,
    onRepair,
    onSellMaterials,
    onMaterialUpdate,
    onEquipSlot,
    onUnequipSlot,
    onManageGlove,
    onManageAccessory,
    onCharge,
    globalMultiplier = 1,
    reactorMultiplier = 1,
    isPowered = true,
    isExploring = false,
    isOverclockActive = false,
    overclockMultiplier = 1,
    isDemo = false,
    addNotification
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
    const [currentMaterials, setCurrentMaterials] = useState(rig.currentMaterials || 0);
    const [currentEnergyPercent, setCurrentEnergyPercent] = useState(rig.energy ?? 100);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRenewConfirming, setIsRenewConfirming] = useState(false);
    const [isRepairConfirming, setIsRepairConfirming] = useState(false);
    const [isChargeConfirming, setIsChargeConfirming] = useState(false);
    const [isJustCharged, setIsJustCharged] = useState(false);

    const [isRepairing, setIsRepairing] = useState(false);
    const [showRestored, setShowRestored] = useState(false);
    const [showRenewed, setShowRenewed] = useState(false);
    const [showLootTable, setShowLootTable] = useState(false);
    const lastChargedAtRef = useRef<number>(0);

    const lastUpdateRef = useRef<number>(Date.now());
    const requestRef = useRef<number | null>(null);
    const materialIntervalRef = useRef<number | null>(null);


    useEffect(() => {
        console.log(`[RigCard DEBUG] ${getLocalized(rig.name)} (${rig.id}) - ClaimAt: ${rig.lastClaimAt}, Mat: ${rig.currentMaterials}, CollectAt: ${rig.lastCollectionAt}`);
    }, [rig]);

    // Find preset first to get static data like type/rarity
    const nameStr = typeof rig.name === 'string' ? rig.name : (rig.name?.en || rig.name?.th || '');
    const preset = RIG_PRESETS.find(p => p.name.en === nameStr || p.name.th === nameStr) || RIG_PRESETS.find(p => p.price === rig.investment);

    // Rarity Logic: Prefer preset.type (from constants), then rig.rarity (from DB), then default
    const rarityKey = (preset?.type?.toUpperCase() || rig.rarity || 'COMMON') as keyof typeof RARITY_SETTINGS;
    const rarityConfig = RARITY_SETTINGS[rarityKey] || RARITY_SETTINGS['COMMON'];

    let equippedBonus = 0;
    const equippedItems = (rig.slots || Array(MAX_SLOTS_PER_RIG).fill(null)).map(itemId => {
        if (!itemId) return null;
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            // Legacy Scale Fallback: If bonus is tiny, it's likely old USD scale
            const effectiveItemBonus = (item.dailyBonus < 0.5 && item.dailyBonus > 0) ? item.dailyBonus * 35 : item.dailyBonus;
            equippedBonus += effectiveItemBonus;
        }
        return item;
    });

    const gloveItem = equippedItems[0];

    const isNoBonusRig = ['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(nameStr);
    const effectiveBonusProfit = isNoBonusRig ? 0 : (rig.bonusProfit || 0);

    // Override base profit for specific rigs (Balance Patch)
    // Legacy Scale Fallback: If profit is tiny (< 5), it's likely old USD scale
    const baseDailyProfit = (rig.dailyProfit < 5 && rig.dailyProfit > 0) ? rig.dailyProfit * 35 : rig.dailyProfit;

    let totalDailyProfit = (baseDailyProfit + effectiveBonusProfit + equippedBonus) * globalMultiplier * reactorMultiplier;

    // OVERCLOCK Dynamic Boost
    if (isOverclockActive) {
        totalDailyProfit *= overclockMultiplier;
    }

    const totalRatePerSecond = totalDailyProfit / 86400;

    const tier = (investment: number) => {
        if (investment === 0) return 7; // Special Tier (Vibranium)
        if (investment >= 3000) return 5;
        if (investment >= 2500) return 4;
        if (investment >= 2000) return 3;
        if (investment >= 1500) return 2;
        return 1;
    };
    const currentTier = tier(rig.investment);


    const getAccessoryIcon = (item: AccessoryItem, className: string) => {
        const getNeonIcon = (typeId: string) => {
            if (!typeId) return <InfinityGlove rarity={item.rarity} className={className} />;
            if (typeId.startsWith('hat')) {
                return <HardHat className={`${className} text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]`} />;
            }
            if (typeId.startsWith('glasses')) {
                return <Glasses className={`${className} text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]`} />;
            }
            if (typeId.startsWith('uniform') || typeId.startsWith('shirt')) {
                return <Shirt className={`${className} text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]`} />;
            }
            if (typeId.startsWith('bag')) {
                return <Backpack className={`${className} text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]`} />;
            }
            if (typeId.startsWith('boots')) {
                return <Footprints className={`${className} text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]`} />;
            }
            if (typeId.startsWith('mobile')) { // Communication
                return <Smartphone className={`${className} text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]`} />;
            }
            if (typeId.startsWith('pc')) { // Control Board
                return <Monitor className={`${className} text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]`} />;
            }
            if (typeId === 'auto_excavator') { // Rig Frame
                return <Truck className={`${className} text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]`} />;
            }
            if (typeId.startsWith('robot')) {
                return <Bot className={`${className} text-yellow-500 animate-pulse drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]`} />;
            }
            if (typeId === 'upgrade_chip') {
                return <Cpu className={`${className} text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]`} />;
            }
            if (typeId === 'chest_key') {
                return <Key className={`${className} text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]`} />;
            }

            if (typeId.startsWith('repair_kit')) {
                let glowColor = 'bg-emerald-500';
                let IconComp = Wrench;

                if (typeId === 'repair_kit_1') {
                    glowColor = 'bg-emerald-500';
                    IconComp = Hammer;
                } else if (typeId === 'repair_kit_2') {
                    glowColor = 'bg-purple-500';
                    IconComp = Briefcase;
                } else if (typeId === 'repair_kit_3') {
                    glowColor = 'bg-yellow-500';
                    IconComp = Cpu;
                } else if (typeId === 'repair_kit_4') {
                    glowColor = 'bg-red-600';
                    IconComp = Settings;
                }

                return (
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute inset-0 ${glowColor} rounded-full scale-125 blur-md opacity-20 animate-pulse`}></div>
                        <IconComp className={`${className} relative z-10`} />
                    </div>
                );
            }

            return <InfinityGlove rarity={item.rarity} className={className} />;
        };

        const typeId = item.typeId || '';
        return getNeonIcon(typeId);
    };

    const isInfiniteDurability = preset?.specialProperties?.infiniteDurability;
    const isZeroEnergy = preset?.specialProperties?.zeroEnergy;

    // Calculate duration based on Days or Months
    const durationDaysTotal = rig.durationDays || (rig.durationMonths ? rig.durationMonths * 30 : 0) || (preset?.durationDays || (preset?.durationMonths || 0) * 30);
    const baseDurationMs = (durationDaysTotal * 24 * 60 * 60 * 1000);
    // If Infinite Durability (999 months), show as infinite
    const isInfiniteContract = (rig.durationMonths >= 900) || (preset?.specialProperties?.infiniteDurability === true);

    const now = Date.now();
    const bonusDurationMs = (rig.renewalCount || 0) * (RENEWAL_CONFIG.WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const expiryTime = rig.expiresAt + bonusDurationMs;
    const timeLeftMs = Math.max(0, expiryTime - now);
    const isExpired = !isInfiniteContract && timeLeftMs <= 0;

    const durabilityMs = (REPAIR_CONFIG.DURABILITY_DAYS * 24 * 60 * 60 * 1000);
    const timeSinceRepair = now - (rig.lastRepairAt || rig.purchasedAt);
    const healthPercent = (isInfiniteContract || isInfiniteDurability) ? 100 : Math.max(0, 100 * (1 - timeSinceRepair / durabilityMs));
    const isBroken = healthPercent <= 0;

    let baseRepairCost = isInfiniteDurability ? 0 : (rig.repairCost || (preset ? preset.repairCost : Math.floor(rig.investment * 0.06)));
    // Legacy Scale Fallback for Costs
    if (baseRepairCost > 0 && baseRepairCost < 1) baseRepairCost *= 35;

    let energyCostPerDay = rig.energyCostPerDay || (preset ? preset.energyCostPerDay : 0);
    if (energyCostPerDay > 0 && energyCostPerDay < 1) energyCostPerDay *= 35;

    const currentUser = rig.ownerId ? null : null; // MockDB usage replaced by null (will be hydrated by props/refresh if needed)
    const hasSilverBuff = (currentUser?.masteryPoints || 0) >= 300;

    // --- Hat Discount Logic ---
    let discountMultiplier = 0;
    if (hasSilverBuff) discountMultiplier += 0.05;

    const hatId = rig.slots ? rig.slots.find(id => {
        if (!id) return false;
        const item = inventory.find(i => i.id === id);
        return item && item.typeId === 'hat';
    }) : null;

    let hatDiscountText = '';
    if (hatId) {
        const hatItem = inventory.find(i => i.id === hatId);
        if (hatItem) {
            const series = EQUIPMENT_SERIES.hat.tiers.find(t => t.rarity === hatItem.rarity);
            if (series) {
                const match = getLocalized(series.stat).match(/-(\d+)%/);
                if (match) {
                    const p = parseInt(match[1]);
                    discountMultiplier += (p / 100);
                    hatDiscountText = `(${t('rig.maintenance_fee')} -${p}%)`;
                }
            }
        }
    }

    const isVibranium = rig.investment === 0 || rig.name.includes('Vibranium');
    const repairCost = isVibranium ? 0 : Math.floor(baseRepairCost * (1 - discountMultiplier));

    // --- Uniform Energy Discount ---
    const uniformId = rig.slots ? rig.slots.find(id => {
        if (!id) return false;
        const item = inventory.find(i => i.id === id);
        return item && (item.typeId === 'uniform' || item.typeId.startsWith('uniform'));
    }) : null;
    const energyDiscount = uniformId ? 0.05 : 0;
    const effectiveEnergyCostPerDay = energyCostPerDay * (1 - energyDiscount);

    const lastUpdate = rig.lastEnergyUpdate || rig.purchasedAt || Date.now();
    const elapsedMs = now - lastUpdate;

    // Use speed multiplier (Demo only)
    const speedMultiplier = isDemo ? DEMO_SPEED_MULTIPLIER : 1;

    // BASE Energy Drain: 100% in 24 hours (4.166% per hour)
    let drainRatePerHour = 4.166666666666667;

    // OVERCLOCK: Accelerated time means faster drain matching the multiplier
    if (isOverclockActive) {
        drainRatePerHour *= overclockMultiplier;
    }

    const elapsedHours = (elapsedMs * speedMultiplier) / (1000 * 60 * 60);
    const drain = elapsedHours * drainRatePerHour;

    const calculatedEnergyPercent = isZeroEnergy ? 100 : Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));
    const energyPercent = calculatedEnergyPercent;
    const isOutOfEnergy = energyPercent <= 0;

    const daysRemaining = (timeLeftMs / (1000 * 60 * 60 * 24)); // Display as normal days
    const isRenewable = !isInfiniteContract && daysRemaining <= RENEWAL_CONFIG.WINDOW_DAYS && (rig.renewalCount || 0) < RENEWAL_CONFIG.MAX_RENEWALS;
    const renewalDiscount = RENEWAL_CONFIG.DISCOUNT_PERCENT;
    const renewalCost = rig.investment * (1 - renewalDiscount);

    // Override IsPowered
    const effectiveIsPowered = isPowered || !!isZeroEnergy;

    // Calculate Material Tier for Gift Box display
    let matTier = -1;
    if (preset) {
        if (preset.id === 3) matTier = 1;      // Coal
        else if (preset.id === 4) matTier = 2; // Copper
        else if (preset.id === 5) matTier = 3; // Iron
        else if (preset.id === 6) matTier = 4; // Gold
        else if (preset.id === 7) matTier = 5; // Diamond
        else if (preset.id === 8) matTier = 6; // Vibranium
    }

    const overclockBoost = (isPowered && !isZeroEnergy && isOverclockActive) ? overclockMultiplier : (isPowered && !isZeroEnergy) ? ENERGY_CONFIG.BOX_DROP_SPEED_BOOST : 1;
    const giftIntervalMs = (GIFT_CYCLE_DAYS * 24 * 60 * 60 * 1000) / (overclockBoost);
    const lastGiftTime = rig.lastGiftAt || rig.purchasedAt;
    const nextGiftTime = lastGiftTime + giftIntervalMs;
    const isGiftAvailable = !isExpired && (now >= nextGiftTime);
    const timeUntilGift = Math.max(0, nextGiftTime - now);
    const nextGiftProgress = Math.min(100, ((now - lastGiftTime) / giftIntervalMs) * 100);

    const keyCount = inventory.filter(i => i.typeId === 'chest_key').length;
    const hasKey = keyCount > 0;
    const aiRobotItem = inventory.find(i => i.typeId === 'robot');
    const aiRobotTimeLeft = aiRobotItem ? Math.max(0, aiRobotItem.expireAt - Date.now()) : 0;

    const formatTimeLeft = (ms: number) => {
        const gameMs = ms;

        if (isInfiniteContract) return t('rig.permanent');
        if (gameMs <= 0) return t('rig.contract_expired');
        const days = Math.floor(gameMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gameMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((gameMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}${t('time.days')} ${hours}${t('time.hours')}`;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor((gameMs % (1000 * 60)) / 1000).toString().padStart(2, '0')}`;
    };

    const formatGiftCooldown = (ms: number) => {
        const gameMs = ms;
        const days = Math.floor(gameMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gameMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}${t('time.days')}`;
        if (hours > 0) return `${hours}${t('time.hours')}`;
        const minutes = Math.floor((gameMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes}${t('time.minutes')}`;
    };

    const formatSimpleTime = (ms: number) => {
        const gameMs = ms;
        const days = Math.floor(gameMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gameMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}${t('time.days')}`;
        return `${hours}${t('time.hours')}`;
    }

    const animate = () => {
        const now = Date.now();
        const timeElapsedSeconds = ((now - rig.lastClaimAt) / 1000);
        if (!isExpired && !isBroken && effectiveIsPowered && !isExploring && !isOutOfEnergy) {
            const minedValue = timeElapsedSeconds * totalRatePerSecond;
            const total = BASE_CLAIM_AMOUNT + minedValue;
            setCurrentAmount(total);
        }
        lastUpdateRef.current = now;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [rig.lastClaimAt, totalRatePerSecond, isExpired, isBroken, isPowered, isExploring]);

    // Energy Depletion Animation
    useEffect(() => {
        const preset = RIG_PRESETS.find(p => p.name === rig.name);
        if (preset?.specialProperties?.zeroEnergy) {
            setCurrentEnergyPercent(100);
            return;
        }

        const updateEnergy = () => {
            if (isJustCharged) {
                setCurrentEnergyPercent(100);
                return;
            }
            const now = Date.now();

            const lastUpdate = rig.lastEnergyUpdate || rig.purchasedAt || now;
            const elapsedMs = now - lastUpdate;
            // Apply speed multiplier for Demo mode (720x faster drain)
            const elapsedHours = (elapsedMs) / (1000 * 60 * 60);
            const drainRate = isOverclockActive ? (drainRatePerHour * overclockMultiplier) : drainRatePerHour;
            const drain = elapsedHours * drainRate;
            const calculatedEnergy = Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));
            setCurrentEnergyPercent(calculatedEnergy);
        };

        updateEnergy();
        const interval = setInterval(updateEnergy, 1000); // Update every second

        return () => clearInterval(interval);
    }, [rig.energy, rig.lastEnergyUpdate, rig.purchasedAt, rig.name, isJustCharged]);

    useEffect(() => {
        if (rig.currentMaterials !== undefined) {
            setCurrentMaterials(rig.currentMaterials);
        }
        if (!isExpired && !isBroken && !isExploring && !isOutOfEnergy) {
            materialIntervalRef.current = window.setInterval(() => {
                setCurrentMaterials(prev => {
                    if (prev < 1) {
                        const roll = Math.random();
                        if (roll < MATERIAL_CONFIG.DROP_CHANCE) {
                            const newCount = prev + 1;
                            if (onMaterialUpdate) onMaterialUpdate(rig.id, newCount);
                            return newCount;
                        }
                    }
                    return prev;
                });
            }, MATERIAL_CONFIG.DROP_INTERVAL_MS / overclockBoost);
        }
        return () => {
            if (materialIntervalRef.current) clearInterval(materialIntervalRef.current);
        };
    }, [isExpired, isBroken, effectiveIsPowered, rig.id, rig.currentMaterials, isExploring, isOutOfEnergy]);

    const handleClaimClick = () => {
        if ((isExpired || isBroken || !effectiveIsPowered || isExploring) && currentAmount <= 0) return;
        setIsConfirming(true);
    };

    const confirmClaim = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClaim(rig.id, currentAmount);
        setCurrentAmount(BASE_CLAIM_AMOUNT);
        setIsConfirming(false);
    };

    const handleRenewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenewConfirming(true);
    };

    const confirmRenew = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRenew) {
            onRenew(rig.id);
            setIsRenewConfirming(false);
            setCurrentAmount(BASE_CLAIM_AMOUNT);
            setShowRenewed(true);
            setTimeout(() => setShowRenewed(false), 3000);
        }
    };

    const handleRepairClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRepairConfirming(true);
    };

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

    const handleChargeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isExploring) return;
        setIsChargeConfirming(true);
    };

    const confirmCharge = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsChargeConfirming(false);
        // Immediately update UI to show full battery
        setIsJustCharged(true);
        setCurrentEnergyPercent(100);
        setTimeout(() => setIsJustCharged(false), 2000);
        if (onCharge) onCharge(rig.id);
    };

    const handleGiftClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isGiftAvailable) {
            if (hasKey && !isOutOfEnergy) onClaimGift(rig.id);
            else if (isOutOfEnergy) {
                if (addNotification) addNotification({ id: Date.now().toString(), userId: rig.ownerId || '', message: t('rig.out_of_energy_msg'), type: 'ERROR', read: false, timestamp: Date.now() });
            }
            else {
                if (addNotification) addNotification({ id: Date.now().toString(), userId: rig.ownerId || '', message: t('rig.need_key_msg'), type: 'ERROR', read: false, timestamp: Date.now() });
            }
        }
    };

    const handleCollectMaterialsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSellMaterials && currentMaterials > 0) {
            onSellMaterials(rig.id);
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

        // Solid Colors matching reference
        let barColor = 'bg-[#4ADE80]'; // Green
        if (percent <= 20) barColor = 'bg-[#EF4444]'; // Red
        else if (percent <= 40) barColor = 'bg-[#F97316]'; // Orange
        else if (percent <= 60) barColor = 'bg-[#EAB308]'; // Yellow

        // Remove pulse animation for cleaner look unless critical
        const isCritical = percent <= 20;

        return (
            <div className="flex flex-col items-center gap-1">
                {/* Battery Container */}
                <div className="relative w-8 h-12 border-2 border-stone-400 rounded-md p-0.5 flex flex-col justify-end bg-stone-900/50">
                    {/* Battery Tip */}
                    <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-4 h-[3px] bg-stone-400 rounded-t-sm" />

                    {/* Segments Container */}
                    <div className="flex flex-col-reverse w-full h-full gap-[1px]">
                        {Array.from({ length: segments }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-full h-[18%] rounded-[1px] ${i < filledSegments ? barColor : 'bg-transparent'} ${isCritical && i < filledSegments ? 'animate-pulse' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-[10px] font-bold text-black">{percent.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        );
    };

    let healthColor = 'bg-cyan-500';
    if (healthPercent <= 20) healthColor = 'bg-red-500 animate-pulse';
    else if (healthPercent <= 50) healthColor = 'bg-orange-500';

    let energyColor = 'bg-emerald-500';
    if (energyPercent <= 20) energyColor = 'bg-red-500 animate-[pulse_1s_infinite]';
    else if (energyPercent <= 50) energyColor = 'bg-yellow-500';

    return (
        <div className={`relative rounded-xl p-0.5 transition-all duration-300 sm:hover:-translate-y-1 group border 
        ${((globalMultiplier || 1) > 1 || (reactorMultiplier || 1) > 1) ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : (styles?.container || '').replace('bg-stone-950', '').replace('shadow-', '') + ' ' + (styles?.container || '')}
    `}>

            <div className={`absolute inset-0 bg-stone-950`}></div>
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 
          ${(globalMultiplier || 1) > 1 ? 'bg-purple-500 opacity-40 animate-pulse' :
                    currentTier >= 5 ? 'bg-yellow-500' : currentTier === 4 ? 'bg-orange-500' : currentTier === 3 ? 'bg-sky-500' : currentTier === 2 ? 'bg-emerald-500' : 'bg-stone-700'}
      `}></div>

            {/* Confirmation Overlays */}
            {isConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-yellow-500/10 p-3 rounded-full mb-3">
                        <Coins className="text-yellow-500 animate-pulse" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_claim')}</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">{formatCurrency(currentAmount, { showDecimals: true })}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">{t('common.cancel')}</button>
                        <button onClick={confirmClaim} className="py-2.5 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> {t('common.confirm')}</button>
                    </div>
                </div>
            )}
            {isExploring && (
                <div className="absolute inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-purple-500/20 p-4 rounded-full mb-4 animate-[pulse_2s_infinite]">
                        <Skull className="text-purple-400" size={32} />
                    </div>
                    <h4 className="text-purple-300 font-bold text-lg uppercase tracking-wider mb-2">{t('dungeon.exploring')}</h4>
                    <p className="text-purple-200/60 text-xs px-4">{t('rig.exploring_desc')}</p>
                </div>
            )}

            {isRenewConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-blue-500/10 p-3 rounded-full mb-3">
                        <RefreshCw className="text-blue-500 animate-spin-slow" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_renew')}</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">-{formatCurrency(renewalCost)}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRenewConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">{t('common.cancel')}</button>
                        <button onClick={confirmRenew} className="py-2.5 rounded bg-blue-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> {t('rig.pay')}</button>
                    </div>
                </div>
            )}

            {isRepairConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-red-500/10 p-3 rounded-full mb-3">
                        <Wrench className="text-red-500 animate-bounce" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_repair')}</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">-{formatCurrency(repairCost)}</div>
                    {hasSilverBuff && <div className="text-xs text-stone-500">({t('rig.silver_owner_discount')})</div>}
                    {hatDiscountText && <div className="text-xs text-emerald-400">{hatDiscountText}</div>}
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRepairConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">{t('common.cancel')}</button>
                        <button onClick={confirmRepair} className="py-2.5 rounded bg-red-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> {t('rig.repair_now')}</button>
                    </div>
                </div>
            )}

            {isRepairing && (
                <div className="absolute inset-0 z-50 bg-stone-950/90 flex flex-col items-center justify-center animate-in fade-in">
                    <Wrench className="text-orange-500 animate-spin mb-4" size={48} />
                    <div className="text-orange-400 font-bold uppercase tracking-widest animate-pulse">{t('rig.repairing')}</div>
                </div>
            )}

            {isChargeConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-orange-500/10 p-3 rounded-full mb-3">
                        <Flame className="text-orange-500 animate-pulse" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{t('rig.confirm_refill')}</h4>
                    -{formatCurrency(((100 - energyPercent) / 100) * effectiveEnergyCostPerDay)}
                    <div className="text-xs text-stone-500 mb-4">{t('rig.refill_desc')}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsChargeConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">{t('common.cancel')}</button>
                        <button onClick={confirmCharge} className="py-2.5 rounded bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> {t('rig.refill_now')}</button>
                    </div>
                </div>
            )}

            {showRestored && (
                <div className="absolute inset-0 z-50 bg-emerald-950/90 flex flex-col items-center justify-center animate-in zoom-in">
                    <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                    <div className="text-emerald-400 font-bold uppercase tracking-widest">{t('rig.repair_complete')}</div>
                </div>
            )}

            {showRenewed && (
                <div className="absolute inset-0 z-50 bg-blue-950/90 flex flex-col items-center justify-center animate-in zoom-in backdrop-blur-sm">
                    <CalendarClock className="text-blue-400 mb-4 animate-bounce" size={48} />
                    <div className="text-blue-300 font-bold text-2xl mb-1">+{rig.durationMonths * 30} {t('time.days')}</div>
                    <div className="text-blue-500 text-xs uppercase tracking-widest">{t('rig.renew_complete')}</div>
                </div>
            )}

            <div className="relative rounded-[10px] h-full flex flex-col">

                {/* Header Info */}
                <div className={`flex justify-between items-start z-10 p-2 border-b ${(globalMultiplier > 1 || reactorMultiplier > 1) ? 'border-purple-500/50 bg-gradient-to-r from-purple-900/30 to-stone-900' : 'border-stone-800 ' + styles.headerBg} pb-3 relative`}>
                    <div className="flex flex-col">
                        <span className={`text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 drop-shadow-sm ${(globalMultiplier > 1 || reactorMultiplier > 1) ? 'text-white' : styles.accentColor}`}>
                            {React.cloneElement(styles.icon as React.ReactElement, { size: 12 })}
                            {preset ? getLocalized(preset.name) : getLocalized(rig.name)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 ${rarityConfig.color} uppercase tracking-wider`}>
                                {rarityConfig.label}
                            </span>
                            <span className="text-[9px] text-stone-600 font-mono">Lvl {currentTier}</span>
                        </div>
                        <div className={`text-[9px] flex items-center gap-1 mt-1 font-mono font-medium ${isExpired ? 'text-red-500' : daysRemaining <= 3 ? 'text-orange-400' : 'text-stone-400'}`}>
                            <Timer size={10} />
                            <span>{formatTimeLeft(timeLeftMs)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className={`px-1.5 py-0.5 rounded border text-[9px] flex items-center gap-1 shadow-sm ${isOverclockActive ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : (globalMultiplier > 1 || reactorMultiplier > 1) ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'}`}>
                            <Clock size={10} />
                            <span className={isOverclockActive ? 'text-emerald-300 font-bold' : ''}>+{formatCurrency(totalDailyProfit)}/{t('time.day')}</span>
                            {isOverclockActive && <Zap size={10} className="text-yellow-400 animate-pulse" />}
                        </div>
                        {isOverclockActive && (
                            <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-extrabold bg-emerald-950 border border-emerald-500 px-2 py-0.5 rounded animate-[pulse_1s_infinite] shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                                ⚡ {t('rig.overclock_active')}
                            </div>
                        )}
                        <div className="flex flex-col items-end mb-1">
                            {rig.bonusProfit > 0 && !['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(nameStr) && (
                                <div className={`text-[9px] ${rarityConfig.color} flex items-center gap-1 font-bold`}>
                                    <Zap size={8} />
                                    {t('shop.bonus')} +{formatCurrency(rig.bonusProfit)}
                                </div>
                            )}
                            {equippedBonus > 0 && (
                                <div className="text-[9px] text-blue-400 flex items-center gap-1 font-bold">
                                    <Briefcase size={8} />
                                    {t('rig.equipment_bonus')} +{formatCurrency(equippedBonus)}
                                </div>
                            )}
                        </div>

                        {/* GLOVE SLOT (Index 0) - Back in Header */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isExploring) return;
                                if (onManageAccessory) onManageAccessory(rig.id, 0);
                                else if (onManageGlove) onManageGlove(rig.id);
                            }}
                            className={`group/glove w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative shadow-lg
                        ${gloveItem
                                    ? 'border-yellow-400 bg-stone-800 shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                                    : 'border-yellow-900/30 border-dashed bg-stone-950/20 hover:border-yellow-600/50'
                                }`}
                        >
                            {gloveItem ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {(() => {
                                        const safeRarity = gloveItem.rarity && RARITY_SETTINGS[gloveItem.rarity] ? gloveItem.rarity : 'COMMON';
                                        return (
                                            <>
                                                <div className={`absolute inset-0 bg-gradient-to-br ${RARITY_SETTINGS[safeRarity].bgGradient} opacity-30`}></div>
                                                <InfinityGlove rarity={safeRarity} size={24} className="relative z-10 drop-shadow-md" />
                                            </>
                                        );
                                    })()}
                                    {gloveItem.level && gloveItem.level > 1 && (
                                        <span className="absolute -bottom-0.5 right-0 text-[8px] font-bold bg-black/80 text-yellow-500 px-1 rounded-tl-md">+{gloveItem.level}</span>
                                    )}

                                    {/* Tooltip */}
                                    <div className="absolute right-full top-0 mr-2 z-[60] bg-stone-900/95 text-xs text-white p-2 rounded-lg border border-yellow-500/30 shadow-xl opacity-0 hover:opacity-100 group-hover/glove:opacity-100 pointer-events-none transition-opacity min-w-[120px] backdrop-blur-sm">
                                        <div className="font-bold text-yellow-500 mb-1">{getLocalized(gloveItem.name)}</div>
                                        <div className="text-[10px] text-yellow-400 flex items-center gap-1">
                                            <Star size={10} />
                                            {t('shop.bonus')}: {formatBonus(gloveItem.dailyBonus, gloveItem.typeId)} / {t('time.day')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <InfinityGlove rarity="COMMON" size={20} className="grayscale opacity-20 text-stone-500" />
                            )}
                            {gloveItem && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 animate-[pulse_2s_infinite] pointer-events-none"></div>}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex z-10 flex-1 ${isExpired || isBroken || !isPowered || isExploring ? 'opacity-50 grayscale' : ''} relative p-3 gap-3`}>

                    {/* LEFT SIDEBAR: Battery & 4 Accessory Slots */}
                    <div className="flex flex-col items-center gap-3 pr-2 border-r border-stone-800/30">
                        <div className="flex flex-col items-center gap-2 mb-1 w-full max-w-[100px]">
                            {/* TOP: Battery (Energy Only) */}
                            <BatteryUI percent={energyPercent} colorClass={energyColor} isEnergy={true} />

                            {/* CHARGE BUTTON - Next to Battery */}
                            {!isZeroEnergy && (
                                <button
                                    onClick={handleChargeClick}
                                    disabled={isExploring || energyPercent >= 100}
                                    className={`w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center hover:bg-stone-800 transition-all group/charge relative shadow-lg backdrop-blur-sm ${isOutOfEnergy ? 'animate-bounce border-emerald-500' : ''} disabled:opacity-30`}
                                    title={`${t('rig.refill')}: ${formatCurrency(effectiveEnergyCostPerDay)}/${t('time.day')}${uniformId ? ' (-5%)' : ''}`}
                                >
                                    <Zap size={18} className={`text-emerald-400 transition-transform group-hover/charge:scale-110 ${isOutOfEnergy ? 'animate-pulse' : ''}`} />
                                    {isOutOfEnergy && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-black" />}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {equippedItems.slice(1, 5).map((item, index) => {
                                const actualIndex = index + 1;
                                return (
                                    <div
                                        key={actualIndex}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isExploring) return;
                                            if (onManageAccessory) {
                                                onManageAccessory(rig.id, actualIndex);
                                            } else {
                                                if (item && onUnequipSlot) onUnequipSlot(rig.id, actualIndex);
                                                else if (!item && onEquipSlot) onEquipSlot(rig.id, actualIndex);
                                            }
                                        }}
                                        className={`group/item w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative
                                        ${item
                                                ? 'border-yellow-400 bg-stone-800 shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                                : 'border-white/10 border-dashed bg-black/40 hover:border-white/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                            }`}
                                    >
                                        {item ? (
                                            <div className="relative w-full h-full flex items-center justify-center bg-stone-800/50 rounded-lg">
                                                {(() => {
                                                    const nameRaw = item.name;
                                                    const enName = typeof nameRaw === 'object' ? (nameRaw as any).en || '' : String(nameRaw || '');
                                                    const thName = typeof nameRaw === 'object' ? (nameRaw as any).th || '' : String(nameRaw || '');

                                                    const typeIdLower = (item.typeId || '').toLowerCase();

                                                    let IconComp = InfinityGlove;
                                                    let colorClass = "text-yellow-100 drop-shadow-sm";

                                                    // priority check by name
                                                    if (typeIdLower.startsWith('hat') || thName.includes('หมวก') || enName.includes('Helmet')) { IconComp = HardHat; colorClass = "text-emerald-400"; }
                                                    else if (typeIdLower.startsWith('glasses') || thName.includes('แว่น') || enName.includes('Glasses')) { IconComp = Glasses; colorClass = "text-blue-400"; }
                                                    else if (typeIdLower.startsWith('uniform') || typeIdLower.startsWith('shirt') || thName.includes('ชุด') || enName.includes('Uniform') || enName.includes('Suit')) { IconComp = Shirt; colorClass = "text-orange-400"; }
                                                    else if (typeIdLower.startsWith('bag') || thName.includes('กระเป๋า') || enName.includes('Bag') || enName.includes('Backpack')) { IconComp = Backpack; colorClass = "text-purple-400"; }
                                                    else if (typeIdLower.startsWith('boots') || thName.includes('รองเท้า') || enName.includes('Boots')) { IconComp = Footprints; colorClass = "text-yellow-400"; }
                                                    else if (typeIdLower.startsWith('mobile') || thName.includes('มือถือ') || enName.includes('Mobile')) { IconComp = Smartphone; colorClass = "text-cyan-400"; }
                                                    else if (typeIdLower.startsWith('pc') || thName.includes('คอม') || enName.includes('PC')) { IconComp = Monitor; colorClass = "text-rose-400"; }
                                                    else if (typeIdLower.startsWith('robot') || thName.includes('หุ่นยนต์') || enName.includes('Robot')) { IconComp = Bot; colorClass = "text-fuchsia-400"; }
                                                    else if (typeIdLower === 'auto_excavator' || thName.includes('ระบบล็อค')) { IconComp = Zap; colorClass = "text-indigo-400"; }
                                                    else if (typeIdLower === 'upgrade_chip' || thName.includes('ชิป')) { IconComp = Cpu; colorClass = "text-blue-500"; }
                                                    else if (typeIdLower === 'mixer' || thName.includes('เครื่องผสม')) { IconComp = Factory; colorClass = "text-amber-500"; }
                                                    else if (typeIdLower === 'magnifying_glass' || thName.includes('แว่นขยาย')) { IconComp = Search; colorClass = "text-sky-400"; }

                                                    if (IconComp === InfinityGlove) {
                                                        return <InfinityGlove size={22} rarity={item.rarity} />;
                                                    }
                                                    return <IconComp size={20} className={colorClass} />;
                                                })()}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 animate-[pulse_3s_infinite] pointer-events-none rounded-lg overflow-hidden"></div>

                                                {/* Level Badge (+X) */}
                                                {item.level && item.level > 1 && (
                                                    <div className="absolute -top-1 -right-1 z-20 px-1 py-[1px] rounded-[2px] bg-black text-cyan-400 text-[8px] font-bold border border-cyan-500/50 font-mono shadow-sm">
                                                        +{item.level}
                                                    </div>
                                                )}

                                                {/* Tooltip for Accessories */}
                                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] bg-stone-900/95 text-xs text-white p-2 rounded-lg border border-stone-700 shadow-xl opacity-0 group-hover/item:opacity-100 hover:opacity-100 pointer-events-none transition-opacity min-w-[140px] backdrop-blur-sm whitespace-nowrap">
                                                    <div className="font-bold text-yellow-500 mb-1">{getLocalized(item.name)}</div>
                                                    {item.specialEffect && (
                                                        <div className="text-[9px] text-emerald-400 mb-1 font-bold">
                                                            {item.specialEffect}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-yellow-400 flex items-center gap-1">
                                                        <Star size={10} />
                                                        <span className="font-mono">
                                                            {t('rig.bonus')}: {formatBonus(item.dailyBonus, item.typeId)} / {t('time.day')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Plus size={12} className="text-white/10 group-hover/item:text-white/30 transition-colors" />
                                        )}
                                        {/* Glowing edge effect (Matching Battery) */}
                                        <div className={`absolute inset-[-2px] rounded-lg -z-10 blur-[10px] opacity-0 group-hover/item:opacity-70 transition-opacity ${item ? 'bg-yellow-500/50' : 'bg-white/20'}`}></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative min-h-[160px]">

                        {/* Center-Top Status Bar (Health/Durability) */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 group/health">
                            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5 shadow-lg">
                                <Wrench size={10} className={`${healthPercent <= 20 ? 'text-red-500 animate-pulse' : 'text-stone-300'} drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]`} />

                                <div className="flex gap-[2px] items-center">
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const segmentThreshold = (i + 1) * 10;
                                        const isFilled = healthPercent >= segmentThreshold;

                                        let segColor = 'bg-stone-800';
                                        if (isFilled) {
                                            if (healthPercent > 80) segColor = 'bg-[#4ADE80] shadow-[0_0_5px_rgba(74,222,128,0.5)]'; // Green
                                            else if (healthPercent > 60) segColor = 'bg-[#A3E635] shadow-[0_0_5px_rgba(163,230,53,0.5)]'; // Yellow-Green
                                            else if (healthPercent > 40) segColor = 'bg-[#EAB308] shadow-[0_0_5px_rgba(234,179,8,0.5)]'; // Yellow
                                            else if (healthPercent > 20) segColor = 'bg-[#F97316] shadow-[0_0_5px_rgba(249,115,22,0.5)]'; // Orange
                                            else segColor = 'bg-[#EF4444] shadow-[0_0_5px_rgba(239,68,68,0.5)] animate-pulse'; // Red
                                        }

                                        return (
                                            <div
                                                key={i}
                                                className={`h-1.5 w-2 sm:w-2.5 rounded-[1px] transition-all duration-500 ${segColor}`}
                                            />
                                        );
                                    })}
                                </div>
                                <span className={`text-[9px] font-mono leading-none ${healthPercent <= 20 ? 'text-red-400 font-bold' : 'text-stone-400'}`}>
                                    {Math.ceil(healthPercent)}%
                                </span>
                            </div>
                        </div>

                        {/* Animation (Centered) */}
                        <div className="flex-1 flex items-center justify-center">
                            <OilRigAnimation
                                isActive={!isExpired && !isBroken && !isExploring && !isOutOfEnergy}
                                rarity={rig.rarity}
                                tier={currentTier}
                                rigName={getLocalized(rig.name)}
                                isOverclockActive={isOverclockActive}
                            />

                        </div>
                    </div>

                    {!isExpired && (
                        <div className="absolute top-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-auto">

                            {/* REPAIR BUTTON (Aligned with Battery) */}
                            {!isInfiniteDurability && !isVibranium && (
                                <button
                                    onClick={handleRepairClick}
                                    disabled={isExploring}
                                    className={`guide-repair-btn w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center hover:bg-stone-800 transition-all group/repair relative shadow-lg backdrop-blur-sm ${isBroken ? 'animate-bounce border-red-500' : ''}`}
                                    title={`${t('rig.repair_now')}: ${formatCurrency(repairCost)}`}
                                >
                                    <Wrench size={18} className={`${styles.wrench} transition-transform group-hover/repair:rotate-45`} />
                                    {isBroken && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-black" />}
                                </button>
                            )}

                            {/* AI Robot (Below Repair) */}
                            {aiRobotItem && (
                                <div className="group/robot relative flex flex-col items-center mt-1">
                                    <div className="bg-gradient-to-br from-yellow-700/80 to-yellow-900/80 p-1.5 rounded-full border border-yellow-500/30 shadow-lg animate-[pulse_3s_ease-in-out_infinite] backdrop-blur-sm cursor-help">
                                        <Bot size={16} className="text-yellow-100" />
                                    </div>
                                    <div className="absolute right-full top-0 mr-2 bg-stone-950/90 rounded px-2 py-1 border border-yellow-900/50 shadow-xl backdrop-blur-md opacity-0 group-hover/robot:opacity-100 transition-opacity pointer-events-none w-max">
                                        <span className="text-[10px] text-yellow-500 font-mono font-bold flex items-center justify-center gap-1 leading-none">
                                            <Zap size={10} className="animate-bounce" /> {formatSimpleTime(aiRobotTimeLeft)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isExpired && !(preset?.specialProperties?.noGift) && (
                        <div className="absolute bottom-3 right-3 z-20 pointer-events-auto flex items-end gap-1">
                            {/* Key Indicator (Added Next to Gift) */}
                            <div className={`relative flex items-center justify-center w-9 h-9 transition-all duration-300 ${hasKey ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] scale-100' : 'text-stone-700 opacity-20 scale-75'}`}>
                                <Key size={18} strokeWidth={2.5} className="transform -rotate-45" />
                                {keyCount > 0 && (
                                    <div className="absolute -top-1 -right-0.5 bg-stone-900 text-yellow-500 text-[10px] font-bold px-1 rounded-full border border-yellow-500/30 min-w-[16px] text-center shadow-md leading-3">
                                        {keyCount}
                                    </div>
                                )}
                            </div>

                            {/* Material Box (Bottom Right) */}
                            <div className="relative flex items-center justify-center w-11 h-11">
                                {/* Info Button to show loot table always */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowLootTable(prev => !prev); }}
                                    className="absolute -top-3 -right-1 z-30 p-1 bg-stone-900/80 border border-stone-700 rounded-full text-stone-500 hover:text-yellow-500 hover:border-yellow-500/50 transition-all backdrop-blur-sm shadow-lg"
                                    title={t('loot.possible_rewards')}
                                >
                                    <Info size={12} />
                                </button>

                                {isGiftAvailable ? (
                                    <div onClick={handleGiftClick} className="cursor-pointer transition-transform hover:scale-110 active:scale-95">
                                        <div className="relative animate-[bounce_1s_infinite]">
                                            <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-lg animate-pulse"></div>
                                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded-lg border border-white shadow-lg relative h-9 w-9 flex items-center justify-center">
                                                <div className="text-white font-extrabold text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">?</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => setShowLootTable(prev => !prev)} className="group/gift relative cursor-pointer active:scale-95 transition-transform">
                                        <div className="bg-stone-800 p-1 rounded-lg border border-stone-600 shadow-inner relative flex flex-col items-center justify-center w-9 h-9 opacity-80 hover:opacity-100 transition-opacity">
                                            <span className="text-stone-500 font-bold mb-0.5 text-sm">?</span>
                                            <span className="text-[7px] font-mono text-stone-400 font-bold absolute bottom-1 leading-none tracking-tighter">{formatGiftCooldown(timeUntilGift)}</span>
                                        </div>
                                        <svg className="absolute -inset-1 w-[44px] h-[44px] -rotate-90 pointer-events-none">
                                            <circle cx="22" cy="22" r="18" fill="none" className="stroke-stone-800/50" strokeWidth="2" />
                                            <circle cx="22" cy="22" r="18" fill="none" className="stroke-emerald-500/30 transition-all duration-1000" strokeWidth="2" strokeDasharray="113" strokeDashoffset={113 - (113 * nextGiftProgress / 100)} strokeLinecap="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>


                {isBroken && !isExpired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-[1px]">
                        <div className="bg-red-900/80 px-3 py-1.5 rounded border border-red-500 text-red-100 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl animate-pulse">
                            <AlertTriangle size={14} /> {t('rig.broken')}
                        </div>
                    </div>
                )}

                {/* Ticker & Action */}
                <div className="mt-auto z-10 p-3 pt-0 space-y-2.5">

                    {!isExpired && (
                        <div className={`mb-2 flex items-center justify-between p-1.5 rounded-lg border-2 transition-all ${currentMaterials > 0 ? 'bg-stone-950 border-yellow-600/80 shadow-[0_4px_12px_rgba(234,179,8,0.1)]' : 'bg-stone-950/30 border-stone-800/50'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`relative w-10 h-10 rounded-lg border-2 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] ${currentMaterials > 0 ? 'bg-stone-900 border-yellow-500' : 'bg-stone-950 border-stone-800'}`}>
                                    {currentMaterials > 0 ? (
                                        <Key size={18} className="text-yellow-400 drop-shadow-[0_0_8px_gold]" />
                                    ) : (
                                        <Key size={18} className="text-stone-800" />
                                    )}
                                    {currentMaterials > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-stone-900 shadow-md animate-bounce">
                                            1
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${currentMaterials > 0 ? 'text-yellow-400' : 'text-stone-400'}`}>
                                        {currentMaterials > 0 ? t('rig.mining_key') : t('rig.waiting_discovery')}
                                    </span>
                                    <div className="flex gap-2 text-[10px] items-center mt-0.5">
                                        {currentMaterials > 0 ? <span className="text-red-500 font-extrabold tracking-wider bg-red-950/30 px-1 rounded">{language === 'th' ? 'เต็ม (FULL)' : 'FULL'}</span> : <span className="text-stone-600">{t('rig.capacity')} 1</span>}
                                    </div>
                                </div>
                            </div>

                            {currentMaterials > 0 && !isExploring && (
                                <button
                                    onClick={handleCollectMaterialsClick}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-lg transition-all active:scale-95 flex items-center gap-1"
                                >
                                    <ArrowDownToLine size={14} /> {t('rig.collect')}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-end px-1 border-t border-stone-800/50 pt-3">
                        <div className="text-right w-full">
                            <div className={`text-xl font-mono font-bold tabular-nums flex items-center justify-end gap-1 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]`}>
                                {isOverclockActive && <span className="text-emerald-400 text-xs mr-0.5 animate-pulse">x2</span>}
                                {formatCurrency(currentAmount, { showDecimals: true, precision: 4 })} <Sparkles size={12} className={!isExpired && !isBroken && isPowered && !isExploring ? "text-yellow-500" : "hidden"} />
                            </div>
                        </div>
                    </div>

                    {isRenewable && !isRenewConfirming && !preset?.specialProperties?.cannotRenew ? (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleClaimClick}
                                disabled={(isExpired || isBroken || !effectiveIsPowered || isExploring) && currentAmount <= 0}
                                className="font-bold py-2 rounded border border-stone-600 bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
                            >
                                <Coins size={14} /> {t('rig.collect')}
                            </button>
                            <button
                                onClick={handleRenewClick}
                                disabled={isExploring}
                                className="font-bold py-2 rounded border border-blue-500 bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-blue-900/20 active:scale-95"
                            >
                                <RefreshCw size={14} /> {t('rig.pay')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                if (isExploring) return;
                                if (isBroken && !isExpired) handleRepairClick(e);
                                else handleClaimClick();
                            }}
                            disabled={(isExpired || (!isBroken && !effectiveIsPowered) || isExploring) && currentAmount <= 0}
                            className={`w-full font-bold py-2 rounded border transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-display uppercase tracking-wider
                        ${isExpired
                                    ? 'bg-stone-800 text-stone-600 border-stone-700 cursor-not-allowed'
                                    : isExploring
                                        ? 'bg-purple-900/20 text-purple-500 border-purple-900/50 cursor-not-allowed'
                                        : isBroken
                                            ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer'
                                            : !effectiveIsPowered
                                                ? 'bg-orange-900/20 text-orange-500 border-orange-900/50 cursor-not-allowed'
                                                : currentTier === 7
                                                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]'
                                                    : currentTier >= 5
                                                        ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)]'
                                                        : currentTier === 4
                                                            ? 'bg-gradient-to-r from-orange-700 to-orange-600 text-white border-orange-500 hover:brightness-110'
                                                            : currentTier === 3
                                                                ? 'bg-gradient-to-r from-sky-700 to-sky-600 text-white border-sky-500 hover:brightness-110 shadow-[0_0_15px_rgba(2,132,199,0.3)]'
                                                                : currentTier === 2
                                                                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-emerald-500 hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600'
                                }
                      `}
                        >
                            {isExploring ? (
                                <><Skull size={18} /> {language === 'th' ? 'กำลังสำรวจ...' : 'Exploring...'}</>
                            ) : isBroken && !isExpired && !isVibranium ? (
                                <><Wrench size={18} /> {t('rig.repair_now')} ({formatCurrency(baseRepairCost)})</>
                            ) : !effectiveIsPowered && !isExpired ? (
                                <><ZapOff size={18} /> {t('rig.out_of_energy')}</>
                            ) : (
                                <><Coins size={18} strokeWidth={2.5} /> {isExpired ? t('rig.expired') : t('rig.claim_rent')}</>
                            )}
                        </button>
                    )}

                    {isExpired && (
                        <button
                            onClick={handleDestroyClick}
                            className="w-full font-bold py-2 rounded border border-red-500 bg-red-900/20 hover:bg-red-500 text-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                            <Trash2 size={18} /> {t('rig.destroy')}
                        </button>
                    )}
                </div>
            </div>

            {/* Loot Table Overlay - Moved to cover WHOLE card */}
            {showLootTable && preset && RIG_LOOT_TABLES[preset.id] && (
                <div className="absolute inset-0 z-[100] bg-stone-950/98 backdrop-blur-xl rounded-xl p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowLootTable(false); }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center mb-5">
                        <div className="bg-yellow-500/10 p-4 rounded-full mb-3 border border-yellow-500/20">
                            <Package className="text-yellow-500" size={32} />
                        </div>
                        <h4 className="text-stone-200 text-base font-bold uppercase tracking-widest">{t('loot.possible_rewards')}</h4>
                        <p className="text-yellow-500/60 text-[10px] uppercase font-mono mt-1 border-t border-yellow-500/20 pt-1">{getLocalized(preset.name)}</p>
                    </div>

                    <div className="w-full space-y-2 max-h-[220px] overflow-y-auto px-2 custom-scrollbar">
                        {RIG_LOOT_TABLES[preset.id].map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-stone-900/50 border border-stone-800/50 hover:bg-stone-900 transition-colors">
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${MATERIAL_CONFIG.COLORS[entry.matTier as keyof typeof MATERIAL_CONFIG.COLORS] || 'text-stone-300'}`}>
                                        {getLocalized(MATERIAL_CONFIG.NAMES[entry.matTier])}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter opacity-60">{t('rig.amount')}</span>
                                        <span className="text-xs text-white font-mono font-bold">
                                            x{entry.minAmount === entry.maxAmount ? entry.minAmount : `${entry.minAmount}-${entry.maxAmount}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-yellow-500/60 uppercase font-bold tracking-tighter">{t('loot.chance')}</span>
                                    <span className="text-sm font-mono font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{entry.chance}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowLootTable(false); }}
                        className="mt-6 w-full py-2.5 rounded bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                        {t('common.close')}
                    </button>
                </div>
            )}
        </div>
    );
};
