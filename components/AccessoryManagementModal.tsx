import React, { useState, useEffect } from 'react';
import { X, Shield, ArrowUpCircle, Cpu, CheckCircle2, AlertTriangle, Plus, Sparkles, XCircle, Hammer, Backpack, Glasses, Monitor, Smartphone, Truck, Footprints, Zap, TrendingUp, Rocket, Flame, CloudFog, Anvil, FileText, HardHat, Shirt, Bot, Key } from 'lucide-react';
import { AccessoryItem, OilRig } from '../services/types';
import { InfinityGlove } from './InfinityGlove';
import { CURRENCY, RARITY_SETTINGS, EQUIPMENT_UPGRADE_CONFIG, MATERIAL_CONFIG, EQUIPMENT_SERIES, UPGRADE_REQUIREMENTS, SHOP_ITEMS } from '../constants';
import { MockDB } from '../services/db';
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
}

export const AccessoryManagementModal: React.FC<AccessoryManagementModalProps> = ({
    isOpen, onClose, rig, slotIndex, equippedItem, inventory, userId, onEquip, onUnequip, onRefresh
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

    const handleUpgrade = () => {
        if (!equippedItem) return;

        if (useInsurance && insuranceCount === 0) {
            alert('ไม่มีใบประกันความเสี่ยง!');
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

        setTimeout(() => {
            try {
                const res = MockDB.upgradeAccessory(userId, equippedItem.id, useInsurance);
                if (res.success) {
                    setUpgradeMsg({
                        type: 'SUCCESS',
                        text: 'UPGRADE SUCCESS!',
                        level: res.newItem?.level,
                        subtext: 'การตีบวกสำเร็จ!',
                        oldBonus,
                        newBonus: res.newItem?.dailyBonus,
                        itemName
                    });
                } else {
                    setUpgradeMsg({
                        type: 'ERROR',
                        text: 'UPGRADE FAILED!',
                        subtext: res.message || 'อุปกรณ์เสียหายจากการตีบวก',
                        level: res.newItem?.level
                    });
                }
                onRefresh();
                setIsUpgrading(false);
                setUpgradePhase('IDLE');
            } catch (e: any) {
                setUpgradeMsg({
                    type: 'ERROR',
                    text: 'SYSTEM ERROR',
                    subtext: e.message || 'เกิดข้อผิดพลาด'
                });
                setIsUpgrading(false);
                setUpgradePhase('IDLE');
            }
        }, 4500);
    };

    // ... (rendering code)
    // I will replace `handleUpgrade` definition and add state.
    // But `insuranceCount` needs to be defined in render scope.

    // Let's replace the top part first (state + useEffect)


    if (!isOpen) return null;

    const getSeriesKey = (typeId: string) => {
        if (typeId.includes('glove')) return 'glove';
        const series = Object.keys(EQUIPMENT_SERIES).find(key => typeId.startsWith(key));
        if (series) return series;
        if (typeId.includes('shirt') || typeId.includes('uniform')) return 'uniform';
        if (typeId.includes('hat') || typeId.includes('helmet')) return 'hat';
        if (typeId.includes('tool')) return 'glove';
        return null;
    };

    const isEquipable = (typeId: string) => {
        const itemConfig = SHOP_ITEMS.find(s => s.id === typeId);
        // Only items with a defined 'tier' are considered wearable equipment
        return itemConfig && itemConfig.tier !== undefined;
    };

    const availableItems = inventory.filter(item => {
        const isGlove = item.typeId.includes('glove');
        if (slotIndex === 0) return isGlove;
        return !isGlove && isEquipable(item.typeId);
    }).filter(item => !item.expireAt || item.expireAt > Date.now());



    const getAccessoryIcon = (item: AccessoryItem, size: number = 64) => {
        if (item.typeId.includes('glove')) return <InfinityGlove rarity={item.rarity} size={size} />;

        const getNeonIcon = (typeId: string) => {
            const props = { size, className: "relative z-10" };

            if (typeId.includes('hat') || typeId.includes('helmet')) {
                return <HardHat {...props} className={`${props.className} text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]`} />;
            }
            if (typeId.includes('glass')) {
                return <Glasses {...props} className={`${props.className} text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]`} />;
            }
            if (typeId.includes('shirt') || typeId.includes('uniform')) {
                return <Shirt {...props} className={`${props.className} text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]`} />;
            }
            if (typeId.includes('bag')) {
                return <Backpack {...props} className={`${props.className} text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]`} />;
            }
            if (typeId.includes('boot')) {
                return <Footprints {...props} className={`${props.className} text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]`} />;
            }
            if (typeId.includes('mobile')) {
                return <Smartphone {...props} className={`${props.className} text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]`} />;
            }
            if (typeId.includes('pc')) {
                return <Monitor {...props} className={`${props.className} text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]`} />;
            }
            if (typeId.includes('excavator')) {
                return <Truck {...props} className={`${props.className} text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]`} />;
            }
            if (typeId.includes('robot')) {
                return <Bot {...props} className={`${props.className} text-yellow-500 animate-pulse drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]`} />;
            }
            if (typeId.includes('upgrade_chip')) {
                return <Cpu {...props} className={`${props.className} text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]`} />;
            }
            if (typeId.includes('chest_key') || typeId.includes('key')) {
                return <Key {...props} className={`${props.className} text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]`} />;
            }
            if (typeId.includes('insurance')) {
                return <FileText {...props} className={`${props.className} text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]`} />;
            }

            return <FileText {...props} className={`${props.className} text-stone-500`} />;
        };

        return getNeonIcon(item.typeId);
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
            } else if (equippedItem.typeId.includes('glove')) {
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
            if (upgradeReq.bonusMultiplier > 0) {
                nextBonusValue = currentBonus * 1.15;
            } else {
                const shopConfig = SHOP_ITEMS.find(s => s.id === equippedItem?.typeId);
                const tier = shopConfig?.tier || 1;
                const boost = tier === 3 ? 2.0 : tier === 2 ? 1.0 : 0.44;
                nextBonusValue = currentBonus + boost;
            }
        }

        const bonusDiff = nextBonusValue - currentBonus;

        return (
            <div className="flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-900/50 min-h-[300px]">
                    {equippedItem ? (
                        <div className={`relative w-48 h-64 rounded-2xl border-2 ${rarityConfig.border} bg-stone-900/90 flex flex-col items-center justify-center overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-300 group`}>
                            {/* Tech overlay on card */}
                            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>

                            <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.bgGradient} opacity-20`}></div>
                            <div className="relative z-10 mb-4 scale-125 drop-shadow-2xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
                                {getAccessoryIcon(equippedItem)}
                            </div>
                            <div className="relative z-10 text-center px-4">
                                <h3 className={`font-bold text-lg leading-tight ${rarityConfig.color} drop-shadow-sm`}>{equippedItem.name}</h3>
                                <div className="text-xs text-stone-400 mt-1 uppercase tracking-wide opacity-80">{rarityConfig.label}</div>
                                {equippedItem.level && equippedItem.level > 1 && (
                                    <span className="inline-block mt-2 px-3 py-0.5 rounded-sm bg-stone-800 text-cyan-400 text-[10px] font-bold shadow-lg border border-cyan-500/30 backdrop-blur-sm font-mono tracking-widest">
                                        LV.{equippedItem.level}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => setView('SELECT')} className="w-48 h-64 rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-stone-800/80 transition-all group">
                            <Plus className="text-stone-500 group-hover:text-cyan-500 mb-4 transition-colors" size={32} />
                            <span className="text-stone-500 font-bold group-hover:text-cyan-500 transition-colors uppercase tracking-widest text-sm">เลือกอุปกรณ์</span>
                        </div>
                    )}
                </div>

                <div className="bg-stone-900 p-6 border-t border-stone-800">
                    {equippedItem ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <button onClick={() => setView('SELECT')} className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-500 rounded-lg text-stone-300 font-bold text-xs uppercase tracking-wider transition-all">เปลี่ยนอุปกรณ์</button>
                                <button onClick={onUnequip} className="px-4 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-red-500 font-bold text-xs uppercase tracking-wider transition-all">ถอดออก</button>
                            </div>

                            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 relative overflow-hidden">
                                {upgradeReq ? (
                                    <>
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-900">
                                            <div className="flex items-center gap-3">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-stone-500 uppercase">ปัจจุบัน</div>
                                                    <div className="text-xl font-black text-white font-mono">LV.{currentLevel}</div>
                                                </div>
                                                <div className="text-stone-600"><Rocket className="rotate-45" size={16} /></div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-cyan-500 uppercase font-bold">ถัดไป</div>
                                                    <div className="text-xl font-black text-cyan-500 font-mono">LV.{nextLevel}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-stone-500 uppercase">โบนัส</div>
                                                <div className="text-cyan-400 font-bold font-mono text-lg flex items-center justify-end gap-1">
                                                    <TrendingUp size={14} />
                                                    +{bonusDiff.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-6 bg-stone-900 p-3 rounded-lg border border-stone-800 shadow-inner">
                                            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-stone-300 border-r border-stone-800 pr-2">
                                                <div className="flex items-center gap-1 text-purple-400 font-bold"><Cpu size={12} /> ชิป</div>
                                                <span className="font-mono text-sm">x{upgradeReq.chipAmount}</span>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-stone-300">
                                                <div className="flex items-center gap-1 text-blue-400 font-bold"><MaterialIcon id={upgradeReq.matTier} size="w-3 h-3" iconSize={10} /> วัตถุดิบ</div>
                                                <span className="font-mono text-sm">{matName} x{upgradeReq.matAmount}</span>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-stone-300 border-l border-stone-800 pl-2">
                                                <div className="text-yellow-600 font-bold">ค่าใช้จ่าย</div>
                                                <span className="text-yellow-500 font-bold font-mono text-sm">฿{upgradeReq.cost.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4 bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${useInsurance ? 'bg-cyan-500 border-cyan-400' : 'bg-stone-800 border-stone-600'}`}
                                                    onClick={() => {
                                                        if (insuranceCount > 0) setUseInsurance(!useInsurance);
                                                        else alert('ไม่มีใบประกันความเสี่ยง');
                                                    }}
                                                >
                                                    {useInsurance && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <div className="text-xs text-stone-300">
                                                    <div className="font-bold flex items-center gap-1">
                                                        <Shield size={12} className="text-emerald-400" /> ใบประกันความเสี่ยง
                                                    </div>
                                                    <div className="text-[10px] text-stone-500">มีครอบครอง: {insuranceCount} ใบ</div>
                                                </div>
                                            </div>
                                            {useInsurance ? (
                                                <div className="text-[10px] items-center flex gap-1 text-emerald-400 font-bold bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                                                    <Shield size={10} /> ป้องกันแล้ว
                                                </div>
                                            ) : (
                                                <div className="text-[10px] items-center flex gap-1 text-red-400 font-bold bg-red-950/10 px-2 py-1 rounded border border-red-900/20">
                                                    <AlertTriangle size={10} /> ความเสี่ยง: ลดระดับ
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpgrade}
                                            disabled={isUpgrading}
                                            className="w-full py-4 bg-orange-700 hover:bg-orange-600 border border-orange-500/50 text-white font-black uppercase tracking-widest rounded-xl transition-all flex flex-col items-center justify-center gap-1 group shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
                                            <div className="flex items-center gap-2 text-lg relative z-10">
                                                <Hammer size={20} className={isUpgrading ? "animate-bounce" : ""} />
                                                <span>ตีบวก (UPGRADE)</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-medium opacity-90 relative z-10">
                                                <span className={upgradeReq.chance < 0.5 ? "text-red-300" : "text-orange-200"}>
                                                    โอกาสสำเร็จ: {(upgradeReq.chance * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </button>

                                        {upgradeReq.chance < 1.0 && (
                                            <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] text-red-500/80 font-bold bg-red-950/30 py-1.5 rounded border border-red-900/30">
                                                <AlertTriangle size={10} />
                                                คำเตือน: มีความเสี่ยงที่จะล้มเหลว
                                            </div>
                                        )}
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
            </div>
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
                                <div className={`text-xs font-bold ${RARITY_SETTINGS[item.rarity].color} font-mono tracking-tighter`}>{item.name}</div>
                                <div className="text-[10px] text-cyan-400 mt-1 font-mono">+{item.dailyBonus || 0} / วัน</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-sans">
            <style jsx global>{`
                @font-face {
                    font-family: 'Geist Mono';
                    src: url('https://rsms.me/inter/inter.css');
                }
                .font-display { font-family: 'Inter', sans-serif; }
                .font-mono { font-family: monospace; }
                @keyframes hammer {
                    0% { transform: rotate(45deg); }
                    50% { transform: rotate(-45deg); }
                    100% { transform: rotate(45deg); }
                }
            `}</style>
            {renderMiningAnimation()}
            {renderResultPopup()}
            <div className="bg-stone-950 border border-stone-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col h-auto max-h-[90vh] relative">

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
