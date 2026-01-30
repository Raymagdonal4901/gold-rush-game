
import React, { useEffect, useState } from 'react';
import { X, Factory, Package, Search, TrendingUp, TrendingDown, Minus, Clock, Coins, ArrowRight, Eye, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Truck, Cpu, Key, Zap, Briefcase, Gem, Sparkles, CheckCircle2, AlertTriangle, Hammer, Tag, Plus, ArrowDown } from 'lucide-react';
import { MATERIAL_CONFIG, CURRENCY, MARKET_CONFIG, RARITY_SETTINGS, SHOP_ITEMS, MATERIAL_RECIPES } from '../constants';
import { MockDB } from '../services/db';
import { MarketState, AccessoryItem } from '../types';
import { MaterialIcon } from './MaterialIcon';
import { InfinityGlove } from './InfinityGlove';

interface WarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    materials: Record<number, number>;
    onSell: (tier: number, amount: number) => void;
    onCraft: (sourceTier: number) => any;
    onPlayGoldRain?: () => void;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({ isOpen, onClose, userId, materials, onSell, onCraft, onPlayGoldRain }) => {
    const [hasMixer, setHasMixer] = useState(false); // Deprecated state, removing logic but keeping to avoid breaking if referenced elsewhere briefly. Actually, removing it.
    const [marketState, setMarketState] = useState<MarketState | null>(null);
    const [inventory, setInventory] = useState<AccessoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<'MATERIALS' | 'ITEMS'>('MATERIALS');
    const [userBalance, setUserBalance] = useState(0);

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
            const inv = MockDB.getUserInventory(userId);
            const bal = MockDB.getUserBalance(userId);
            setInventory(inv);
            setUserBalance(bal);
            setInventory(inv);
            setUserBalance(bal);

            const market = MockDB.getMarketStatus();
            setMarketState(market);
            setActiveTab('MATERIALS');
            setConfirmState(null);
            setIsAnimating(false);
        }
    }, [isOpen, userId]);

    // Fix: Define displayTiers to list available material tiers (Coal through Vibranium + Rare Ores)
    const displayTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Fix: Define consumable item IDs for grouping in the warehouse
    const consumableIds = ['chest_key', 'mixer', 'magnifying_glass', 'robot', 'upgrade_chip', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'ancient_blueprint', 'mystery_ore', 'legendary_ore'];

    // Fix: Group consumable items by typeId to show stacks
    const grouped = consumableIds.map(id => {
        const itemsOfId = inventory.filter(i => i.typeId === id);
        if (itemsOfId.length === 0) return null;
        return { item: itemsOfId[0], count: itemsOfId.length };
    }).filter((x): x is { item: AccessoryItem; count: number } => x !== null);

    // Fix: Filter individual equipment items (excluding consumables and gloves)
    const individual = inventory.filter(i => !consumableIds.includes(i.typeId) && i.typeId !== 'glove');

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

            setTimeout(() => {
                try {
                    const res = onCraft(sourceTier);
                    if (res) {
                        setSuccessItem({ name: res.targetName, tier: res.targetTier, amount: res.amount || 1 });
                    }
                } catch (e) {
                    // Handled by parent
                }
                setIsAnimating(false);
                setCraftingTargetTier(0);
            }, 2500);
        }
    };

    const getTierColor = (id: number) => {
        switch (id) {
            case 0: return 'text-stone-400';
            case 6: return 'text-purple-400';
            case 7: return 'text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]';
            default: return 'text-white';
        }
    };

    const getIcon = (typeId: string, className: string, rarity: any) => {
        switch (typeId) {
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
            case 'chest_key': return <Key className={className} />;
            case 'mixer': return <Factory className={className} />;
            case 'magnifying_glass': return <Search className={className} />;
            case 'mystery_ore': return <Sparkles className={className} />;
            case 'legendary_ore': return <Gem className={className} />;
            default: return <InfinityGlove rarity={rarity} className={className} />;
        }
    };

    const checkRecipeAvailability = (recipe: any) => {
        if (!recipe) return false;
        for (const [tierStr, needed] of Object.entries(recipe.ingredients)) {
            if ((materials[parseInt(tierStr)] || 0) < (needed as number)) return false;
        }
        if (userBalance < recipe.fee) return false;

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
                            สกัดแร่...
                        </h2>
                        <p className="text-yellow-600/80 text-sm tracking-[0.5em] font-bold uppercase animate-pulse">
                            ORE EXTRACTION (TIER {craftingTargetTier})
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
                                    <Sparkles size={24} className="text-purple-400" /> สำเร็จ!
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
                                <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">ได้รับไอเทม</div>
                                <div className={`text-xl font-bold ${getTierColor(successItem.tier)}`}>{successItem.name}</div>
                            </div>

                            <button
                                onClick={() => setSuccessItem(null)}
                                className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 hover:border-stone-500 text-white font-bold rounded-xl transition-all uppercase tracking-widest shadow-lg"
                            >
                                ตกลง (OK)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation UI (Processing Formula) */}
            {confirmState && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                <Gem className="text-yellow-500" size={20} /> ยืนยันการสกัดแร่
                            </h3>
                            <p className="text-yellow-600/50 text-xs mt-1 uppercase tracking-widest font-bold">CONFIRM EXTRACTION</p>
                        </div>

                        {/* VISUAL FORMULA BOX (Vertical Layout like screenshot) */}
                        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 mb-6 flex flex-col items-center">

                            {/* INPUT SECTION */}
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                                {confirmState.recipe && Object.entries(confirmState.recipe.ingredients).map(([tierStr, needed], idx, arr) => {
                                    const tier = parseInt(tierStr);
                                    const hasEnough = (materials[tier] || 0) >= (needed as number);
                                    return (
                                        <React.Fragment key={tier}>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className={`relative w-16 h-16 rounded-2xl bg-stone-900 border-2 flex items-center justify-center transition-all ${hasEnough ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                                                    <MaterialIcon id={tier} size="w-10 h-10" iconSize={20} />
                                                    <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border border-stone-950 shadow-lg animate-in zoom-in ${hasEnough ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                                        x{needed as number}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-stone-500 font-bold uppercase truncate max-w-[60px]">{MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]}</span>
                                            </div>
                                            {idx < arr.length - 1 && <Plus size={14} className="text-stone-800" />}
                                        </React.Fragment>
                                    );
                                })}

                                {/* FEE SECTION */}
                                {confirmState.recipe && confirmState.recipe.fee > 0 && (
                                    <>
                                        <Plus size={14} className="text-stone-800" />
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`relative w-16 h-16 rounded-2xl bg-stone-900 border-2 flex items-center justify-center transition-all ${userBalance >= confirmState.recipe.fee ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                                                <div className="text-emerald-400">
                                                    <Coins size={28} />
                                                </div>
                                                <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border border-stone-950 shadow-lg animate-in zoom-in ${userBalance >= confirmState.recipe.fee ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                                    x{confirmState.recipe.fee}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-stone-500 font-bold uppercase">บาท</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ARROW */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl scale-150"></div>
                                <div className="bg-stone-800/80 p-2 rounded-full border border-stone-700 shadow-inner relative z-10">
                                    <ArrowDown size={24} className="text-stone-500" />
                                </div>
                            </div>

                            {/* OUTPUT SECTION */}
                            <div className="flex flex-col items-center gap-2">
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
                                const hasItem = inventory.some(i => i.typeId === reqId);
                                const itemInfo = SHOP_ITEMS.find(i => i.id === reqId);
                                return (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-stone-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                            {getIcon(reqId, "text-stone-400", null)}
                                            ต้องการ: {itemInfo?.name || reqId}
                                        </span>
                                        <span className={hasItem ? "text-emerald-500 font-bold flex items-center gap-1" : "text-red-500 font-bold flex items-center gap-1"}>
                                            {hasItem ? <><CheckCircle2 size={12} /> มีแล้ว</> : <><AlertTriangle size={12} /> ยังไม่มี</>}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setConfirmState(null)} className="py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold rounded-xl transition-all text-sm uppercase tracking-wider">ยกเลิก</button>
                            <button
                                onClick={confirmAction}
                                disabled={!checkRecipeAvailability(confirmState.recipe)}
                                className="py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/40 transition-all disabled:grayscale disabled:opacity-50 text-sm uppercase tracking-wider"
                            >
                                ยืนยันการผลิต
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] relative">

                    <div className="bg-stone-900 border-b border-stone-800 shrink-0">
                        <div className="p-5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-900/20 p-2 rounded text-blue-500"><Package size={24} /></div>
                                <div><h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">คลังสินค้า (Warehouse)</h2></div>
                            </div>
                            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors bg-stone-800 p-2 rounded-full"><X size={24} /></button>
                        </div>
                        <div className="flex px-5 gap-8">
                            <button onClick={() => setActiveTab('MATERIALS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'MATERIALS' ? 'text-blue-400 border-blue-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>วัตถุดิบ</button>
                            <button onClick={() => setActiveTab('ITEMS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ITEMS' ? 'text-yellow-500 border-yellow-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>ไอเทม</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                        {activeTab === 'MATERIALS' ? (
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
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Tag size={10} className="text-stone-500" />
                                                        <span className="text-[11px] text-emerald-400 font-mono font-bold">{currentPrice.toFixed(2)} {CURRENCY}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-2">
                                                {recipe ? (
                                                    <button
                                                        onClick={() => handleCraftClick(tier)}
                                                        className={`w-full text-xs font-bold py-2.5 rounded-xl border transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${canCraft ? 'bg-stone-800 hover:bg-purple-900/40 text-purple-400 border-purple-500/50' : 'bg-stone-950 text-stone-700 border-stone-900'}`}
                                                    >
                                                        <Hammer size={14} /> แปรรูป
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
                        ) : (
                            <div className="space-y-6">
                                {grouped.length === 0 && individual.length === 0 ? (
                                    <div className="text-center py-20 text-stone-600 italic">ยังไม่มีไอเทมหรือเครื่องมือในขณะนี้</div>
                                ) : (
                                    <>
                                        {grouped.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">Consumables & Tools</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {grouped.map((g, idx) => {
                                                        const isMystery = g.item.typeId === 'mystery_ore';
                                                        const isLegendary = g.item.typeId === 'legendary_ore';

                                                        let containerClass = `bg-stone-900/80 border ${RARITY_SETTINGS[g.item.rarity].border}`;
                                                        if (isMystery) containerClass = "bg-gradient-to-r from-violet-900/40 via-fuchsia-900/40 to-orange-900/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
                                                        if (isLegendary) containerClass = "bg-yellow-900/20 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]";

                                                        return (
                                                            <div key={idx} className={`${containerClass} rounded-xl p-4 flex items-center justify-between relative overflow-hidden group`}>
                                                                {isMystery && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>}
                                                                {isLegendary && <div className="absolute inset-0 bg-yellow-400/5 animate-pulse"></div>}

                                                                <div className="flex items-center gap-3 relative z-10">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isMystery ? 'bg-stone-900 border-purple-500/50' : isLegendary ? 'bg-stone-900 border-yellow-500/50' : 'bg-stone-950 border-stone-800'}`}>
                                                                        {getIcon(g.item.typeId, `w-6 h-6 ${isMystery ? 'text-fuchsia-400 animate-pulse' : isLegendary ? 'text-yellow-400 animate-pulse' : RARITY_SETTINGS[g.item.rarity].color}`, g.item.rarity)}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`text-sm font-bold ${isMystery ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-pink-400 to-yellow-300' : isLegendary ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-white'}`}>{g.item.name}</div>
                                                                        <div className="text-[10px] text-stone-500">{g.item.specialEffect || 'ไอเทมใช้งาน'}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-stone-800 px-3 py-1 rounded-lg text-white font-mono font-bold relative z-10">x{g.count}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {individual.length > 0 && (
                                            <div className="space-y-3 pt-4">
                                                <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">Equipment</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {individual.map((item, idx) => (
                                                        <div key={idx} className={`bg-stone-900/80 border ${RARITY_SETTINGS[item.rarity].border} rounded-xl p-4 flex items-center gap-3`}>
                                                            <div className="w-10 h-10 bg-stone-950 rounded-lg flex items-center justify-center border border-stone-800 shrink-0">
                                                                {getIcon(item.typeId, `w-6 h-6 ${RARITY_SETTINGS[item.rarity].color}`, item.rarity)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className={`text-sm font-bold truncate ${item.isHandmade ? 'text-yellow-400' : 'text-white'}`}>{item.name}</div>
                                                                <div className="text-[10px] text-emerald-400 font-mono">+{item.dailyBonus.toFixed(1)} {CURRENCY}/วัน</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-stone-900 border-t border-stone-800 shrink-0 flex justify-between items-center px-8">
                        <div className="flex items-center gap-2">
                            <Coins className="text-yellow-500" size={18} />
                            <span className="text-sm text-stone-400 font-bold uppercase tracking-widest">ยอดเงินทุน:</span>
                            <span className="text-lg font-mono font-bold text-white">{userBalance.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-950 px-3 py-1 rounded-lg border border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">สถานะเครื่องผสม:</span>
                            <span className={hasMixer ? "text-emerald-500 text-xs font-bold" : "text-red-500 text-xs font-bold"}>{hasMixer ? "เชื่อมต่ออยู่" : "ไม่ได้ติดตั้ง"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
