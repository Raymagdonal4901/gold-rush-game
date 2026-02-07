import React, { useState, useEffect } from 'react';
import { X, Shield, ArrowUpCircle, Cpu, CheckCircle2, AlertTriangle, Plus, Sparkles, XCircle, Hammer, Backpack, Glasses, Monitor, Smartphone, Truck, Footprints, Zap, TrendingUp, Rocket, Flame, CloudFog, Anvil, FileText, HardHat, Shirt, Bot, Key, Factory, Search, Hourglass, Gem, Lock } from 'lucide-react';
import { AccessoryItem, OilRig } from '../services/types';
import { InfinityGlove } from './InfinityGlove';
import { CURRENCY, RARITY_SETTINGS, EQUIPMENT_UPGRADE_CONFIG, MATERIAL_CONFIG, EQUIPMENT_SERIES, UPGRADE_REQUIREMENTS, SHOP_ITEMS } from '../constants';
import { api } from '../services/api';
import { MaterialIcon } from './MaterialIcon';

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
}

export const AccessoryManagementModal: React.FC<AccessoryManagementModalProps> = ({
    isOpen, onClose, rig, slotIndex, equippedItem, inventory, userId, onEquip, onUnequip, onRefresh, materials = {}, addNotification
}) => {
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

    useEffect(() => {
        if (isOpen) {
            setView(equippedItem ? 'MANAGE' : 'SELECT');
            setUpgradeMsg(null);
            setIsUpgrading(false);
            setUpgradePhase('IDLE');
            setUseInsurance(false);
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
                message: 'ไม่มีใบประกันความเสี่ยง!',
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
        }, 1500);

        setTimeout(() => {
            setUpgradePhase('COOLING');
        }, 3500);

        try {
            const res = await api.inventory.upgrade(equippedItem.id, useInsurance);

            setTimeout(() => {
                if (res.success) {
                    setUpgradeMsg({
                        type: 'SUCCESS',
                        text: 'UPGRADE SUCCESS!',
                        level: res.item?.level,
                        subtext: 'การตีบวกสำเร็จ!',
                        oldBonus,
                        newBonus: res.item?.dailyBonus,
                        itemName
                    });
                } else {
                    setUpgradeMsg({
                        type: 'ERROR',
                        text: 'UPGRADE FAILED!',
                        subtext: res.message || 'อุปกรณ์เสียหายจากการตีบวก',
                        level: res.item?.level
                    });
                }
                onRefresh();
                setIsUpgrading(false);
                setUpgradePhase('IDLE');
            }, 4500);
        } catch (e: any) {
            setTimeout(() => {
                setUpgradeMsg({
                    type: 'ERROR',
                    text: 'SYSTEM ERROR',
                    subtext: e.response?.data?.message || e.message || 'เกิดข้อผิดพลาด'
                });
                setIsUpgrading(false);
                setUpgradePhase('IDLE');
            }, 4500);
        }
    };

    // ... (rendering code)
    // I will replace `handleUpgrade` definition and add state.
    // But `insuranceCount` needs to be defined in render scope.

    // Let's replace the top part first (state + useEffect)


    if (!isOpen) return null;

    const getSeriesKey = (typeIdRaw: string | null | undefined) => {
        const typeId = typeIdRaw || '';
        if (typeId.includes('glove')) return 'glove';
        const series = Object.keys(EQUIPMENT_SERIES).find(key => typeId.startsWith(key));
        if (series) return series;
        if (typeId.includes('shirt') || typeId.includes('uniform')) return 'uniform';
        if (typeId.includes('hat') || typeId.includes('helmet')) return 'hat';
        if (typeId.includes('tool')) return 'glove';
        return null;
    };

    const isEquipable = (item: AccessoryItem) => {
        // 1. Check by ID config
        const typeId = item.typeId || '';
        const itemConfig = SHOP_ITEMS.find(s => s.id === typeId);
        if (itemConfig && itemConfig.tier !== undefined) return true;

        // 2. Fallback: Check by Name
        const name = item.name || '';
        if (name.includes('หมวก') || name.includes('Helmet')) return true;
        if (name.includes('แว่นขยาย') || name.includes('Magnifying')) return false; // Auto-activate tool
        if (name.includes('แว่น') || name.includes('Glasses')) return true;
        if (name.includes('ชุด') || name.includes('Uniform') || name.includes('Suit')) return true;
        if (name.includes('กระเป๋า') || name.includes('Bag') || name.includes('Backpack')) return true;
        if (name.includes('รองเท้า') || name.includes('Boots')) return true;
        if (name.includes('มือถือ') || name.includes('Mobile') || name.includes('Phone')) return true;
        if (name.includes('คอม') || name.includes('PC') || name.includes('Computer')) return true;
        if (name.includes('รถขุด') || name.includes('Excavator')) return true;

        return false;
    };

    const availableItems = inventory.filter(item => {
        if (!item) return false;
        const typeId = item.typeId || '';
        const isGlove = typeId.includes('glove');
        if (slotIndex === 0) return isGlove;
        return !isGlove && isEquipable(item);
    }).filter(item => !item.expireAt || item.expireAt > Date.now());



    const getItemDisplayName = (item: any) => {
        const typeId = item.typeId || '';
        const name = item.name || '';
        if (typeId === 'chest_key' || name.includes('กุญแจ') || name.includes('Key')) return 'กุญแจเข้าเหมือง';
        if (typeId === 'upgrade_chip' || name.includes('ชิป') || name.includes('Chip')) return 'ชิปอัปเกรด';
        if (typeId === 'mixer' || name.includes('โต๊ะช่าง') || name.includes('Mixer')) return 'โต๊ะช่างสกัดแร่';
        if (typeId === 'magnifying_glass' || name.includes('แว่นขยาย') || name.includes('Search')) return 'แว่นขยายส่องแร่';
        if (typeId === 'robot' || name.includes('หุ่นยนต์') || name.includes('Robot')) return 'หุ่นยนต์ AI';
        return name;
    };

    const getAccessoryIcon = (item: AccessoryItem, size: number = 64) => {
        if (!item) return <InfinityGlove size={size} />;

        // Fix: Force detecting type by name if typeId is generic or missing specific handling
        let typeId = item.typeId || '';
        const name = item.name || '';

        // Name-based overrides to fix "Glove" icon issue
        if (name.includes('ชิป') || name.includes('Chip')) typeId = 'upgrade_chip';
        else if (name.includes('กุญแจ') || name.includes('Key')) typeId = 'chest_key';
        else if (name.includes('เครื่องผสม') || name.includes('Mixer')) typeId = 'mixer';
        else if (name.includes('แว่นขยาย') || name.includes('Magnifying')) typeId = 'magnifying_glass';
        else if (name.includes('ใบประกัน') || name.includes('Insurance')) typeId = 'insurance_card';
        else if (name.includes('นาฬิกาทราย') || name.includes('Hourglass')) typeId = 'hourglass_small';
        else if (name.includes('แร่ปริศนา') || name.includes('Mystery Ore')) typeId = 'mystery_ore';
        else if (name.includes('แร่ในตำนาน') || name.includes('Legendary Ore')) typeId = 'legendary_ore';
        else if (name.includes('รถขุด') || name.includes('Excavator')) typeId = 'auto_excavator';
        else if (name.includes('หุ่นยนต์') || name.includes('Robot')) typeId = 'robot';
        // Classic Equipment Fallbacks
        else if (name.includes('หมวก') || name.includes('Helmet')) typeId = 'hat';
        else if (name.includes('แว่น') || name.includes('Glasses')) typeId = 'glasses'; // Note: Magnifying Glass handled above
        else if (name.includes('ชุด') || name.includes('Uniform') || name.includes('Suit')) typeId = 'uniform';
        else if (name.includes('กระเป๋า') || name.includes('Bag') || name.includes('Backpack')) typeId = 'bag';
        else if (name.includes('รองเท้า') || name.includes('Boots')) typeId = 'boots';
        else if (name.includes('มือถือ') || name.includes('Mobile') || name.includes('Phone')) typeId = 'mobile';
        else if (name.includes('คอม') || name.includes('PC') || name.includes('Computer')) typeId = 'pc';

        if (typeId.includes('glove')) return <InfinityGlove rarity={item.rarity} size={size} />;

        const getNeonIcon = (typeId: string) => {
            if (!typeId) return <InfinityGlove size={size} />;
            const props = { size, className: "relative z-10" };

            if (typeId.startsWith('hat')) {
                return <HardHat {...props} className={`${props.className} text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]`} />;
            }
            if (typeId.startsWith('glasses')) {
                return <Glasses {...props} className={`${props.className} text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]`} />;
            }
            if (typeId.startsWith('uniform') || typeId.startsWith('shirt')) {
                return <Shirt {...props} className={`${props.className} text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]`} />;
            }
            if (typeId.startsWith('bag')) {
                return <Backpack {...props} className={`${props.className} text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]`} />;
            }
            if (typeId.startsWith('boots')) {
                return <Footprints {...props} className={`${props.className} text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]`} />;
            }
            if (typeId.startsWith('mobile')) {
                return <Smartphone {...props} className={`${props.className} text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]`} />;
            }
            if (typeId.startsWith('pc')) {
                return <Monitor {...props} className={`${props.className} text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]`} />;
            }
            if (typeId === 'auto_excavator' || typeId.startsWith('truck')) {
                return <Truck {...props} className={`${props.className} text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]`} />;
            }
            if (typeId.startsWith('robot')) {
                return <Bot {...props} className={`${props.className} text-yellow-500 animate-pulse drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]`} />;
            }
            if (typeId === 'upgrade_chip' || typeId.startsWith('chip')) {
                return <Cpu {...props} className={`${props.className} text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]`} />;
            }
            if (typeId === 'chest_key' || typeId.startsWith('key')) {
                return <Key {...props} className={`${props.className} text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]`} />;
            }
            if (typeId === 'mixer') {
                return <Factory {...props} className={`${props.className} text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]`} />;
            }
            if (typeId === 'magnifying_glass') {
                return <Search {...props} className={`${props.className} text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]`} />;
            }
            if (typeId === 'insurance_card' || typeId.includes('insurance')) {
                return <FileText {...props} className={`${props.className} text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]`} />;
            }
            if (typeId.startsWith('hourglass')) {
                return <Hourglass {...props} className={`${props.className} text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]`} />;
            }
            if (typeId === 'mystery_ore') {
                return <Sparkles {...props} className={`${props.className} text-purple-300 drop-shadow-[0_0_12px_rgba(216,180,254,0.8)]`} />;
            }
            if (typeId === 'legendary_ore') {
                return <Gem {...props} className={`${props.className} text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.8)]`} />;
            }

            return <InfinityGlove size={size} className={props.className} />;
        };

        return getNeonIcon(typeId);
    };

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
                        {equippedItem && getAccessoryIcon(equippedItem, 80)}
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
                        {upgradePhase === 'HEATING' && <span className="text-orange-500">กำลังเผา...!</span>}
                        {upgradePhase === 'HAMMERING' && <span className="text-yellow-500">ตรึ้ง! ตรึ้ง!</span>}
                        {upgradePhase === 'COOLING' && <span className="text-stone-300">กำลังชุบแข็ง...</span>}
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
                                <span className="text-yellow-700/80 text-[10px] uppercase font-bold tracking-widest">ตีบวกสำเร็จ</span>
                                <div className="text-white font-bold text-lg">{upgradeMsg.itemName}</div>
                            </div>
                            <div className="flex justify-center my-2">
                                <div className="px-6 py-1 bg-yellow-950/50 border border-yellow-600 rounded-lg">
                                    <span className="text-yellow-400 font-bold text-2xl drop-shadow-md">LV.{upgradeMsg.level}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-sm font-bold">
                                <div className="text-stone-500">{upgradeMsg.oldBonus?.toFixed(2)}</div>
                                <div className="text-yellow-500">→</div>
                                <div className="text-green-400 font-bold">+{upgradeMsg.newBonus?.toFixed(2)}</div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setUpgradeMsg(null)}
                        className={`w-full py-4 font-bold text-white uppercase tracking-wider hover:brightness-110 transition-all rounded-xl shadow-lg relative z-10
                        ${isSuccess ? 'bg-gradient-to-r from-yellow-700 to-orange-700 border-t border-yellow-400' : 'bg-stone-700 border-t border-stone-500'}`}
                    >
                        ตกลง (OK)
                    </button>
                </div>
            </div>
        );
    };

    const renderManageView = () => {
        const rarityConfig = equippedItem ? RARITY_SETTINGS[equippedItem.rarity] : RARITY_SETTINGS['COMMON'];
        const currentLevel = equippedItem?.level || 1;
        const nextLevel = currentLevel + 1;

        let upgradeReq: any = null;

        if (equippedItem) {
            const seriesKey = getSeriesKey(equippedItem.typeId);
            if (seriesKey && EQUIPMENT_UPGRADE_CONFIG[seriesKey]) {
                upgradeReq = EQUIPMENT_UPGRADE_CONFIG[seriesKey][currentLevel];
            } else if (equippedItem.typeId && equippedItem.typeId.includes('glove')) {
                const legacyReq = UPGRADE_REQUIREMENTS[currentLevel];
                if (legacyReq) {
                    upgradeReq = {
                        chipAmount: legacyReq.catalyst || 0,
                        matTier: legacyReq.matTier,
                        matAmount: legacyReq.matAmount,
                        cost: legacyReq.cost,
                        chance: legacyReq.chance || 1.0,
                        bonusMultiplier: 0
                    };
                }
            }
        }

        const matName = upgradeReq ? MATERIAL_CONFIG.NAMES[upgradeReq.matTier as keyof typeof MATERIAL_CONFIG.NAMES] : '';

        const currentBonus = equippedItem?.dailyBonus || 0;
        let nextBonusValue = currentBonus;

        if (upgradeReq) {
            if (upgradeReq.targetBonus !== undefined) {
                // Refined Incremental Logic:
                const currentLevel = equippedItem?.level || 1;
                const currentTarget = UPGRADE_REQUIREMENTS[currentLevel - 1]?.targetBonus || 0;
                const nextTarget = upgradeReq.targetBonus || 0;
                const increase = nextTarget - currentTarget;
                nextBonusValue = currentBonus + increase;
            } else if (upgradeReq.bonusMultiplier > 0) {
                nextBonusValue = currentBonus * upgradeReq.bonusMultiplier;
            } else {
                const shopConfig = SHOP_ITEMS.find(s => s.id === equippedItem?.typeId);
                const tier = shopConfig?.tier || 1;
                const boost = tier === 3 ? 2.0 : tier === 2 ? 1.0 : 0.44;
                nextBonusValue = currentBonus + boost;
            }
        }

        const bonusDiff = nextBonusValue - currentBonus;

        // Calculate owned chips
        const ownedChips = inventory.filter(i => i.typeId === 'upgrade_chip').length;
        const hasEnoughChips = ownedChips >= (upgradeReq?.chipAmount || 0);

        return (
            <div className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar touch-pan-y pb-2">
                {/* Horizontal layout: Card + Level info side by side */}
                <div className="flex-none flex items-center gap-3 p-2 bg-stone-900/50 border-b border-stone-800">
                    {equippedItem ? (
                        <>
                            {/* Tiny Icon - no card */}
                            <div className={`w-8 h-8 rounded ${rarityConfig.border} bg-stone-900/90 flex items-center justify-center flex-shrink-0`}>
                                {getAccessoryIcon(equippedItem, 16)}
                            </div>

                            {/* Item Name + Level Progress */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm ${rarityConfig.color} truncate`}>{getItemDisplayName(equippedItem)}</h3>
                                {upgradeReq && (
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                        <span className="text-white font-mono font-bold">LV.{currentLevel}</span>
                                        <Rocket className="rotate-45 text-stone-600" size={10} />
                                        <span className="text-cyan-500 font-mono font-bold">LV.{nextLevel}</span>
                                        <span className="text-cyan-400 font-mono text-[10px]">+{bonusDiff.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div onClick={() => setView('SELECT')} className="w-full py-4 rounded-lg border-2 border-dashed border-stone-700 bg-stone-900/50 flex items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-stone-800/80 transition-all gap-2">
                            <Plus className="text-stone-500" size={20} />
                            <span className="text-stone-500 font-bold uppercase tracking-wider text-xs">เลือกอุปกรณ์</span>
                        </div>
                    )}
                </div>

                <div className="bg-stone-900 p-3 border-t border-stone-800">
                    {equippedItem ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                {slotIndex !== 0 ? (
                                    <>
                                        <button onClick={() => setView('SELECT')} className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-500 rounded-lg text-stone-300 font-bold text-xs uppercase tracking-wider transition-all">เปลี่ยนอุปกรณ์</button>
                                        <button onClick={onUnequip} className="px-4 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-red-500 font-bold text-xs uppercase tracking-wider transition-all">ถอดออก</button>
                                    </>
                                ) : (
                                    <div className="flex-1 py-3 text-center text-stone-500 font-bold text-xs uppercase tracking-widest bg-stone-900/50 rounded-lg border border-stone-800 flex items-center justify-center gap-2">
                                        <Lock size={12} className="text-stone-600" /> อุปกรณ์ถาวร (ติดตัวเครื่อง)
                                    </div>
                                )}
                            </div>

                            <div className="bg-stone-950 border border-stone-800 rounded-lg p-2 relative overflow-hidden">
                                {upgradeReq ? (
                                    <>
                                        <div className="flex items-center gap-1 mb-2 bg-stone-900 p-2 rounded-lg border border-stone-800 shadow-inner text-[10px]">

                                            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-300 border-r border-stone-800 pr-1">
                                                <div className="flex items-center gap-1 text-purple-400 font-bold"><Cpu size={10} /> ชิป</div>
                                                <span className={`font-mono ${hasEnoughChips ? 'text-white' : 'text-red-500'}`}>
                                                    {ownedChips}/{upgradeReq.chipAmount}
                                                </span>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-300">
                                                <div className="flex items-center gap-1 text-blue-400 font-bold"><MaterialIcon id={upgradeReq.matTier} size="w-2.5 h-2.5" iconSize={8} /> วัตถุดิบ</div>
                                                <span className={`font-mono ${((materials[upgradeReq.matTier] || 0) >= upgradeReq.matAmount) ? 'text-white' : 'text-red-500'}`}>
                                                    {matName} {materials[upgradeReq.matTier] || 0}/{upgradeReq.matAmount}
                                                </span>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-300 border-l border-stone-800 pl-1">
                                                <div className="text-yellow-600 font-bold">ค่าใช้จ่าย</div>
                                                <span className="text-yellow-500 font-bold font-mono">฿{upgradeReq.cost.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-1 bg-stone-900/50 p-1.5 rounded border border-stone-800 text-[9px]">
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${useInsurance ? 'bg-cyan-500 border-cyan-400' : 'bg-stone-800 border-stone-600'}`}
                                                    onClick={() => {
                                                        if (insuranceCount > 0) setUseInsurance(!useInsurance);
                                                        else if (addNotification) addNotification({
                                                            id: Date.now().toString(),
                                                            userId: userId,
                                                            message: 'ไม่มีใบประกันความเสี่ยง',
                                                            type: 'ERROR',
                                                            read: false,
                                                            timestamp: Date.now()
                                                        });
                                                    }}
                                                >
                                                    {useInsurance && <CheckCircle2 size={10} className="text-white" />}
                                                </div>
                                                <div className="text-stone-300">
                                                    <span className="font-bold flex items-center gap-0.5">
                                                        <Shield size={10} className="text-emerald-400" /> ประกัน ({insuranceCount})
                                                    </span>
                                                </div>
                                            </div>
                                            {useInsurance ? (
                                                <span className="text-emerald-400 font-bold">✓ ป้องกัน</span>
                                            ) : (
                                                <span className={upgradeReq.risk === 'NONE' ? 'text-emerald-500' : 'text-red-400'}>
                                                    {upgradeReq.risk === 'NONE' ? 'ไม่มีความเสี่ยง' : 'เสี่ยง: อุปกรณ์แตก'}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpgrade}
                                            disabled={isUpgrading}
                                            className="w-full py-2.5 bg-orange-700 hover:bg-orange-600 border border-orange-500/50 text-white font-black uppercase tracking-widest rounded-lg transition-all flex flex-col items-center justify-center gap-0 group shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                                        >
                                            <div className="flex items-center gap-2 text-sm relative z-10">
                                                <Hammer size={16} className={isUpgrading ? "animate-bounce" : ""} />
                                                <span>ตีบวก ({(upgradeReq.chance * 100).toFixed(0)}%)</span>
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
                                                    <h3 className="text-yellow-500 font-black text-xl uppercase tracking-wider">ระดับสูงสุด</h3>
                                                    <p className="text-stone-400 mt-1">อัปเกรดเต็มแล้ว</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={32} className="opacity-20" />
                                                <span>ไม่สามารถตีบวกได้<br /><span className="text-xs opacity-50">(ไม่มีข้อมูล)</span></span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-stone-500 text-sm py-4">ไม่ได้สวมใส่อุปกรณ์</div>
                    )}
                </div>
            </div >
        );
    };


    const renderSelectView = () => (
        <div className="flex flex-col h-full bg-stone-950">
            <div className="p-4 border-b border-stone-800 bg-stone-900 flex items-center gap-2">
                <button onClick={() => setView('MANAGE')} className="p-1 hover:bg-stone-800 rounded"><ArrowUpCircle className="-rotate-90" size={20} /></button>
                <span className="font-bold text-white uppercase tracking-wider">เลือกอุปกรณ์</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-2 gap-3">
                {availableItems.length === 0 ? (
                    <div className="col-span-2 text-center text-stone-500 py-10">ไม่พบไอเทม</div>
                ) : (
                    availableItems.map(item => (
                        <div key={item.id} onClick={() => { onEquip(item.id); setView('MANAGE'); }} className="bg-stone-900 border border-stone-800 hover:border-cyan-500 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-2 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative scale-75">
                                {getAccessoryIcon(item)}
                            </div>
                            <div>
                                <div className={`text-xs font-bold ${RARITY_SETTINGS[item.rarity].color} font-mono tracking-tighter`}>{getItemDisplayName(item)}</div>
                                <div className="flex flex-col items-center mt-1">
                                    <div className="text-[10px] text-cyan-400 font-mono">+{item.dailyBonus || 0} / วัน</div>
                                    <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest mt-0.5">โบนัส: +{item.dailyBonus || 0} / วัน</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-sans">
            {renderMiningAnimation()}
            {renderResultPopup()}
            <div className="bg-stone-950 border border-stone-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh] relative">

                <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-900/20 p-2 rounded text-orange-500"><Hammer size={20} /></div>
                        <div>
                            <h2 className="text-lg font-display font-black text-white uppercase tracking-wider">โรงตีบวก (Blacksmith)</h2>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest">Slot {slotIndex + 1}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                {view === 'MANAGE' ? renderManageView() : renderSelectView()}
            </div>
        </div>
    );
};
