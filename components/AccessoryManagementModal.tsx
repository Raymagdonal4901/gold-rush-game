import React, { useState, useEffect } from 'react';
import { X, Shield, ArrowUpCircle, Cpu, CheckCircle2, AlertTriangle, Plus, Sparkles, XCircle, Hammer, Backpack, Glasses, Monitor, Smartphone, Truck, Footprints, Zap, TrendingUp, Rocket, Flame, CloudFog, Anvil, FileText, HardHat, Shirt, Bot, Key, Factory, Search, Hourglass, Gem, Lock, Wrench, Clock, Timer, Ticket, Briefcase, Settings, TrainFront } from 'lucide-react';
import { AccessoryIcon } from './AccessoryIcon';
import { AccessoryItem, OilRig } from '../services/types';
import { PixelProgressBar } from './PixelProgressBar';
import { CURRENCY, RARITY_SETTINGS, EQUIPMENT_UPGRADE_CONFIG, MATERIAL_CONFIG, EQUIPMENT_SERIES, UPGRADE_REQUIREMENTS, SHOP_ITEMS, REPAIR_KITS } from '../constants';
import { api } from '../services/api';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface AccessoryManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    rig: OilRig;
    slotIndex: number;
    equippedItem: AccessoryItem | null;
    inventory: AccessoryItem[];
    userId: string;
    onEquip: (itemId: string) => void;
    onUnequip: () => void;
    onRefresh: () => void;
    materials?: Record<number, number>;
    addNotification?: (n: any) => void;
    equippedItemIds?: string[];
}



export const getItemDisplayName = (item: any, t: any, getLocalized: any) => {
    if (!item) return '';
    const typeId = item.typeId || '';
    const nameRaw = item.name;

    // 1. Match by configuration names (centralized)
    if (typeId === 'chest_key' || (typeof nameRaw === 'string' && (nameRaw.includes('กุญแจ') || nameRaw.includes('Key')))) return t('items.mining_key');
    if (typeId === 'upgrade_chip' || (typeof nameRaw === 'string' && (nameRaw.includes('ชิป') || nameRaw.includes('Chip')))) return t('items.upgrade_chip');
    if (typeId === 'mixer' || (typeof nameRaw === 'string' && (nameRaw.includes('โต๊ะช่าง') || nameRaw.includes('Mixer')))) return t('items.material_mixer');
    if (typeId === 'magnifying_glass' || (typeof nameRaw === 'string' && (nameRaw.includes('แว่นขยาย') || nameRaw.includes('Search')))) return t('items.magnifying_glass');
    if (typeId === 'robot' || typeId === 'ai_robot') return t('items.ai_robot');

    // 2. User localization helper or raw name
    return getLocalized(nameRaw);
};

// --- EQUIPMENT DURABILITY HELPERS ---
export const getDurabilityInfo = (item: any) => {
    if (!item) return null;
    // HP-based system
    if (item.currentDurability !== undefined && item.maxDurability) {
        const current = item.currentDurability;
        const max = item.maxDurability;
        const percent = Math.round((current / max) * 100);
        const isExpired = current <= 0;
        const isWarning = !isExpired && percent <= 20;
        return { current, max, percent, isExpired, isWarning };
    }
    // Fallback: old expireAt system → convert to HP
    if (item.expireAt) {
        const now = Date.now();
        const msLeft = item.expireAt - now;
        const daysLeft = Math.max(0, msLeft / (24 * 60 * 60 * 1000));
        const current = Math.round(daysLeft * 100);
        const shopConfig = SHOP_ITEMS.find(s => s.id === item.typeId);
        const max = (shopConfig as any)?.maxDurability || (item.lifespanDays || 30) * 100;
        const percent = max > 0 ? Math.round((current / max) * 100) : 0;
        const isExpired = current <= 0;
        const isWarning = !isExpired && percent <= 20;
        return { current, max, percent, isExpired, isWarning };
    }
    return null;
};

export const AccessoryManagementModal: React.FC<AccessoryManagementModalProps> = ({
    isOpen, onClose, rig, slotIndex, equippedItem, inventory, userId, onEquip, onUnequip, onRefresh, materials = {}, addNotification, equippedItemIds = []
}) => {
    const { t, language, getLocalized, formatBonus, formatCurrency } = useTranslation();
    const [view, setView] = useState<'MANAGE' | 'SELECT'>('MANAGE');
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [useInsurance, setUseInsurance] = useState(false);
    const [upgradePhase, setUpgradePhase] = useState<'IDLE' | 'HEATING' | 'HAMMERING' | 'COOLING'>('IDLE');
    const [upgradeMsg, setUpgradeMsg] = useState<{
        type: 'SUCCESS' | 'ERROR',
        text: string,
        level?: number,
        subtext?: string,
        oldBonus?: number,
        newBonus?: number,
        itemName?: string
    } | null>(null);

    // --- REPAIR STATE ---
    const [showRepairConfirm, setShowRepairConfirm] = useState(false);
    const [selectedRepairKit, setSelectedRepairKit] = useState<any>(null);
    const [isRepairing, setIsRepairing] = useState(false);
    const [repairMsg, setRepairMsg] = useState<{ type: 'SUCCESS' | 'ERROR', text: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setView(equippedItem ? 'MANAGE' : 'SELECT');
            setUpgradeMsg(null);
            setIsUpgrading(false);
            setUpgradePhase('IDLE');
            setUseInsurance(false);
            setShowRepairConfirm(false);
            setSelectedRepairKit(null);
            setRepairMsg(null);
        }
    }, [isOpen, equippedItem?.id]);

    if (!isOpen) return null;

    // ... (helper functions omitted, assume they persist or I need to be careful not to delete them if I replaced huge block)
    // Wait, I should not delete helpers. I'll target specific blocks.

    const insuranceCount = inventory.filter(i => i.typeId === 'insurance_card').length;

    const handleUpgrade = async () => {
        if (!equippedItem) return;

        if (useInsurance && insuranceCount === 0) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: userId,
                message: t('blacksmith.no_insurance'),
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
            setUseInsurance(false);
            return;
        }

        const oldBonus = equippedItem.dailyBonus || 0;
        const itemName = equippedItem.name;

        setIsUpgrading(true);
        setUpgradeMsg(null);
        setUpgradePhase('HEATING');

        setTimeout(() => {
            setUpgradePhase('HAMMERING');
        }, 200);

        setTimeout(() => {
            setUpgradePhase('COOLING');
        }, 400);

        try {
            const res = await api.inventory.upgrade(equippedItem.id, useInsurance);

            setTimeout(() => {
                if (res.success) {
                    setUpgradeMsg({
                        type: 'SUCCESS',
                        text: t('blacksmith.success_title'),
                        level: res.item?.level,
                        subtext: t('blacksmith.upgrade_success'),
                        oldBonus,
                        newBonus: res.item?.dailyBonus,
                        itemName: getLocalized(itemName)
                    });
                } else {
                    setUpgradeMsg({
                        type: 'ERROR',
                        text: t('blacksmith.fail_title'),
                        subtext: res.message || t('blacksmith.item_damaged'),
                        level: res.item?.level
                    });
                }
                onRefresh();
                setIsUpgrading(false);
                setUpgradePhase('IDLE');
            }, 600);
        } catch (e: any) {
            setTimeout(() => {
                setUpgradeMsg({
                    type: 'ERROR',
                    text: t('blacksmith.error_title'),
                    subtext: e.response?.data?.message || e.message || t('blacksmith.error')
                });
                setIsUpgrading(false);
                setUpgradePhase('IDLE');
            }, 600);
        }
    };

    // --- REPAIR HANDLER ---
    const handleRepair = async () => {
        if (!equippedItem || !selectedRepairKit) return;
        setIsRepairing(true);
        setRepairMsg(null);
        try {
            const res = await api.repairEquipment(equippedItem.id, selectedRepairKit.id);
            if (res.success) {
                setRepairMsg({ type: 'SUCCESS', text: res.message || (language === 'th' ? 'ซ่อมบำรุงสำเร็จ!' : 'Repair successful!') });
                onRefresh();
            } else {
                setRepairMsg({ type: 'ERROR', text: res.message || (language === 'th' ? 'ซ่อมไม่สำเร็จ' : 'Repair failed') });
            }
        } catch (e: any) {
            setRepairMsg({ type: 'ERROR', text: e.response?.data?.message || e.message || 'Error' });
        }
        setIsRepairing(false);
        setShowRepairConfirm(false);
        setSelectedRepairKit(null);
    };


    // Find available repair kits for the equipped item
    const getAvailableRepairKits = () => {
        if (!equippedItem) return [];
        const typeId = equippedItem.typeId || '';
        // Find which repair kit tier targets this equipment
        const matchingKitConfig = REPAIR_KITS.find(k => k.targetEquipment.includes(typeId));
        if (!matchingKitConfig) return [];
        // Find inventory items matching this kit type
        return inventory.filter(i => i.typeId === matchingKitConfig.id);
    };

    const getRepairKitConfigForEquipment = (typeId: string) => {
        return REPAIR_KITS.find(k => k.targetEquipment.includes(typeId)) || null;
    };

    if (!isOpen) return null;

    const getSeriesKey = (typeIdRaw: string | null | undefined) => {
        const typeId = typeIdRaw || '';

        // Match by exact key or prefix
        const seriesKeys = Object.keys(EQUIPMENT_SERIES);
        const series = seriesKeys.find(key => typeId === key || typeId.startsWith(key + '_') || typeId === key);
        if (series) return series;

        // Fallbacks for legacy/generic IDs
        if (typeId.includes('shirt') || typeId.includes('uniform')) return 'uniform';
        if (typeId.includes('helmet')) return 'hat';
        if (typeId.includes('tool')) return 'glove';
        return null;
    };

    const isEquipable = (item: AccessoryItem) => {
        // 1. Check by ID config
        const typeId = item.typeId || '';
        const itemConfig = SHOP_ITEMS.find(s => s.id === typeId);
        if (itemConfig && itemConfig.tier !== undefined) return true;

        // 2. Fallback: Check by Name
        const nameRaw = item.name;
        const enName = typeof nameRaw === 'object' ? (nameRaw as any)?.en || '' : String(nameRaw || '');
        const thName = typeof nameRaw === 'object' ? (nameRaw as any)?.th || '' : String(nameRaw || '');

        if (thName.includes('หมวก') || enName.includes('Helmet')) return true;
        if (thName.includes('แว่นขยาย') || enName.includes('Magnifying')) return false; // Auto-activate tool
        if (thName.includes('แว่น') || enName.includes('Glasses')) return true;
        if (thName.includes('ชุด') || enName.includes('Uniform') || enName.includes('Suit')) return true;
        if (thName.includes('กระเป๋า') || enName.includes('Bag') || enName.includes('Backpack')) return true;
        if (thName.includes('รองเท้า') || enName.includes('Boots')) return true;
        if (thName.includes('มือถือ') || enName.includes('Mobile') || enName.includes('Phone')) return true;
        if (thName.includes('คอม') || enName.includes('PC') || enName.includes('Computer')) return true;
        if (thName.includes('รถขุด') || thName.includes('รถไฟฟ้า') || enName.includes('Excavator') || enName.includes('Electric Vehicle')) return true;

        return false;
    };

    const availableItems = inventory.filter(item => {
        if (!item) return false;
        // Hide if already equipped on ANY rig
        if (equippedItemIds.includes(item.id)) return false;
        return isEquipable(item);
    }).filter(item => {
        // HP-based check
        if (item.currentDurability !== undefined) return item.currentDurability > 0;
        // fallback: old expireAt check
        return !item.expireAt || item.expireAt > Date.now();
    });




    // Cartoon Mining Animation Overlay
    const renderMiningAnimation = () => {
        if (!isUpgrading) return null;

        return (
            <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,0,0.1),transparent_70%)] animate-pulse"></div>

                <div className="relative">
                    {/* Anvil Base */}
                    <div className="relative z-10 w-48 h-24 bg-stone-800 rounded-b-xl rounded-t-sm border-b-4 border-stone-950 shadow-2xl flex items-center justify-center translate-y-20">
                        <div className="absolute top-0 w-full h-4 bg-stone-700 rounded-t-sm border-b border-stone-950"></div>
                        {/* Anvil Horn */}
                        <div className="absolute -left-8 top-2 w-10 h-16 bg-stone-800 rounded-l-full skew-x-[20deg] border-b-4 border-stone-950 -z-10"></div>
                        <div className="text-stone-600 opacity-20"><Hammer size={48} /></div>
                    </div>

                    {/* Item on Anvil */}
                    <div className={`relative z-20 -translate-y-4 transition-all duration-300
                        ${upgradePhase === 'HEATING' ? 'animate-pulse drop-shadow-[0_0_15px_rgba(255,69,0,0.8)] saturate-200' : ''}
                        ${upgradePhase === 'HAMMERING' ? 'animate-[bounce_0.2s_infinite]' : ''}
                    `}>
                        {equippedItem && <AccessoryIcon item={equippedItem} size={80} />}
                    </div>

                    {/* Hammer Animation */}
                    {upgradePhase === 'HAMMERING' && (
                        <div className="absolute -top-32 -right-24 z-30 animate-[hammer_0.5s_ease-in-out_infinite] origin-bottom-right">
                            <div className="relative">
                                <Hammer size={120} className="text-stone-300 drop-shadow-xl rotate-45" fill="currentColor" />
                                <div className="absolute inset-0 bg-white/30 animate-ping rounded-full"></div>
                            </div>
                        </div>
                    )}

                    {/* Effects */}
                    {upgradePhase === 'HEATING' && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 flex gap-2">
                            <Flame className="text-orange-500 animate-[bounce_0.5s_infinite]" size={32} fill="currentColor" />
                            <Flame className="text-red-500 animate-[bounce_0.7s_infinite_reverse]" size={40} fill="currentColor" />
                            <Flame className="text-yellow-500 animate-[bounce_0.6s_infinite]" size={28} fill="currentColor" />
                        </div>
                    )}

                    {upgradePhase === 'HAMMERING' && (
                        <>
                            <div className="absolute top-0 left-0 w-full h-full animate-[ping_0.5s_infinite]">
                                <Sparkles className="absolute -top-10 -left-10 text-yellow-300" size={32} />
                                <Sparkles className="absolute -top-20 right-0 text-orange-300" size={24} />
                                <Sparkles className="absolute top-0 -right-10 text-white" size={40} />
                            </div>
                        </>
                    )}

                    {upgradePhase === 'COOLING' && (
                        <div className="absolute inset-0 flex items-center justify-center -translate-y-10">
                            <CloudFog className="text-white/80 w-32 h-32 animate-[ping_1s_ease-out_forwards]" />
                            <CloudFog className="text-white/50 w-48 h-48 animate-[ping_1.5s_ease-out_forwards]" />
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div className="mt-32 text-center relative z-20">
                    <h2 className="text-4xl font-black text-white uppercase tracking-widest font-display drop-shadow-[0_4px_0_#000]">
                        {upgradePhase === 'HEATING' && <span className="text-orange-500">{t('blacksmith.heating')}</span>}
                        {upgradePhase === 'HAMMERING' && <span className="text-yellow-500">{t('blacksmith.hammering')}</span>}
                        {upgradePhase === 'COOLING' && <span className="text-stone-300">{t('blacksmith.cooling')}</span>}
                    </h2>
                </div>
            </div>
        );
    };

    // Stone/Wood Result Popup
    const renderResultPopup = () => {
        if (!upgradeMsg) return null;
        const isSuccess = upgradeMsg.type === 'SUCCESS';

        return (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                <div className={`relative bg-[#2a2420] overflow-hidden w-full max-w-sm rounded-xl border-4 p-8 text-center flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]
                    ${isSuccess ? 'border-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-stone-600 shadow-[0_0_30px_rgba(87,83,78,0.3)]'}
                    `}>

                    {/* Wood Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

                    {/* Icon Halo */}
                    <div className="relative z-10">
                        <div className={`w-24 h-24 flex items-center justify-center rounded-full border-4 ${isSuccess ? 'bg-yellow-900/50 border-yellow-500' : 'bg-stone-800/50 border-stone-500'}`}>
                            {isSuccess ? <CheckCircle2 size={48} className="text-yellow-400" /> : <XCircle size={48} className="text-stone-400" />}
                        </div>
                        {isSuccess && <Sparkles className="absolute -top-4 -right-4 text-yellow-300 animate-bounce" size={32} />}
                    </div>

                    {/* Text */}
                    <div className="mt-2 relative z-10">
                        <h2 className={`text-3xl font-black uppercase tracking-wider font-display drop-shadow-md ${isSuccess ? 'text-yellow-400' : 'text-stone-400'}`}>
                            {upgradeMsg.text}
                        </h2>
                        <p className="text-stone-400 text-sm font-bold mt-2">{upgradeMsg.subtext}</p>
                    </div>

                    {/* Stats HUD (Success Only) */}
                    {isSuccess && upgradeMsg.level && (
                        <div className="w-full bg-black/30 border-2 border-yellow-900/50 p-4 rounded-lg space-y-3 relative z-10">
                            <div className="text-center">
                                <span className="text-yellow-700/80 text-[10px] uppercase font-bold tracking-widest">{t('blacksmith.success_banner')}</span>
                                <div className="text-white font-bold text-lg">{upgradeMsg.itemName}</div>
                            </div>
                            <div className="flex justify-center my-2">
                                <div className="px-6 py-1 bg-yellow-950/50 border border-yellow-600 rounded-lg">
                                    <span className="text-yellow-400 font-bold text-2xl drop-shadow-md">LV.{upgradeMsg.level}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-sm font-bold">
                                <div className="text-stone-500">{formatCurrency(upgradeMsg.oldBonus || 0, { showDecimals: true })}</div>
                                <div className="text-yellow-500">→</div>
                                <div className="text-green-400 font-bold">+{formatCurrency(upgradeMsg.newBonus || 0, { showDecimals: true })}</div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setUpgradeMsg(null)}
                        className={`w-full py-4 font-bold text-white uppercase tracking-wider hover:brightness-110 transition-all rounded-xl shadow-lg relative z-10
                        ${isSuccess ? 'bg-gradient-to-r from-yellow-700 to-orange-700 border-t border-yellow-400' : 'bg-stone-700 border-t border-stone-500'}`}
                    >
                        {t('blacksmith.ok')}
                    </button>
                </div>
            </div>
        );
    };

    const renderManageView = () => {
        const itemRarity = equippedItem?.rarity || 'COMMON';
        const rarityConfig = RARITY_SETTINGS[itemRarity] || RARITY_SETTINGS['COMMON'];
        const currentLevel = equippedItem?.level || 1;
        const nextLevel = currentLevel + 1;

        let upgradeReq: any = null;

        if (equippedItem) {
            const seriesKey = getSeriesKey(equippedItem.typeId);
            if (seriesKey && EQUIPMENT_UPGRADE_CONFIG[seriesKey]) {
                upgradeReq = EQUIPMENT_UPGRADE_CONFIG[seriesKey][currentLevel];
            }
        }

        const matName = upgradeReq ? getLocalized(MATERIAL_CONFIG.NAMES[upgradeReq.matTier as keyof typeof MATERIAL_CONFIG.NAMES]) : '';

        const safeBonus = (val: any) => {
            const n = Number(val);
            return isNaN(n) ? 0 : n;
        };

        const currentBonus = safeBonus(equippedItem?.dailyBonus);
        let nextBonusValue = currentBonus;

        if (upgradeReq) {
            if (upgradeReq.targetBonus !== undefined) {
                // Determine current target based on level
                const currentLevel = equippedItem?.level || 1;
                // Get the series key to ensure we match correctly
                const seriesKey = getSeriesKey(equippedItem?.typeId);
                const config = seriesKey ? EQUIPMENT_UPGRADE_CONFIG[seriesKey] : UPGRADE_REQUIREMENTS;

                const currentTarget = (config && currentLevel > 1) ? config[currentLevel - 1]?.targetBonus || 0 : 0;
                const nextTarget = upgradeReq.targetBonus || 0;
                const increase = nextTarget - currentTarget;
                nextBonusValue = currentBonus + increase;
            } else if (upgradeReq.bonusMultiplier > 0) {
                nextBonusValue = currentBonus * upgradeReq.bonusMultiplier;
            } else {
                const shopConfig = SHOP_ITEMS.find(s => s.id === equippedItem?.typeId);
                const tier = shopConfig?.tier || 1;
                const boost = tier === 3 ? 2.0 : tier === 2 ? 1.0 : 0.5;
                nextBonusValue = currentBonus + boost;
            }
        }

        const bonusDiff = nextBonusValue - currentBonus;

        // Calculate owned chips
        const ownedChips = inventory.filter(i => i.typeId === 'upgrade_chip').length;
        const hasEnoughChips = ownedChips >= (upgradeReq?.chipAmount || 0);

        return (
            <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar touch-pan-y">
                <div className="flex-none flex flex-col items-center justify-center py-2 px-4 bg-stone-900/50">
                    {equippedItem ? (
                        <div className={`relative w-32 h-44 rounded-xl border-2 ${rarityConfig.border} bg-stone-900/90 flex flex-col items-center justify-center overflow-hidden shadow-xl transition-transform duration-300 group`}>
                            {/* Tech overlay on card */}
                            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>

                            <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.bgGradient} opacity-20`}></div>
                            <div className="relative z-10 mb-2 scale-100 drop-shadow-lg">
                                <AccessoryIcon item={equippedItem} size={48} />
                            </div>
                            <div className="relative z-10 text-center px-2">
                                <h3 className={`font-bold text-sm leading-tight ${rarityConfig.color} drop-shadow-sm`}>{getItemDisplayName(equippedItem, t, getLocalized)}</h3>
                                <div className="text-[10px] text-stone-400 mt-0.5 uppercase tracking-wide opacity-80">{rarityConfig.label}</div>
                                {equippedItem.level && equippedItem.level > 1 && (
                                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-sm bg-black text-cyan-400 text-xs font-bold shadow-lg border border-cyan-500/50 font-mono z-20">
                                        +{equippedItem.level}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => setView('SELECT')} className="w-48 h-64 rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-stone-800/80 transition-all group">
                            <Plus className="text-stone-500 group-hover:text-cyan-500 mb-4 transition-colors" size={32} />
                            <span className="text-stone-500 font-bold group-hover:text-cyan-500 transition-colors uppercase tracking-widest text-sm">{t('blacksmith.select_equip')}</span>
                        </div>
                    )}
                </div>

                <div className="bg-stone-900 p-3 border-t border-stone-800">
                    {equippedItem ? (
                        <div className="space-y-2">
                            {/* --- DURABILITY BAR --- */}
                            {(() => {
                                const durInfo = getDurabilityInfo(equippedItem);
                                if (!durInfo) return null;
                                const kitConfig = getRepairKitConfigForEquipment(equippedItem.typeId || '');
                                const availableKits = getAvailableRepairKits();
                                const barColor = durInfo.isExpired
                                    ? 'bg-red-500'
                                    : durInfo.percent <= 20
                                        ? 'bg-red-500'
                                        : durInfo.percent <= 50
                                            ? 'bg-yellow-500'
                                            : 'bg-emerald-500';
                                const barGlow = durInfo.isExpired
                                    ? 'shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                    : durInfo.percent <= 20
                                        ? 'shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                        : durInfo.percent <= 50
                                            ? 'shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                                            : 'shadow-[0_0_8px_rgba(16,185,129,0.4)]';
                                return (
                                    <div className={`rounded-lg p-2.5 border ${durInfo.isExpired
                                        ? 'bg-red-950/30 border-red-900/50'
                                        : durInfo.isWarning
                                            ? 'bg-yellow-950/30 border-yellow-900/50'
                                            : 'bg-stone-950 border-stone-800'
                                        }`}>
                                        <PixelProgressBar
                                            current={durInfo.current}
                                            max={durInfo.max}
                                            showValue={true}
                                            label={language === 'th' ? 'ความทนทาน' : 'Durability'}
                                            icon={durInfo.isExpired ? <XCircle size={14} className="text-red-500" /> : durInfo.isWarning ? <AlertTriangle size={14} className="text-yellow-500 animate-pulse" /> : <Shield size={14} className="text-emerald-400" />}
                                            color={durInfo.isExpired ? 'red' : durInfo.percent <= 20 ? 'red' : durInfo.percent <= 50 ? 'yellow' : 'green'}
                                            className="w-full"
                                        />

                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className={`text-[10px] font-bold ${durInfo.isExpired ? 'text-red-500' : durInfo.isWarning ? 'text-yellow-500' : 'text-stone-500'
                                                }`}>
                                                {durInfo.isExpired
                                                    ? (language === 'th' ? '❌ พัง!' : '❌ Broken!')
                                                    : `${durInfo.percent}%`
                                                }
                                            </span>
                                            {kitConfig && (
                                                <button
                                                    onClick={() => {
                                                        if (availableKits.length > 0) {
                                                            setSelectedRepairKit(availableKits[0]);
                                                            setShowRepairConfirm(true);
                                                        } else {
                                                            if (addNotification) addNotification({
                                                                id: Date.now().toString(),
                                                                userId,
                                                                message: language === 'th'
                                                                    ? `ไม่มี ${getLocalized(kitConfig.name)} ในกระเป๋า — ไปคราฟต์ก่อน!`
                                                                    : `No ${getLocalized(kitConfig.name)} in inventory — craft one first!`,
                                                                type: 'WARNING',
                                                                read: false,
                                                                timestamp: Date.now()
                                                            });
                                                        }
                                                    }}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${availableKits.length > 0
                                                        ? 'bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                        : 'bg-stone-800 border border-stone-700 text-stone-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <Wrench size={12} />
                                                    {language === 'th' ? 'ซ่อมบำรุง' : 'Repair'}
                                                    {availableKits.length > 0 && (
                                                        <span className="bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-300 text-[9px]">x{availableKits.length}</span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* --- REPAIR SUCCESS/ERROR MESSAGE --- */}
                            {repairMsg && (
                                <div className={`rounded-lg p-2 border text-center text-xs font-bold animate-in fade-in duration-300 ${repairMsg.type === 'SUCCESS'
                                    ? 'bg-emerald-950/30 border-emerald-700 text-emerald-400'
                                    : 'bg-red-950/30 border-red-700 text-red-400'
                                    }`}>
                                    {repairMsg.type === 'SUCCESS' ? <CheckCircle2 size={14} className="inline mr-1" /> : <XCircle size={14} className="inline mr-1" />}
                                    {repairMsg.text}
                                </div>
                            )}

                            <div className="flex gap-2">
                                {slotIndex !== 0 ? (
                                    <>
                                        <button onClick={() => setView('SELECT')} className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-500 rounded-lg text-stone-300 font-bold text-xs uppercase tracking-wider transition-all">{t('blacksmith.change_equip')}</button>
                                        <button onClick={onUnequip} className="px-4 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-red-500 font-bold text-xs uppercase tracking-wider transition-all">{t('blacksmith.unequip')}</button>
                                    </>
                                ) : (
                                    <div className="flex-1 py-3 text-center text-stone-500 font-bold text-xs uppercase tracking-widest bg-stone-900/50 rounded-lg border border-stone-800 flex items-center justify-center gap-2">
                                        <Lock size={12} className="text-stone-600" /> {t('blacksmith.permanent')}
                                    </div>
                                )}
                            </div>

                            <div className="bg-stone-950 border border-stone-800 rounded-lg p-2 relative overflow-hidden">
                                {upgradeReq ? (
                                    <>
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-stone-900">
                                            <div className="flex items-center gap-2">
                                                <div className="text-center">
                                                    <div className="text-[9px] text-stone-500 uppercase">{t('blacksmith.current')}</div>
                                                    <div className="text-base font-black text-white font-mono">LV.{currentLevel}</div>
                                                </div>
                                                <div className="text-stone-600"><Rocket className="rotate-45" size={12} /></div>
                                                <div className="text-center">
                                                    <div className="text-[9px] text-cyan-500 uppercase font-bold">{t('blacksmith.next')}</div>
                                                    <div className="text-base font-black text-cyan-500 font-mono">LV.{nextLevel}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-stone-500 uppercase">{t('blacksmith.bonus')}</div>
                                                <div className="text-cyan-400 font-bold font-mono text-base flex items-center justify-end gap-1">
                                                    <TrendingUp size={12} />
                                                    {formatCurrency(bonusDiff).replace('฿', '')} ฿
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 mb-2 bg-stone-900 p-2 rounded-lg border border-stone-800 shadow-inner text-[10px]">
                                            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-300 border-r border-stone-800 pr-1">
                                                <div className="flex items-center gap-1 text-purple-400 font-bold"><Cpu size={10} /> {language === 'th' ? 'ชิป' : 'Chip'}</div>
                                                <span className={`font-mono ${hasEnoughChips ? 'text-white' : 'text-red-500'}`}>
                                                    {ownedChips}/{upgradeReq.chipAmount}
                                                </span>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-300">
                                                <div className="flex items-center gap-1 text-blue-400 font-bold"><MaterialIcon id={upgradeReq.matTier} size="w-2.5 h-2.5" iconSize={8} /> {t('blacksmith.materials')}</div>
                                                <span className={`font-mono ${((materials[upgradeReq.matTier] || 0) >= upgradeReq.matAmount) ? 'text-white' : 'text-red-500'}`}>
                                                    {matName} {materials[upgradeReq.matTier] || 0}/{upgradeReq.matAmount}
                                                </span>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-300 border-l border-stone-800 pl-1">
                                                <div className="text-yellow-600 font-bold">{t('blacksmith.cost')}</div>
                                                <span className="text-yellow-500 font-bold font-mono">฿{upgradeReq.cost.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-2 bg-stone-900/50 p-2 rounded border border-stone-800">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${useInsurance ? 'bg-cyan-500 border-cyan-400' : 'bg-stone-800 border-stone-600'}`}
                                                    onClick={() => {
                                                        if (insuranceCount > 0) setUseInsurance(!useInsurance);
                                                        else if (addNotification) addNotification({
                                                            id: Date.now().toString(),
                                                            userId: userId,
                                                            message: t('blacksmith.no_insurance'),
                                                            type: 'ERROR',
                                                            read: false,
                                                            timestamp: Date.now()
                                                        });
                                                    }}
                                                >
                                                    {useInsurance && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <div className="text-xs text-stone-300">
                                                    <div className="font-bold flex items-center gap-1">
                                                        <Shield size={12} className="text-emerald-400" /> {t('blacksmith.insurance')}
                                                    </div>
                                                    <div className="text-[10px] text-stone-500">{t('blacksmith.owned_count').replace('{count}', insuranceCount.toString())}</div>
                                                </div>
                                            </div>
                                            {useInsurance ? (
                                                <div className="text-[10px] items-center flex gap-1 text-emerald-400 font-bold bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                                                    <Shield size={10} /> {t('blacksmith.protected')}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] items-center flex gap-1 text-red-400 font-bold bg-red-950/10 px-2 py-1 rounded border border-red-900/20">
                                                    <AlertTriangle size={10} />
                                                    {upgradeReq.risk === 'NONE' ? (
                                                        <span className="text-emerald-500">{t('blacksmith.no_risk')}</span>
                                                    ) : upgradeReq.risk === 'BREAK' ? (
                                                        <span className="text-red-500">{t('blacksmith.risk_break')}</span>
                                                    ) : (
                                                        <span>{t('blacksmith.risk_downgrade')}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpgrade}
                                            disabled={isUpgrading}
                                            className="w-full py-3 bg-orange-700 hover:bg-orange-600 border border-orange-500/50 text-white font-black uppercase tracking-widest rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 group shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
                                            <div className="flex items-center gap-2 text-base relative z-10">
                                                <Hammer size={18} className={isUpgrading ? "animate-bounce" : ""} />
                                                <span>{t('blacksmith.upgrade_action')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-medium opacity-90 relative z-10">
                                                <span className={upgradeReq.chance < 0.5 ? "text-red-300" : "text-orange-200"}>{t('blacksmith.chance')}: {(upgradeReq.chance * 100).toFixed(0)}%</span>
                                            </div>
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center text-stone-500 py-8 flex flex-col items-center gap-2">
                                        {currentLevel >= 5 ? (
                                            <>
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                                                    <Shield size={48} className="text-yellow-500 relative z-10" />
                                                    <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" size={24} />
                                                </div>
                                                <div className="mt-4">
                                                    <h3 className="text-yellow-500 font-black text-xl uppercase tracking-wider">{t('blacksmith.max_level')}</h3>
                                                    <p className="text-stone-400 mt-1">{t('blacksmith.fully_upgraded')}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={32} className="opacity-20" />
                                                <span>{t('blacksmith.cannot_upgrade')}<br /><span className="text-xs opacity-50">{t('blacksmith.no_data')}</span></span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-stone-500 text-sm py-4">{t('blacksmith.not_equipped')}</div>
                    )}
                </div>
            </div>
        );
    };


    const renderSelectView = () => (
        <div className="flex flex-col h-full bg-stone-950">
            <div className="p-4 border-b border-stone-800 bg-stone-900 flex items-center gap-2 shrink-0">
                <button onClick={() => setView('MANAGE')} className="p-1 hover:bg-stone-800 rounded"><ArrowUpCircle className="-rotate-90" size={20} /></button>
                <span className="font-bold text-white uppercase tracking-wider">{t('blacksmith.select_equip')}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
                {availableItems.length === 0 ? (
                    <div className="text-center text-stone-500 py-10 flex flex-col items-center">
                        <Backpack size={48} className="opacity-20 mb-2" />
                        {t('blacksmith.no_items')}
                    </div>
                ) : (
                    availableItems.map(item => {
                        const rarityConfig = RARITY_SETTINGS[item.rarity || 'COMMON'] || RARITY_SETTINGS.COMMON;
                        const durInfo = getDurabilityInfo(item);

                        return (
                            <div
                                key={item.id}
                                onClick={() => { onEquip(item.id); setView('MANAGE'); }}
                                className="bg-stone-900 border border-stone-800 hover:border-cyan-500 rounded-xl p-2 cursor-pointer transition-all flex items-center gap-3 group relative overflow-hidden"
                            >
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                {/* Icon Box */}
                                <div className={`w-16 h-16 shrink-0 rounded-lg bg-stone-950 border ${rarityConfig.border} flex items-center justify-center relative overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.bgGradient} opacity-20`}></div>
                                    <div className="relative z-10 scale-90">
                                        <AccessoryIcon item={item} size={40} />
                                    </div>
                                    {item.level && item.level > 1 && (
                                        <div className="absolute top-0.5 right-0.5 z-20 px-1 py-[1px] rounded-sm bg-black text-cyan-400 text-[9px] font-bold border border-cyan-500/50 font-mono shadow-sm leading-none">
                                            +{item.level}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                    <div className="flex justify-between items-start">
                                        <div className={`text-sm font-bold ${rarityConfig.color} truncate pr-2`}>
                                            {getItemDisplayName(item, t, getLocalized)}
                                        </div>
                                        <div className="text-xs font-mono text-emerald-400 font-bold whitespace-nowrap bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">
                                            +{formatCurrency(isNaN(Number(item.dailyBonus)) ? 0 : Number(item.dailyBonus))}/d
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400 uppercase tracking-wider font-bold`}>
                                            {rarityConfig.label}
                                        </span>

                                        {durInfo && (
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <div className="w-16 h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                                                    <div
                                                        className={`h-full ${durInfo.isExpired ? 'bg-red-500' : durInfo.percent <= 20 ? 'bg-red-500' : durInfo.percent <= 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${Math.max(0, Math.min(100, durInfo.percent))}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[9px] font-mono ${durInfo.isWarning ? 'text-red-400' : 'text-stone-500'}`}>
                                                    {durInfo.percent}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    // --- REPAIR CONFIRMATION MODAL ---
    const renderRepairConfirm = () => {
        if (!showRepairConfirm || !selectedRepairKit || !equippedItem) return null;
        const kitConfig = getRepairKitConfigForEquipment(equippedItem.typeId || '');
        const kitName = getLocalized(selectedRepairKit.name || kitConfig?.name);
        const equipName = getItemDisplayName(equippedItem, t, getLocalized);
        const durInfo = getDurabilityInfo(equippedItem);
        const repairHP = selectedRepairKit.repairValue || (kitConfig as any)?.repairValue || 3000;

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowRepairConfirm(false)}>
                <div className="bg-stone-950 border-2 border-emerald-700 rounded-xl w-full max-w-xs p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]" onClick={e => e.stopPropagation()}>
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto bg-emerald-900/30 rounded-full flex items-center justify-center border-2 border-emerald-600 mb-3">
                            <Wrench size={32} className="text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">
                            {language === 'th' ? 'ยืนยันการซ่อมบำรุง' : 'Confirm Repair'}
                        </h3>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 mb-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-stone-500">{language === 'th' ? 'อุปกรณ์:' : 'Equipment:'}</span>
                            <span className="text-white font-bold">{equipName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-stone-500">{language === 'th' ? 'ชุดซ่อม:' : 'Kit:'}</span>
                            <span className="text-emerald-400 font-bold">{kitName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-stone-500">{language === 'th' ? 'ฟื้นฟู HP:' : 'Restore HP:'}</span>
                            <span className="text-cyan-400 font-bold">+{repairHP.toLocaleString()} HP</span>
                        </div>
                        {durInfo && (
                            <div className="flex justify-between border-t border-stone-800 pt-2">
                                <span className="text-stone-500">{language === 'th' ? 'สถานะ:' : 'Status:'}</span>
                                <span className={durInfo.isExpired ? 'text-red-400 font-bold' : durInfo.isWarning ? 'text-yellow-400 font-bold' : 'text-stone-300'}>
                                    {durInfo.isExpired
                                        ? (language === 'th' ? 'พัง' : 'Broken')
                                        : `${durInfo.current.toLocaleString()} / ${durInfo.max.toLocaleString()} HP (${durInfo.percent}%)`
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowRepairConfirm(false)}
                            className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-300 font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleRepair}
                            disabled={isRepairing}
                            className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                            <Wrench size={14} className={isRepairing ? 'animate-spin' : ''} />
                            {isRepairing ? (language === 'th' ? 'กำลังซ่อม...' : 'Repairing...') : (language === 'th' ? 'ยืนยัน' : 'Confirm')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-sans">
            {renderMiningAnimation()}
            {renderResultPopup()}
            {renderRepairConfirm()}
            <div className="bg-stone-950 border border-stone-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh] relative">

                <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-900/20 p-2 rounded text-orange-500"><Hammer size={20} /></div>
                        <div>
                            <h2 className="text-lg font-display font-black text-white uppercase tracking-wider">{t('blacksmith.title')}</h2>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest">{t('blacksmith.slot')} {slotIndex + 1}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                {view === 'MANAGE' ? renderManageView() : renderSelectView()}
            </div>
        </div>
    );
};
