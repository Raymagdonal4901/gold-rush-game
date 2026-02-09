
import React, { useEffect, useState } from 'react';
import { X, Factory, Package, Search, TrendingUp, TrendingDown, Minus, Clock, Hourglass, Coins, ArrowRight, Eye, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Truck, Cpu, Key, Zap, Briefcase, Gem, Sparkles, CheckCircle2, AlertTriangle, Hammer, Tag, Plus, ArrowDown, FileText } from 'lucide-react';
import { MATERIAL_CONFIG, CURRENCY, MARKET_CONFIG, RARITY_SETTINGS, SHOP_ITEMS, MATERIAL_RECIPES } from '../constants';
import { MarketState, MarketItemData, AccessoryItem } from '../services/types';
import { MaterialIcon } from './MaterialIcon';
import { InfinityGlove } from './InfinityGlove';
import { useTranslation } from './LanguageContext';

interface WarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    materials: Record<number, number>;
    inventory: AccessoryItem[];
    balance: number;
    marketState: MarketState | null;
    onSell: (tier: number, amount: number) => void;
    onCraft: (sourceTier: number) => any;
    onPlayGoldRain?: () => void;
    onOpenMarket?: (tier: number) => void;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
    isOpen, onClose, userId, materials, inventory, balance, marketState, onSell, onCraft, onPlayGoldRain, onOpenMarket
}) => {
    const { t, language } = useTranslation();
    const [hasMixer, setHasMixer] = useState(false); // Deprecated state, removing logic but keeping to avoid breaking if referenced elsewhere briefly. Actually, removing it.
    const [activeTab, setActiveTab] = useState<'MATERIALS' | 'ITEMS' | 'EQUIPMENT'>('MATERIALS');

    const [confirmState, setConfirmState] = useState<{
        type: 'SELL' | 'CRAFT' | 'INSPECT_ORE' | 'INSPECT_OIL';
        tier: number;
        name: string;
        recipe?: { ingredients: Record<number, number>, fee: number, requiredItem?: string };
    } | null>(null);

    const [successItem, setSuccessItem] = useState<{ name: string, tier: number, amount: number } | null>(null);

    const [isAnimating, setIsAnimating] = useState(false);
    const [craftingTargetTier, setCraftingTargetTier] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('MATERIALS');
            setConfirmState(null);
            setIsAnimating(false);
        }
    }, [isOpen]);

    // Fix: Define displayTiers to list available material tiers (Coal through Legendary)
    const displayTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Unified grouping logic for the warehouse
    const groupInventoryItems = (items: AccessoryItem[], groupByTypeIdOnly: boolean = false) => {
        const groups: Record<string, { representative: AccessoryItem, count: number, originalItems: AccessoryItem[] }> = {};

        items.forEach(item => {
            // For consumables (items), group by typeId only to combine all of the same type
            // For equipment, group by typeId + rarity + level for differentiation
            const key = groupByTypeIdOnly
                ? item.typeId || item.name
                : `${item.typeId}_${item.rarity}_${item.level || 1}_${item.isHandmade ? 'hm' : 'std'}`;
            if (!groups[key]) {
                groups[key] = { representative: item, count: 0, originalItems: [] };
            }
            groups[key].count++;
            groups[key].originalItems.push(item);
        });

        return Object.values(groups);
    };

    // Equipment type definitions - wearable/attachable gear
    const equipmentTypes = ['hat', 'glasses', 'uniform', 'bag', 'boots', 'mobile', 'pc', 'auto_excavator'];

    // Consumable/utility items (non-equipment)
    const itemTypes = ['mixer', 'magnifying_glass', 'chest_key', 'upgrade_chip', 'insurance_card', 'robot', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'repair_kit', 'ancient_blueprint'];

    const isItem = (i: AccessoryItem) => {
        if (!i.typeId && !i.name) return false;
        if (i.typeId === 'glove' || i.name?.includes('หุ่นยนต์')) return false;

        // Check by typeId
        if (i.typeId && itemTypes.includes(i.typeId)) return true;

        // Fallback check by name (Crucial for mismatched records)
        const name = i.name || '';
        if (name.includes('ชิป') || name.includes('Chip')) return true;
        if (name.includes('กุญแจ') || name.includes('Key')) return true;
        if (name.includes('ผสม') || name.includes('Mixer')) return true;
        if (name.includes('แว่นขยาย') || name.includes('Magnifying')) return true;
        if (name.includes('หุ่นยนต์') || name.includes('Robot')) return true;
        if (name.includes('นาฬิกาทราย') || name.includes('Hourglass')) return true;
        if (name.includes('ประกัน') || name.includes('Insurance')) return true;

        return false;
    };

    // Robust filter logic: 
    // - Items: in itemTypes list or matching item names
    // - Equipment: Everything else that isn't a glove and isn't an item
    const itemsList = inventory.filter(i => {
        if (i.typeId === 'glove' || i.name?.includes('หุ่นยนต์')) return false;
        return isItem(i);
    });

    const equipmentList = inventory.filter(i => {
        if (i.typeId === 'glove' || i.name?.includes('หุ่นยนต์')) return false;
        return !isItem(i);
    });

    const groupedItems = groupInventoryItems(itemsList, true);  // Group by typeId only for consumables
    const groupedEquipment = groupInventoryItems(equipmentList, false);  // Full grouping for equipment

    if (!isOpen) return null;

    const handleCraftClick = (sourceTier: number) => {
        const name = MATERIAL_CONFIG.NAMES[sourceTier as keyof typeof MATERIAL_CONFIG.NAMES];
        const recipe = MATERIAL_RECIPES[sourceTier];
        setConfirmState({
            type: 'CRAFT',
            tier: sourceTier,
            name,
            recipe: recipe
        });
    };

    const confirmAction = () => {
        if (!confirmState) return;

        if (confirmState.type === 'CRAFT') {
            const sourceTier = confirmState.tier;
            setConfirmState(null);
            setCraftingTargetTier(sourceTier + 1);
            setIsAnimating(true);

            setTimeout(async () => {
                try {
                    const res = await onCraft(sourceTier);
                    if (res) {
                        setSuccessItem({ name: res.targetName, tier: res.targetTier, amount: res.amount || 1 });
                    }
                } catch (e) {
                    console.error("Crafting failed in modal:", e);
                    // Handled by parent, but we must stop animation
                } finally {
                    setIsAnimating(false);
                    setCraftingTargetTier(0);
                }
            }, 2500);
        }
    };

    const getTierColor = (id: number) => {
        switch (id) {
            case 0: return 'text-stone-500';
            case 6: return 'text-purple-400';
            case 7: return 'text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]';
            case 8: return 'text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]';
            case 9: return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]';
            default: return 'text-white';
        }
    };

    const renderSparkline = (data: number[]) => {
        if (!data || data.length < 2) return null;
        const height = 20;
        const width = 60;
        const min = Math.min(...data) * 0.98;
        const max = Math.max(...data) * 1.02;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min || 1)) * height;
            return `${x},${y}`;
        }).join(' ');

        const isUp = data[data.length - 1] >= data[0];
        const color = isUp ? '#10b981' : '#ef4444';

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-6 opacity-80 group-hover/price:opacity-100 transition-opacity">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        );
    };

    const getItemDisplayName = (item: any) => {
        const typeId = item.typeId || '';
        const name = item.name || '';
        if (typeId === 'chest_key' || name.includes('กุญแจ') || name.includes('Key')) return language === 'th' ? 'กุญแจเข้าเหมือง' : 'Mining Key';
        if (typeId === 'upgrade_chip' || name.includes('ชิป') || name.includes('Chip')) return language === 'th' ? 'ชิปอัปเกรด' : 'Upgrade Chip';
        if (typeId === 'mixer' || name.includes('โต๊ะช่าง') || name.includes('Mixer')) return language === 'th' ? 'โต๊ะช่างสกัดแร่' : 'Material Extractor';
        if (typeId === 'magnifying_glass' || name.includes('แว่นขยาย') || name.includes('Search')) return language === 'th' ? 'แว่นขยายส่องแร่' : 'Magnifying Glass';
        if (typeId === 'robot' || name.includes('หุ่นยนต์') || name.includes('Robot')) return language === 'th' ? 'หุ่นยนต์ AI' : 'AI Robot';
        return name;
    };

    const getIcon = (item: any, className: string) => {
        let typeId = item.typeId || '';
        const name = item.name || '';
        const rarity = item.rarity;

        // Name-based overrides
        if (name.includes('ชิป') || name.includes('Chip')) typeId = 'upgrade_chip';
        else if (name.includes('กุญแจ') || name.includes('Key')) typeId = 'chest_key';
        else if (name.includes('โต๊ะช่าง') || name.includes('Mixer')) typeId = 'mixer';
        else if (name.includes('แว่นขยาย') || name.includes('Magnifying')) typeId = 'magnifying_glass';
        else if (name.includes('ใบประกัน') || name.includes('Insurance')) typeId = 'insurance_card';
        else if (name.includes('นาฬิกาทราย') || name.includes('Hourglass')) typeId = 'hourglass_small';
        else if (name.includes('วัสดุปริศนา') || name.includes('Mystery Item')) typeId = 'mystery_ore';
        else if (name.includes('วัสดุหายาก') || name.includes('Legendary Item')) typeId = 'legendary_ore';
        else if (name.includes('รถกอล์ฟ') || name.includes('Golf Cart')) typeId = 'auto_excavator';
        else if (name.includes('หุ่นยนต์') || name.includes('Robot')) typeId = 'robot';
        // Classic Equipment
        else if (name.includes('หมวก') || name.includes('Helmet')) typeId = 'hat';
        else if (name.includes('แว่น') || name.includes('Glasses')) typeId = 'glasses';
        else if (name.includes('ชุด') || name.includes('Uniform') || name.includes('Suit')) typeId = 'uniform';
        else if (name.includes('กระเป๋า') || name.includes('Bag') || name.includes('Backpack')) typeId = 'bag';
        else if (name.includes('รองเท้า') || name.includes('Boots')) typeId = 'boots';
        else if (name.includes('มือถือ') || name.includes('Mobile') || name.includes('Phone')) typeId = 'mobile';
        else if (name.includes('คอม') || name.includes('PC') || name.includes('Computer')) typeId = 'pc';

        if (!typeId) return <InfinityGlove rarity={rarity} className={className} />;
        if (typeId.includes('glove')) return <InfinityGlove rarity={rarity} className={className} />;

        if (typeId.includes('hat')) return <HardHat className={className} />;
        if (typeId.includes('glasses')) return <Glasses className={className} />;
        if (typeId.includes('uniform') || typeId.includes('shirt')) return <Shirt className={className} />;
        if (typeId.includes('bag') || typeId.includes('backpack')) return <Backpack className={className} />;
        if (typeId.includes('boots')) return <Footprints className={className} />;
        if (typeId.includes('mobile') || typeId.includes('phone')) return <Smartphone className={className} />;
        if (typeId.includes('pc') || typeId.includes('monitor')) return <Monitor className={className} />;
        if (typeId.includes('robot')) return <Bot className={className} />;
        if (typeId.includes('auto_excavator') || typeId.includes('truck')) return <Truck className={className} />;
        if (typeId.includes('upgrade_chip') || typeId.includes('chip')) return <Cpu className={className} />;
        if (typeId.includes('hourglass')) return <Hourglass className={className} />;
        if (typeId.includes('chest_key') || typeId.includes('key')) return <Key className={className} />;
        if (typeId.includes('mixer')) return <Factory className={className} />;
        if (typeId.includes('magnifying_glass') || typeId.includes('search')) return <Search className={className} />;
        if (typeId.includes('insurance_card') || typeId.includes('filetext')) return <FileText className={className} />;
        if (typeId === 'FileText') return <FileText className={className} />;
        if (typeId.includes('mystery_ore')) return <Sparkles className={className} />;
        if (typeId.includes('legendary_ore')) return <Gem className={className} />;

        return <InfinityGlove rarity={rarity} className={className} />;
    };

    const checkRecipeAvailability = (recipe: any) => {
        if (!recipe) return false;
        for (const [tierStr, needed] of Object.entries(recipe.ingredients)) {
            if ((materials[parseInt(tierStr)] || 0) < (needed as number)) return false;
        }
        if (balance < recipe.fee) return false;

        // Dynamic Requirement Check
        if (recipe.requiredItem) {
            if (!inventory.some(i => i.typeId === recipe.requiredItem)) return false;
        }

        return true;
    };

    return (
        <>
            {/* Standard Loading Overlay - LUXURIOUS EXTRACTION */}
            {isAnimating && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
                    <div className="relative flex flex-col items-center animate-in zoom-in duration-500">
                        {/* Shiny Glow Effect */}
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse"></div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full animate-[spin_3s_linear_infinite] scale-150 border-r-transparent"></div>
                            <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-[spin_2s_linear_infinite_reverse] scale-125 border-t-transparent"></div>

                            <div className="bg-gradient-to-br from-yellow-600 to-yellow-900 p-6 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.5)] relative z-10 border border-yellow-400">
                                <Gem size={64} className="text-white drop-shadow-lg animate-bounce" />
                            </div>

                            <Sparkles className="absolute -top-6 -right-6 text-yellow-300 animate-pulse" size={32} />
                            <Sparkles className="absolute -bottom-4 -left-4 text-white animate-pulse delay-300" size={24} />
                        </div>

                        <h2 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 animate-pulse tracking-widest uppercase drop-shadow-sm mb-2">
                            {t('warehouse.extract')}...
                        </h2>
                        <p className="text-yellow-600/80 text-sm tracking-[0.5em] font-bold uppercase animate-pulse">
                            EXTRACTION PROCESSING (TIER {craftingTargetTier})
                        </p>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {successItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
                    <div className="relative group w-full max-w-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-xl rounded-full animate-pulse"></div>
                        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-8 flex flex-col items-center relative z-10 shadow-2xl">

                            <div className="w-full flex justify-end absolute top-4 right-4">
                                <button onClick={() => setSuccessItem(null)} className="text-stone-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="text-center mb-6 mt-2">
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest drop-shadow-sm flex items-center gap-2 justify-center">
                                    <Sparkles size={24} className="text-purple-400" /> {t('common.success')}!
                                </h2>
                                <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">CRAFTING COMPLETE</p>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="w-32 h-32 bg-stone-950 rounded-3xl border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] relative z-10">
                                    <MaterialIcon id={successItem.tier} size="w-20 h-20" iconSize={40} />
                                    <div className="absolute -bottom-3 bg-purple-600 text-white text-sm font-black px-3 py-1 rounded-full border-2 border-stone-900 shadow-lg">
                                        x{successItem.amount}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{language === 'th' ? 'ได้รับไอเทม' : 'Item Received'}</div>
                                <div className={`text-xl font-bold ${getTierColor(successItem.tier)}`}>{successItem.name}</div>
                            </div>

                            <button
                                onClick={() => setSuccessItem(null)}
                                className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 hover:border-stone-500 text-white font-bold rounded-xl transition-all uppercase tracking-widest shadow-lg"
                            >
                                {t('common.confirm')} (OK)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation UI (Processing Formula) */}
            {confirmState && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                <Gem className="text-yellow-500" size={20} /> {language === 'th' ? 'ยืนยันการสกัดแร่' : 'Confirm Extraction'}
                            </h3>
                            <p className="text-yellow-600/50 text-xs mt-1 uppercase tracking-widest font-bold">CONFIRM EXTRACTION</p>
                        </div>

                        {/* VISUAL FORMULA BOX (Horizontal Layout) */}
                        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">

                            {/* INPUT SECTION */}
                            <div className="flex-1 flex flex-wrap items-center justify-center gap-4">
                                {confirmState.recipe && Object.entries(confirmState.recipe.ingredients).map(([tierStr, needed], idx, arr) => {
                                    const tier = parseInt(tierStr);
                                    const hasEnough = (materials[tier] || 0) >= (needed as number);
                                    return (
                                        <React.Fragment key={tier}>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className={`relative w-14 h-14 rounded-xl bg-stone-900 border-2 flex items-center justify-center transition-all ${hasEnough ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                                                    <MaterialIcon id={tier} size="w-8 h-8" iconSize={16} />
                                                    <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border border-stone-950 shadow-lg animate-in zoom-in ${hasEnough ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                                        x{needed as number}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-stone-500 font-bold uppercase truncate max-w-[50px]">{MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]}</span>
                                            </div>
                                            {idx < arr.length - 1 && <Plus size={12} className="text-stone-800" />}
                                        </React.Fragment>
                                    );
                                })}

                                {/* FEE SECTION */}
                                {confirmState.recipe && confirmState.recipe.fee > 0 && (
                                    <>
                                        <Plus size={12} className="text-stone-800" />
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`relative w-14 h-14 rounded-xl bg-stone-900 border-2 flex items-center justify-center transition-all ${balance >= confirmState.recipe.fee ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                                                <div className="text-emerald-400">
                                                    <Coins size={24} />
                                                </div>
                                                <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border border-stone-950 shadow-lg animate-in zoom-in ${balance >= confirmState.recipe.fee ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                                    x{confirmState.recipe.fee}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-stone-500 font-bold uppercase">บาท</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ARROW */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl scale-150"></div>
                                <div className="bg-stone-800/80 p-2 rounded-full border border-stone-700 shadow-inner relative z-10 hidden md:block">
                                    <ArrowRight size={24} className="text-stone-500" />
                                </div>
                                <div className="bg-stone-800/80 p-2 rounded-full border border-stone-700 shadow-inner relative z-10 block md:hidden">
                                    <ArrowDown size={24} className="text-stone-500" />
                                </div>
                            </div>

                            {/* OUTPUT SECTION */}
                            <div className="flex flex-col items-center gap-2 shrink-0 pr-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-2xl group-hover:bg-yellow-500/30 transition-all rounded-full"></div>
                                    <div className="p-4 rounded-3xl bg-stone-900 border-2 border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.2)] relative z-10">
                                        <MaterialIcon id={confirmState.tier + 1} size="w-16 h-16" iconSize={32} />
                                        <span className="absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-black border-2 border-stone-950 shadow-xl bg-yellow-600 text-white">
                                            x1
                                        </span>
                                    </div>
                                </div>
                                <span className="text-sm text-yellow-500 font-black uppercase tracking-widest mt-2 drop-shadow-md">
                                    {MATERIAL_CONFIG.NAMES[confirmState.tier + 1 as keyof typeof MATERIAL_CONFIG.NAMES]}
                                </span>
                            </div>
                        </div>

                        <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800 mb-6 space-y-2">
                            {confirmState.recipe?.requiredItem && (() => {
                                const reqId = confirmState.recipe.requiredItem;
                                const itemCount = inventory.filter(i => i.typeId === reqId).length;
                                const hasItem = itemCount > 0;
                                const itemInfo = SHOP_ITEMS.find(i => i.id === reqId);
                                return (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-stone-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                            {getIcon({ typeId: reqId, name: itemInfo?.name || reqId }, "text-stone-400")}
                                            ต้องการ: {itemInfo?.name || reqId}
                                        </span>
                                        <span className={hasItem ? "text-emerald-500 font-bold flex items-center gap-1" : "text-red-500 font-bold flex items-center gap-1"}>
                                            {hasItem ? <><CheckCircle2 size={12} /> {language === 'th' ? `มีอยู่ ${itemCount} ชิ้น` : `Own ${itemCount} pcs`}</> : <><AlertTriangle size={12} /> {language === 'th' ? 'ยังไม่มี' : 'Missing'}</>}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setConfirmState(null)} className="py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold rounded-xl transition-all text-sm uppercase tracking-wider">{t('common.cancel')}</button>
                            <button
                                onClick={confirmAction}
                                disabled={!checkRecipeAvailability(confirmState.recipe)}
                                className="py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/40 transition-all disabled:grayscale disabled:opacity-50 text-sm uppercase tracking-wider"
                            >
                                {t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] relative">

                    <div className="bg-stone-900 border-b border-stone-800 shrink-0">
                        <div className="p-5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-900/20 p-2.5 rounded-xl text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-900/10">
                                    <Package size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                                        {t('warehouse.title')}
                                    </h2>
                                    {marketState?.trends && (() => {
                                        const trends = Object.values(marketState.trends) as MarketItemData[];
                                        const ups = trends.filter(t => t.trend === 'UP').length;
                                        const downs = trends.filter(t => t.trend === 'DOWN').length;

                                        if (ups > downs) return (
                                            <div className="flex items-center gap-1.5 text-emerald-500 animate-pulse">
                                                <TrendingUp size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{language === 'th' ? 'ตลาดช่วงขาขึ้น (BULLISH MARKET)' : 'BULLISH MARKET'}</span>
                                            </div>
                                        );
                                        if (downs > ups) return (
                                            <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                                                <TrendingDown size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{language === 'th' ? 'ตลาดช่วงขาลง (BEARISH MARKET)' : 'BEARISH MARKET'}</span>
                                            </div>
                                        );
                                        return (
                                            <div className="flex items-center gap-1.5 text-stone-500">
                                                <Minus size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{language === 'th' ? 'ตลาดคงที่ (STABLE MARKET)' : 'STABLE MARKET'}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="group relative overflow-hidden text-stone-500 hover:text-white transition-all bg-stone-900 hover:bg-red-600/20 p-2.5 rounded-xl border border-stone-800 hover:border-red-500/50"
                            >
                                <X size={20} className="relative z-10 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>
                        <div className="flex px-5 gap-8">
                            <button onClick={() => setActiveTab('MATERIALS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'MATERIALS' ? 'text-blue-400 border-blue-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{language === 'th' ? 'วัตถุดิบ' : 'Materials'}</button>
                            <button onClick={() => setActiveTab('ITEMS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ITEMS' ? 'text-yellow-500 border-yellow-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{language === 'th' ? 'ไอเทม' : 'Items'}</button>
                            <button onClick={() => setActiveTab('EQUIPMENT')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'EQUIPMENT' ? 'text-emerald-500 border-emerald-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{language === 'th' ? 'อุปกรณ์เครื่องจักร' : 'Equipment'}</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                        {activeTab === 'MATERIALS' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayTiers.map((tier) => {
                                    const count = materials[tier] || 0;
                                    const name = MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES];
                                    const recipe = MATERIAL_RECIPES[tier];
                                    const canCraft = checkRecipeAvailability(recipe);
                                    const currentPrice = marketState?.trends[tier]?.currentPrice || MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES];

                                    return (
                                        <div key={tier} className={`bg-stone-900/80 border border-stone-800 rounded-2xl p-5 flex flex-col gap-4 relative transition-all hover:border-stone-700`}>
                                            <div className="flex items-center gap-4">
                                                <div className="shrink-0 relative">
                                                    <MaterialIcon id={tier} size="w-14 h-14" iconSize={28} />
                                                    <div className="absolute -top-2 -right-2 bg-stone-950 border border-stone-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">{count.toLocaleString()}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-lg leading-tight ${getTierColor(tier)}`}>{name}</h3>
                                                    {tier < 8 && (
                                                        <div className="space-y-1 mt-1">
                                                            <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                                                                <span>ราคาเริ่มต้น</span>
                                                                <span>{MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES].toFixed(2)}</span>
                                                            </div>
                                                            <div
                                                                className="flex items-center justify-between cursor-pointer hover:bg-stone-800/50 p-1 -mx-1 rounded transition-colors group/price"
                                                                onClick={() => onOpenMarket?.(tier)}
                                                                title="คลิกเพื่อดูสถิติตลาด"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Tag size={10} className="text-stone-500 group-hover/price:text-emerald-400" />
                                                                        <span className="text-[11px] text-emerald-400 font-mono font-bold">{currentPrice.toFixed(2)} {CURRENCY}</span>
                                                                    </div>
                                                                    {marketState?.trends[tier]?.history && renderSparkline(marketState.trends[tier].history)}
                                                                </div>
                                                                <div className="text-right">
                                                                    {(() => {
                                                                        const base = MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES] || 0;
                                                                        const diffFromBase = currentPrice - base;
                                                                        const percent = (base > 0) ? (diffFromBase / base) * 100 : 0;

                                                                        if (percent >= 0) return (
                                                                            <div className="flex flex-col items-end">
                                                                                <div className="flex items-center text-[10px] text-emerald-500 font-bold animate-pulse">
                                                                                    <TrendingUp size={10} className="mr-0.5" /> ขึ้น
                                                                                </div>
                                                                                <div className="text-[9px] text-emerald-400 font-bold">+{percent.toFixed(1)}%</div>
                                                                            </div>
                                                                        );
                                                                        return (
                                                                            <div className="flex flex-col items-end">
                                                                                <div className="flex items-center text-[10px] text-red-500 font-bold animate-pulse">
                                                                                    <TrendingDown size={10} className="mr-0.5" /> ลง
                                                                                </div>
                                                                                <div className="text-[9px] text-red-400 font-bold">{percent.toFixed(1)}%</div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-2">
                                                {recipe ? (
                                                    <button
                                                        onClick={() => handleCraftClick(tier)}
                                                        className={`w-full text-xs font-bold py-2.5 rounded-xl border transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${canCraft ? 'bg-stone-800 hover:bg-purple-900/40 text-purple-400 border-purple-500/50' : 'bg-stone-950 text-stone-700 border-stone-900'}`}
                                                    >
                                                        <Hammer size={14} /> {t('warehouse.extract')}
                                                    </button>
                                                ) : (
                                                    // Collection Items (Tier 8, 9) or Max Tier
                                                    tier >= 8 ? (
                                                        <div className={`text-[10px] text-center uppercase tracking-widest font-bold py-2.5 ${tier === 8 ? 'text-fuchsia-500 animate-pulse' : 'text-yellow-500 animate-pulse'}`}>
                                                            {tier === 8 ? '✨ COLLECTION ✨' : '👑 LEGENDARY 👑'}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-stone-600 text-center uppercase tracking-widest font-bold py-2.5">สูงสุด (Max Tier)</div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {activeTab === 'ITEMS' && (
                            <div className="space-y-6">
                                {groupedItems.length === 0 ? (
                                    <div className="text-center py-20 text-stone-600 italic">ยังไม่มีไอเทมในขณะนี้</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedItems.map((group, idx) => {
                                            const item = group.representative;
                                            const isSpecial = ['mystery_ore', 'legendary_ore'].includes(item.typeId);
                                            const isMystery = item.typeId === 'mystery_ore';
                                            const isLegendary = item.typeId === 'legendary_ore';

                                            // Get rarity style based on item typeId (matching shop colors)
                                            const getItemRarityStyle = (typeId: string) => {
                                                switch (typeId) {
                                                    case 'upgrade_chip': return RARITY_SETTINGS.RARE;
                                                    case 'mixer': return RARITY_SETTINGS.SUPER_RARE;
                                                    case 'magnifying_glass': return RARITY_SETTINGS.RARE;
                                                    case 'chest_key': return RARITY_SETTINGS.EPIC;
                                                    case 'robot': return RARITY_SETTINGS.MYTHIC;
                                                    case 'insurance_card': return RARITY_SETTINGS.ULTRA_LEGENDARY;
                                                    case 'hourglass_small': return RARITY_SETTINGS.UNCOMMON;
                                                    case 'hourglass_medium': return RARITY_SETTINGS.EPIC;
                                                    case 'hourglass_large': return RARITY_SETTINGS.LEGENDARY;
                                                    case 'repair_kit': return RARITY_SETTINGS.RARE;
                                                    case 'ancient_blueprint': return RARITY_SETTINGS.DIVINE;
                                                    default: return RARITY_SETTINGS[item.rarity] || RARITY_SETTINGS.COMMON;
                                                }
                                            };
                                            const rarityStyle = getItemRarityStyle(item.typeId);

                                            let containerClass = `bg-stone-900/80 border ${rarityStyle.border}`;
                                            if (isMystery) containerClass = "bg-gradient-to-r from-violet-900/40 via-fuchsia-900/40 to-orange-900/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
                                            if (isLegendary) containerClass = "bg-yellow-900/20 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]";

                                            return (
                                                <div key={idx} className={`${containerClass} rounded-xl p-4 flex items-center justify-between relative overflow-hidden group`}>
                                                    {(isMystery || isLegendary) && (
                                                        <div className={`absolute inset-0 ${isMystery ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]' : 'bg-yellow-400/5 animate-pulse'}`}></div>
                                                    )}

                                                    <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${isSpecial ? 'bg-stone-900 border-purple-500/50' : `bg-stone-950 ${rarityStyle.border}`}`}>
                                                            {getIcon(item, `w-6 h-6 ${isMystery ? 'text-fuchsia-400 animate-pulse' : isLegendary ? 'text-yellow-400 animate-pulse' : rarityStyle.color}`)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className={`text-sm font-bold truncate ${isMystery ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-pink-400 to-yellow-300' : isLegendary ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : item.isHandmade ? 'text-yellow-400' : 'text-white'}`}>
                                                                {getItemDisplayName(item)}
                                                                {item.level && item.level > 1 && <span className="ml-1 text-[10px] text-yellow-500">+{item.level}</span>}
                                                            </div>
                                                            <div className="text-[10px] text-stone-500 truncate">
                                                                {item.dailyBonus > 0 ? `+${item.dailyBonus.toFixed(1)} ${CURRENCY}/${language === 'th' ? 'วัน' : 'day'}` : (item.specialEffect || (language === 'th' ? 'ไอเทมใช้งาน' : 'Utility Item'))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-stone-800 px-3 py-1 rounded-lg text-white font-mono font-bold relative z-10 shrink-0 ml-2">
                                                        x{group.count}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'EQUIPMENT' && (
                            <div className="space-y-6">
                                {groupedEquipment.length === 0 ? (
                                    <div className="text-center py-20 text-stone-600 italic">ยังไม่มีอุปกรณ์เครื่องจักรในขณะนี้</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedEquipment.map((group, idx) => {
                                            const item = group.representative;
                                            let containerClass = `bg-stone-900/80 border ${RARITY_SETTINGS[item.rarity].border}`;

                                            return (
                                                <div key={idx} className={`${containerClass} rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all`}>
                                                    <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-stone-950 border-stone-800`}>
                                                            {getIcon(item, `w-6 h-6 ${RARITY_SETTINGS[item.rarity].color}`)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className={`text-sm font-bold truncate ${item.isHandmade ? 'text-yellow-400' : 'text-white'}`}>
                                                                {item.name}
                                                                {item.level && item.level > 1 && <span className="ml-1 text-[10px] text-yellow-500">+{item.level}</span>}
                                                            </div>
                                                            <div className="text-[10px] text-stone-500 truncate">
                                                                {item.dailyBonus > 0 ? `+${item.dailyBonus.toFixed(1)} ${CURRENCY}/${language === 'th' ? 'วัน' : 'day'}` : (item.specialEffect || (language === 'th' ? 'อุปกรณ์เครื่องจักร' : 'Equipment'))}
                                                            </div>
                                                            <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${RARITY_SETTINGS[item.rarity].color}`}>
                                                                {item.rarity}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-emerald-800 px-3 py-1 rounded-lg text-white font-mono font-bold relative z-10 shrink-0 ml-2">
                                                        x{group.count}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-stone-900 border-t border-stone-800 shrink-0 flex justify-between items-center px-8">
                        <div className="flex items-center gap-2">
                            <Coins className="text-yellow-500" size={18} />
                            <span className="text-sm text-stone-400 font-bold uppercase tracking-widest">{t('common.balance')}:</span>
                            <span className="text-lg font-mono font-bold text-white">{balance.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-950 px-3 py-1 rounded-lg border border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">สถานะโต๊ะช่าง:</span>
                            <span className={hasMixer ? "text-emerald-500 text-xs font-bold" : "text-red-500 text-xs font-bold"}>{hasMixer ? "เชื่อมต่ออยู่" : "ไม่ได้ติดตั้ง"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
