
import React, { useEffect, useState, useRef } from 'react';
import { OilRig, AccessoryItem } from '../services/types';
import { OilRigAnimation } from './OilRigAnimation';
import { BASE_CLAIM_AMOUNT, CURRENCY, RARITY_SETTINGS, GIFT_CYCLE_DAYS, RENEWAL_CONFIG, REPAIR_CONFIG, MATERIAL_CONFIG, RIG_PRESETS, MAX_SLOTS_PER_RIG, DEMO_SPEED_MULTIPLIER, EQUIPMENT_SERIES } from '../constants';
import { Pickaxe, Clock, Coins, Sparkles, Zap, Timer, Crown, Hexagon, Check, X, Gift, Briefcase, RefreshCw, AlertTriangle, Wrench, Hammer, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, ShoppingBag, BoxSelect, Info, Lock, Key, ArrowDownToLine, ZapOff, CheckCircle2, CalendarClock, Eye, Truck, Plus, Cpu, Trash2, Skull } from 'lucide-react';
import { InfinityGlove } from './InfinityGlove';
import { MaterialIcon } from './MaterialIcon';
import { MockDB } from '../services/db';

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
    globalMultiplier?: number;
    isPowered?: boolean;
    isExploring?: boolean;
    isDemo?: boolean;
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
    globalMultiplier = 1,
    isPowered = true,
    isExploring = false,
    isDemo = false
}) => {
    const [currentAmount, setCurrentAmount] = useState(BASE_CLAIM_AMOUNT);
    const [currentMaterials, setCurrentMaterials] = useState(rig.currentMaterials || 0);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRenewConfirming, setIsRenewConfirming] = useState(false);
    const [isRepairConfirming, setIsRepairConfirming] = useState(false);

    const [isRepairing, setIsRepairing] = useState(false);
    const [showRestored, setShowRestored] = useState(false);
    const [showRenewed, setShowRenewed] = useState(false);

    const lastUpdateRef = useRef<number>(Date.now());
    const requestRef = useRef<number | null>(null);
    const materialIntervalRef = useRef<number | null>(null);

    const speedMultiplier = isDemo ? DEMO_SPEED_MULTIPLIER : 1;
    const rarityConfig = RARITY_SETTINGS[rig.rarity || 'COMMON'];

    let equippedBonus = 0;
    const equippedItems = (rig.slots || Array(MAX_SLOTS_PER_RIG).fill(null)).map(itemId => {
        if (!itemId) return null;
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            equippedBonus += item.dailyBonus;
        }
        return item;
    });

    const gloveItem = equippedItems[0];

    const totalDailyProfit = (rig.dailyProfit + (rig.bonusProfit || 0) + equippedBonus) * globalMultiplier;
    const totalRatePerSecond = totalDailyProfit / 86400;

    const tier = (investment: number) => {
        if (investment === 0) return 6; // Special Tier (Vibranium)
        if (investment >= 3000) return 5;
        if (investment >= 2500) return 4;
        if (investment >= 2000) return 3;
        if (investment >= 1500) return 2;
        return 1;
    };
    const currentTier = tier(rig.investment);

    const getResourceName = () => {
        switch (currentTier) {
            case 6: return 'ไวเบรเนียม';
            case 5: return 'เพชร';
            case 4: return 'ทองคำ';
            case 3: return 'เหล็ก';
            case 2: return 'ทองแดง';
            default: return 'ถ่านหิน';
        }
    };

    const getAccessoryIcon = (item: AccessoryItem, className: string) => {
        switch (item.typeId) {
            case 'hat': return <HardHat className={className} />;
            case 'glasses': return <Glasses className={className} />;
            case 'uniform': return <Shirt className={className} />;
            case 'bag': return <Backpack className={className} />;
            case 'boots': return <Footprints className={className} />;
            case 'mobile': return <Smartphone className={className} />;
            case 'pc': return <Monitor className={className} />;
            case 'robot': return <Bot className={className} />;
            case 'auto_excavator': return <Truck className={className} />;
            case 'upgrade_chip': return <Cpu className={className} />;
            default: return <InfinityGlove rarity={item.rarity} className={className} />;
        }
    };

    const preset = RIG_PRESETS.find(p => p.name === rig.name) || RIG_PRESETS.find(p => p.price === rig.investment);
    const isInfiniteDurability = preset?.specialProperties?.infiniteDurability;
    const isZeroEnergy = preset?.specialProperties?.zeroEnergy;

    const baseDurationMs = (rig.durationMonths * 30 * 24 * 60 * 60 * 1000) / speedMultiplier;
    // If Infinite Durability (999 months), show as infinite
    const isInfiniteContract = rig.durationMonths >= 900;

    const bonusDurationMs = (durationBonusDays * 24 * 60 * 60 * 1000) / speedMultiplier;
    const expiryTime = rig.purchasedAt + baseDurationMs + bonusDurationMs;

    const now = Date.now();
    const timeLeftMs = Math.max(0, expiryTime - now);
    const isExpired = !isInfiniteContract && timeLeftMs <= 0;

    const durabilityMs = (REPAIR_CONFIG.DURABILITY_DAYS * 24 * 60 * 60 * 1000) / speedMultiplier;
    const lastRepair = rig.lastRepairAt || rig.purchasedAt;
    const timeSinceRepair = now - lastRepair;
    const healthPercent = isInfiniteDurability ? 100 : Math.max(0, 100 - (timeSinceRepair / durabilityMs * 100));
    const isBroken = !isInfiniteDurability && healthPercent <= 0;

    let baseRepairCost = preset ? preset.repairCost : Math.floor(rig.investment * 0.06);

    const session = MockDB.getSession();
    const currentUser = session ? MockDB.getAllUsers().find(u => u.id === session.id) : null;
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
                const match = series.stat.match(/-(\d+)%/);
                if (match) {
                    const p = parseInt(match[1]);
                    discountMultiplier += (p / 100);
                    hatDiscountText = `(Hat -${p}%)`;
                }
            }
        }
    }

    const repairCost = Math.floor(baseRepairCost * (1 - discountMultiplier));

    const daysRemaining = (timeLeftMs / (1000 * 60 * 60 * 24)) * speedMultiplier; // Display as normal days
    const isRenewable = !isInfiniteContract && daysRemaining <= RENEWAL_CONFIG.WINDOW_DAYS && (rig.renewalCount || 0) < RENEWAL_CONFIG.MAX_RENEWALS;
    const renewalDiscount = RENEWAL_CONFIG.DISCOUNT_PERCENT;
    const renewalCost = rig.investment * (1 - renewalDiscount);

    // Override IsPowered
    const effectiveIsPowered = isPowered || !!isZeroEnergy;

    const giftIntervalMs = (GIFT_CYCLE_DAYS * 24 * 60 * 60 * 1000) / speedMultiplier;
    const lastGiftTime = rig.lastGiftAt || rig.purchasedAt;
    const nextGiftTime = lastGiftTime + giftIntervalMs;
    const isGiftAvailable = !isExpired && (now >= nextGiftTime);
    const timeUntilGift = Math.max(0, nextGiftTime - now);
    const nextGiftProgress = Math.min(100, ((now - lastGiftTime) / giftIntervalMs) * 100);

    const hasKey = inventory.some(i => i.typeId === 'chest_key');
    const aiRobotItem = inventory.find(i => i.typeId === 'robot');
    const aiRobotTimeLeft = aiRobotItem ? Math.max(0, aiRobotItem.expireAt - Date.now()) : 0;

    const formatTimeLeft = (ms: number) => {
        // Correct display logic based on speed?
        // If we want to show "Actual Real Time Remaining", just use ms.
        // If we want to show "Game Time Remaining", multiply by speedMultiplier.
        // Usually UI shows "Game Time".
        const gameMs = ms * speedMultiplier;

        if (isInfiniteContract) return 'ถาวร (∞)';
        if (gameMs <= 0) return 'หมดสัญญา';
        const days = Math.floor(gameMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gameMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((gameMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}วัน ${hours}ชม.`;
        // For demo, we might want to see seconds if it's very fast?
        // But "24h -> 2min". 1 day game time = 2 min real time.
        // If we show "Days", it's consistent.
        return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor((gameMs % (1000 * 60)) / 1000).toString().padStart(2, '0')}`;
    };

    const formatGiftCooldown = (ms: number) => {
        const gameMs = ms * speedMultiplier;
        const days = Math.floor(gameMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gameMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}วัน`;
        if (hours > 0) return `${hours}ชม.`;
        const minutes = Math.floor((gameMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes}น.`;
    };

    const formatSimpleTime = (ms: number) => {
        const gameMs = ms * speedMultiplier;
        const days = Math.floor(gameMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gameMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}วัน`;
        return `${hours}ชม.`;
    }

    const animate = () => {
        const now = Date.now();
        const timeElapsedSeconds = ((now - rig.lastClaimAt) / 1000) * speedMultiplier;
        if (!isExpired && !isBroken && effectiveIsPowered && !isExploring) {
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

    useEffect(() => {
        if (rig.currentMaterials !== undefined) {
            setCurrentMaterials(rig.currentMaterials);
        }
        if (!isExpired && !isBroken && effectiveIsPowered && !isExploring) {
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
            }, MATERIAL_CONFIG.DROP_INTERVAL_MS);
        }
        return () => {
            if (materialIntervalRef.current) clearInterval(materialIntervalRef.current);
        };
    }, [isExpired, isBroken, effectiveIsPowered, rig.id, rig.currentMaterials, isExploring]);

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

    const handleGiftClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isGiftAvailable) {
            if (hasKey) onClaimGift(rig.id);
            else alert('คุณต้องมี "กุญแจไขหีบ" เพื่อเปิดหีบสมบัติ (ซื้อได้ที่ร้านค้า ราคา 5 บาท)');
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
            case 6: return { container: 'bg-stone-950 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]', headerBg: 'bg-gradient-to-r from-purple-950 via-stone-900 to-stone-900', accentColor: 'text-purple-400', icon: <Cpu size={14} className="text-purple-400 animate-pulse" />, wrench: 'hidden' };
            case 5: return { container: 'bg-stone-950 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.3)]', headerBg: 'bg-gradient-to-r from-yellow-900/50 via-stone-900 to-stone-900', accentColor: 'text-yellow-400', icon: <Crown size={14} className="text-yellow-400 fill-yellow-400/20" />, wrench: 'text-cyan-400 drop-shadow-[0_0_5px_cyan]' };
            case 4: return { container: 'bg-stone-950 border-orange-700 shadow-[0_0_20px_rgba(194,65,12,0.2)]', headerBg: 'bg-gradient-to-r from-orange-950 via-stone-900 to-stone-900', accentColor: 'text-orange-500', icon: <Hexagon size={14} className="text-orange-500" />, wrench: 'text-yellow-400 drop-shadow-[0_0_3px_gold]' };
            case 3: return { container: 'bg-stone-950 border-sky-600 shadow-[0_0_20px_rgba(2,132,199,0.25)]', headerBg: 'bg-gradient-to-r from-sky-950 via-stone-900 to-stone-900', accentColor: 'text-sky-400', icon: <Pickaxe size={14} className="text-sky-500" />, wrench: 'text-slate-300' };
            case 2: return { container: 'bg-stone-950 border-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)]', headerBg: 'bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900', accentColor: 'text-emerald-400', icon: <Pickaxe size={14} className="text-emerald-500" />, wrench: 'text-orange-600' };
            default: return { container: 'bg-stone-950 border-stone-800 shadow-md', headerBg: 'bg-stone-900', accentColor: 'text-stone-400', icon: <Pickaxe size={14} className="text-stone-600" />, wrench: 'text-stone-500' };
        }
    };

    const styles = getTierStyles();

    let healthColor = 'bg-emerald-500';
    if (healthPercent <= 20) healthColor = 'bg-red-500 animate-pulse';
    else if (healthPercent <= 50) healthColor = 'bg-yellow-500';

    return (
        <div className={`relative rounded-xl p-0.5 transition-all duration-300 sm:hover:-translate-y-1 group overflow-hidden border 
        ${globalMultiplier > 1 ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : styles.container.replace('bg-stone-950', '').replace('shadow-', '') + ' ' + styles.container}
    `}>

            <div className={`absolute inset-0 bg-stone-950`}></div>
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 
          ${globalMultiplier > 1 ? 'bg-purple-500 opacity-40 animate-pulse' :
                    currentTier >= 5 ? 'bg-yellow-500' : currentTier === 4 ? 'bg-orange-500' : currentTier === 3 ? 'bg-sky-500' : currentTier === 2 ? 'bg-emerald-500' : 'bg-stone-700'}
      `}></div>

            {/* Confirmation Overlays */}
            {isConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-yellow-500/10 p-3 rounded-full mb-3">
                        <Coins className="text-yellow-500 animate-pulse" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">ยืนยันการเก็บเกี่ยว</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">{currentAmount.toFixed(4)}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">ยกเลิก</button>
                        <button onClick={confirmClaim} className="py-2.5 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> ยืนยัน</button>
                    </div>
                </div>
            )}

            {isExploring && (
                <div className="absolute inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-purple-500/20 p-4 rounded-full mb-4 animate-[pulse_2s_infinite]">
                        <Skull className="text-purple-400" size={32} />
                    </div>
                    <h4 className="text-purple-300 font-bold text-lg uppercase tracking-wider mb-2">กำลังสำรวจดันเจี้ยน</h4>
                    <p className="text-purple-200/60 text-xs px-4">เครื่องจักรนี้หยุดทำงานชั่วคราวเพื่อสำรวจพื้นที่ลึกลับ</p>
                </div>
            )}

            {isRenewConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-blue-500/10 p-3 rounded-full mb-3">
                        <RefreshCw className="text-blue-500 animate-spin-slow" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">ยืนยันการต่ออายุ</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">-{renewalCost.toLocaleString()}</div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRenewConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">ยกเลิก</button>
                        <button onClick={confirmRenew} className="py-2.5 rounded bg-blue-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> ชำระเงิน</button>
                    </div>
                </div>
            )}

            {isRepairConfirming && (
                <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 text-center">
                    <div className="bg-red-500/10 p-3 rounded-full mb-3">
                        <Wrench className="text-red-500 animate-bounce" size={24} />
                    </div>
                    <h4 className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">ยืนยันการซ่อมแซม</h4>
                    <div className="text-2xl font-mono font-bold text-white mb-1 tabular-nums">-{repairCost.toLocaleString()}</div>
                    {hasSilverBuff && <div className="text-xs text-stone-500">(Silver Miner -5%)</div>}
                    {hatDiscountText && <div className="text-xs text-emerald-400">{hatDiscountText}</div>}
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRepairConfirming(false); }} className="py-2.5 rounded border border-stone-700 bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider">ยกเลิก</button>
                        <button onClick={confirmRepair} className="py-2.5 rounded bg-red-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"><Check size={14} /> ซ่อมทันที</button>
                    </div>
                </div>
            )}

            {isRepairing && (
                <div className="absolute inset-0 z-50 bg-stone-950/90 flex flex-col items-center justify-center animate-in fade-in">
                    <Wrench className="text-orange-500 animate-spin mb-4" size={48} />
                    <div className="text-orange-400 font-bold uppercase tracking-widest animate-pulse">กำลังซ่อมแซม...</div>
                </div>
            )}

            {showRestored && (
                <div className="absolute inset-0 z-50 bg-emerald-950/90 flex flex-col items-center justify-center animate-in zoom-in">
                    <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                    <div className="text-emerald-400 font-bold uppercase tracking-widest">ซ่อมแซมเสร็จสิ้น</div>
                </div>
            )}

            {showRenewed && (
                <div className="absolute inset-0 z-50 bg-blue-950/90 flex flex-col items-center justify-center animate-in zoom-in backdrop-blur-sm">
                    <CalendarClock className="text-blue-400 mb-4 animate-bounce" size={48} />
                    <div className="text-blue-300 font-bold text-2xl mb-1">+{rig.durationMonths * 30} วัน</div>
                    <div className="text-blue-500 text-xs uppercase tracking-widest">ต่อสัญญาเรียบร้อย</div>
                </div>
            )}

            <div className="relative rounded-[10px] h-full flex flex-col">

                {/* Header Info */}
                <div className={`flex justify-between items-start z-10 p-4 border-b ${globalMultiplier > 1 ? 'border-purple-500/50 bg-gradient-to-r from-purple-900/30 to-stone-900' : 'border-stone-800 ' + styles.headerBg} pb-6 relative`}>
                    <div className="flex flex-col">
                        <span className={`text-sm font-display font-bold uppercase tracking-widest flex items-center gap-2 drop-shadow-sm ${globalMultiplier > 1 ? 'text-white' : styles.accentColor}`}>
                            {styles.icon}
                            {rig.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 ${rarityConfig.color} uppercase tracking-wider`}>
                                {rarityConfig.label}
                            </span>
                            <span className="text-[10px] text-stone-600 font-mono">Lvl {currentTier}</span>
                        </div>
                        <div className={`text-[10px] flex items-center gap-1.5 mt-2 font-mono font-medium ${isExpired ? 'text-red-500' : daysRemaining <= 3 ? 'text-orange-400' : 'text-stone-400'}`}>
                            <Timer size={10} />
                            <span>{formatTimeLeft(timeLeftMs)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className={`px-2 py-1 rounded border text-[10px] flex items-center gap-1 shadow-sm ${globalMultiplier > 1 ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'}`}>
                            <Clock size={10} />
                            <span>+{totalDailyProfit.toFixed(1)}/วัน</span>
                        </div>
                        <div className="flex flex-col items-end mb-1">
                            {rig.bonusProfit > 0 && (
                                <div className={`text-[9px] ${rarityConfig.color} flex items-center gap-1 font-bold`}>
                                    <Zap size={8} />
                                    โบนัส +{rig.bonusProfit.toFixed(1)}
                                </div>
                            )}
                            {equippedBonus > 0 && (
                                <div className="text-[9px] text-blue-400 flex items-center gap-1 font-bold">
                                    <Briefcase size={8} />
                                    อุปกรณ์ +{equippedBonus.toFixed(1)}
                                </div>
                            )}
                        </div>

                        {/* GLOVE SLOT (Index 0) - Back in Header */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onManageGlove && !isExploring) onManageGlove(rig.id);
                            }}
                            className={`group/glove w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative shadow-lg
                        ${gloveItem
                                    ? 'border-yellow-400 bg-stone-800 shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                                    : 'border-yellow-900/30 border-dashed bg-stone-950/20 hover:border-yellow-600/50'
                                }`}
                        >
                            {gloveItem ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${RARITY_SETTINGS[gloveItem.rarity].bgGradient} opacity-30`}></div>
                                    <InfinityGlove rarity={gloveItem.rarity} size={24} className="relative z-10 drop-shadow-md" />
                                    {gloveItem.level && gloveItem.level > 1 && (
                                        <span className="absolute -bottom-0.5 right-0 text-[8px] font-bold bg-black/80 text-yellow-500 px-1 rounded-tl-md">+{gloveItem.level}</span>
                                    )}

                                    {/* Tooltip */}
                                    <div className="absolute right-full top-0 mr-2 z-[60] bg-stone-900/95 text-xs text-white p-2 rounded-lg border border-yellow-500/30 shadow-xl opacity-0 hover:opacity-100 group-hover/glove:opacity-100 pointer-events-none transition-opacity min-w-[120px] backdrop-blur-sm">
                                        <div className="font-bold text-yellow-500 mb-1">{gloveItem.name}</div>
                                        <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                            <Timer size={10} />
                                            {formatTimeLeft(Math.max(0, gloveItem.expireAt - Date.now()))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <InfinityGlove rarity="COMMON" size={20} className="grayscale opacity-20 text-stone-500" />
                            )}
                            {gloveItem && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 animate-[pulse_2s_infinite] pointer-events-none"></div>}
                        </div>
                    </div>

                    {/* REPAIR HEALTH BAR */}
                    {!isInfiniteDurability && (
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-stone-950 flex items-center px-4 mb-1">
                            <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden flex items-center relative">
                                <div
                                    className={`h-full transition-all duration-500 ${healthColor}`}
                                    style={{ width: `${healthPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body with Animation and Left Sidebar Slots */}
                <div className={`flex p-4 z-10 flex-1 ${isExpired || isBroken || !isPowered || isExploring ? 'opacity-50 grayscale' : ''} relative`}>

                    {/* LEFT SIDEBAR SLOTS (Vertical Column for Slot 2-5) */}
                    <div className="flex flex-col gap-2.5 z-40 pr-4 border-r border-stone-800/30">
                        {equippedItems.slice(1).map((item, index) => {
                            const actualIndex = index + 1;
                            return (
                                <div
                                    key={actualIndex}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isExploring) return;
                                        if (item && onUnequipSlot) onUnequipSlot(rig.id, actualIndex);
                                        else if (!item && onEquipSlot) onEquipSlot(rig.id, actualIndex);
                                    }}
                                    className={`group/item w-8 h-8 rounded border-2 flex items-center justify-center cursor-pointer transition-all relative
                                ${item
                                            ? 'border-yellow-400 bg-stone-800 shadow-[0_0_12px_rgba(234,179,8,0.4)] hover:border-red-500'
                                            : 'border-yellow-900/30 border-dashed bg-stone-950/20 hover:border-yellow-600/50'
                                        }`}
                                >
                                    {item ? (
                                        <div className="relative w-full h-full flex items-center justify-center bg-stone-800/50">
                                            {getAccessoryIcon(item, "w-4 h-4 text-yellow-100 drop-shadow-sm")}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 animate-[pulse_3s_infinite] pointer-events-none"></div>

                                            {/* Tooltip for Accessories */}
                                            <div className="absolute left-full top-0 ml-2 z-[60] bg-stone-900/95 text-xs text-white p-2 rounded-lg border border-stone-700 shadow-xl opacity-0 hover:opacity-100 group-hover/item:opacity-100 pointer-events-none transition-opacity min-w-[120px] backdrop-blur-sm">
                                                <div className="font-bold text-yellow-500 mb-1">{item.name}</div>
                                                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                                    <Timer size={10} />
                                                    {formatTimeLeft(Math.max(0, item.expireAt - Date.now()))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Plus size={10} className="text-yellow-900/40" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Animation (Centered) */}
                    <div className="flex-1 flex items-center justify-center">
                        <OilRigAnimation isActive={!isExpired && !isBroken && isPowered && !isExploring} rarity={rig.rarity} tier={currentTier} />
                    </div>

                    {/* Floating Action Buttons */}
                    {!isInfiniteDurability && (
                        <button
                            onClick={handleRepairClick}
                            disabled={isExploring}
                            className={`absolute top-1 right-1 p-3 rounded-full bg-stone-900 border border-stone-700 shadow-lg hover:bg-stone-800 transition-all z-30 group/repair ${isBroken ? 'animate-bounce border-red-500' : ''}`}
                            title={`ซ่อมแซม: ${repairCost} บาท`}
                        >
                            <Wrench size={20} className={`${styles.wrench} transition-transform group-hover/repair:rotate-45`} />
                        </button>
                    )}

                    {!isExpired && (
                        <div className="absolute top-14 right-2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
                            <div className={`transition-all duration-300 ${hasKey ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] scale-100 animate-pulse' : 'text-stone-700 opacity-50 scale-75'}`}>
                                <Key size={16} strokeWidth={2.5} className="transform -rotate-45" />
                            </div>

                            {aiRobotItem && (
                                <div className="group/robot relative flex flex-col items-center">
                                    <div className="bg-gradient-to-br from-yellow-700/80 to-yellow-900/80 p-1.5 rounded-full border border-yellow-500/30 shadow-lg animate-[pulse_3s_ease-in-out_infinite] backdrop-blur-sm cursor-help">
                                        <Bot size={16} className="text-yellow-100" />
                                    </div>
                                    <div className="absolute right-full top-0 mr-2 bg-stone-950/90 rounded px-2 py-1 border border-yellow-900/50 shadow-xl backdrop-blur-md opacity-0 group-hover/robot:opacity-100 transition-opacity pointer-events-none">
                                        <span className="text-[10px] text-yellow-500 font-mono font-bold flex items-center justify-center gap-1 leading-none">
                                            <Zap size={10} className="animate-bounce" /> {formatSimpleTime(aiRobotTimeLeft)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-center justify-center">
                                {isGiftAvailable ? (
                                    <div onClick={handleGiftClick} className="cursor-pointer transition-transform hover:scale-110 active:scale-95">
                                        <div className="relative animate-[bounce_1s_infinite]">
                                            <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-lg animate-pulse"></div>
                                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-1.5 rounded-lg border border-white shadow-lg relative">
                                                <Gift className="text-white drop-shadow-md" size={18} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group/gift relative">
                                        <div className="bg-stone-800 p-1 rounded-lg border border-stone-600 shadow-inner relative flex flex-col items-center justify-center w-9 h-9 opacity-80 hover:opacity-100 transition-opacity">
                                            <Gift size={14} className="text-stone-600 mb-0.5" />
                                            <span className="text-[8px] font-mono text-stone-400 font-bold leading-none tracking-tighter">{formatGiftCooldown(timeUntilGift)}</span>
                                        </div>
                                        <svg className="absolute -inset-1 w-[44px] h-[44px] -rotate-90 pointer-events-none">
                                            <circle cx="22" cy="22" r="20" fill="none" className="stroke-stone-800/50" strokeWidth="2" />
                                            <circle cx="22" cy="22" r="20" fill="none" className="stroke-emerald-500/30 transition-all duration-1000" strokeWidth="2" strokeDasharray="125" strokeDashoffset={125 - (125 * nextGiftProgress / 100)} strokeLinecap="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isBroken && !isExpired && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-[1px]">
                            <div className="bg-red-900/80 px-3 py-1.5 rounded border border-red-500 text-red-100 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl animate-pulse">
                                <AlertTriangle size={14} /> เครื่องจักรชำรุด
                            </div>
                        </div>
                    )}
                </div>

                {/* Ticker & Action */}
                <div className="mt-auto z-10 p-4 pt-0 space-y-3">

                    {!isExpired && (
                        <div className={`mb-2 flex items-center justify-between p-2 rounded-lg border transition-colors ${currentMaterials > 0 ? 'bg-yellow-900/20 border-yellow-600/50' : 'bg-stone-900/50 border-stone-800/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`relative w-10 h-10 rounded-md border flex items-center justify-center shadow-inner ${currentMaterials > 0 ? 'bg-yellow-900/30 border-yellow-600' : 'bg-stone-950 border-stone-700'}`}>
                                    {currentMaterials > 0 ? (
                                        <Key size={20} className="text-yellow-400 animate-pulse drop-shadow-[0_0_5px_gold]" />
                                    ) : (
                                        <Key size={20} className="text-stone-700" />
                                    )}
                                    {currentMaterials > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-stone-900 shadow-sm animate-bounce">
                                            1
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${currentMaterials > 0 ? 'text-yellow-400' : 'text-stone-400'}`}>
                                        {currentMaterials > 0 ? 'กุญแจไขหีบ' : 'รอการค้นพบ'}
                                    </span>
                                    <div className="flex gap-2 text-[9px] text-stone-600">
                                        {currentMaterials > 0 ? <span className="text-red-400 font-bold">เต็ม (FULL)</span> : <span>ความจุ 1</span>}
                                    </div>
                                </div>
                            </div>

                            {currentMaterials > 0 && !isExploring && (
                                <button
                                    onClick={handleCollectMaterialsClick}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-lg transition-all active:scale-95 flex items-center gap-1"
                                >
                                    <ArrowDownToLine size={12} /> เก็บ
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-end px-1 border-t border-stone-800/50 pt-3">
                        <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">
                            {getResourceName()}ที่รอเก็บเกี่ยว
                        </span>
                        <div className="text-right">
                            <div className={`text-2xl font-mono font-bold tabular-nums flex items-center justify-end gap-1 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]`}>
                                {currentAmount.toFixed(4)} <Sparkles size={12} className={!isExpired && !isBroken && isPowered && !isExploring ? "animate-pulse text-yellow-500" : "hidden"} />
                            </div>
                        </div>
                    </div>

                    {isRenewable && !isRenewConfirming ? (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleClaimClick}
                                disabled={(isExpired || isBroken || !effectiveIsPowered || isExploring) && currentAmount <= 0}
                                className="font-bold py-3 rounded border border-stone-600 bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
                            >
                                <Coins size={16} /> เก็บ
                            </button>
                            <button
                                onClick={handleRenewClick}
                                disabled={isExploring}
                                className="font-bold py-3 rounded border border-blue-500 bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-blue-900/20 active:scale-95"
                            >
                                <RefreshCw size={16} /> ต่ออายุ
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
                            className={`w-full font-bold py-3 rounded border transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-display uppercase tracking-wider
                    ${isExpired
                                    ? 'bg-stone-800 text-stone-600 border-stone-700 cursor-not-allowed'
                                    : isExploring
                                        ? 'bg-purple-900/20 text-purple-500 border-purple-900/50 cursor-not-allowed'
                                        : isBroken
                                            ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer'
                                            : !effectiveIsPowered
                                                ? 'bg-orange-900/20 text-orange-500 border-orange-900/50 cursor-not-allowed'
                                                : currentTier === 6
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
                                <><Skull size={18} /> กำลังสำรวจ...</>
                            ) : isBroken && !isExpired ? (
                                <><Wrench size={18} /> ซ่อม ({repairCost})</>
                            ) : !effectiveIsPowered && !isExpired ? (
                                <><ZapOff size={18} /> พลังงานหมด</>
                            ) : (
                                <><Coins size={18} strokeWidth={2.5} /> {isExpired ? 'หมดอายุ' : 'เก็บผลผลิต'}</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};
