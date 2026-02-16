
import React, { useEffect, useState } from 'react';
import { X, Factory, Package, Search, TrendingUp, TrendingDown, Minus, Clock, Hourglass, Coins, ArrowRight, Eye, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Truck, Cpu, Key, Zap, Briefcase, Gem, Sparkles, CheckCircle2, AlertTriangle, Hammer, Tag, Plus, ArrowDown, FileText, CreditCard, Ticket, Timer, Settings, Wrench, ArrowUpCircle, TrainFront } from 'lucide-react';
import { MATERIAL_CONFIG, CURRENCY, MARKET_CONFIG, RARITY_SETTINGS, SHOP_ITEMS, MATERIAL_RECIPES, EXCHANGE_RATE_USD_THB, UPGRADE_REQUIREMENTS } from '../constants';
import { MarketState, MarketItemData, AccessoryItem } from '../services/types';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';

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
    onUpgradeEquipment?: (itemId: string, useInsurance: boolean) => Promise<any>;
    onScrapEquipment?: (itemId: string) => Promise<any>;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
    isOpen, onClose, userId, materials = {}, inventory = [], balance = 0, marketState, onSell, onCraft, onPlayGoldRain, onOpenMarket,
    onUpgradeEquipment, onScrapEquipment
}) => {
    const { t, language, getLocalized, formatCurrency, formatBonus } = useTranslation();
    const [hasMixer, setHasMixer] = useState(false); // Deprecated state, removing logic but keeping to avoid breaking if referenced elsewhere briefly. Actually, removing it.
    const [activeTab, setActiveTab] = useState<'MATERIALS' | 'ITEMS' | 'EQUIPMENT' | 'REPAIR_KITS'>('MATERIALS');
    const [selectedEquipmentGroup, setSelectedEquipmentGroup] = useState<{ representative: AccessoryItem, count: number, originalItems: AccessoryItem[] } | null>(null);
    const [equipmentAction, setEquipmentAction] = useState<'DETAILS' | 'UPGRADE' | 'SCRAP' | 'BUSY'>('DETAILS');

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
            setSelectedEquipmentGroup(null);
            setEquipmentAction('DETAILS');
        }
    }, [isOpen]);

    // Fix: Define displayTiers to list available material tiers (Stone Shards through Legendary)
    const displayTiers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Unified grouping logic for the warehouse
    const groupInventoryItems = (items: AccessoryItem[], groupByTypeIdOnly: boolean = false) => {
        const groups: Record<string, { representative: AccessoryItem, count: number, originalItems: AccessoryItem[] }> = {};

        items.forEach(item => {
            // For consumables (items), group by typeId only to combine all of the same type
            // For equipment, group by typeId + rarity + level for differentiation
            const key = groupByTypeIdOnly
                ? item.typeId || getLocalized(item.name)
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
    const equipmentTypes = ['glasses', 'uniform', 'bag', 'boots', 'mobile', 'pc', 'auto_excavator'];

    // Consumable/utility items (non-equipment)
    const itemTypes = ['mixer', 'magnifying_glass', 'chest_key', 'upgrade_chip', 'insurance_card', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'ancient_blueprint', 'time_skip_ticket', 'construction_nanobot', 'vip_withdrawal_card', 'ai_robot', 'slot_blueprint'];

    const isItem = (i: AccessoryItem) => {
        if (!i.typeId && !i.name) return false;
        if (i.category === 'REPAIR_KIT' || i.typeId?.startsWith('repair_kit_')) return false;

        let nameStr = '';
        if (i.name && typeof i.name === 'object') {
            nameStr = (i.name as any).en || (i.name as any).th || '';
        } else if (typeof i.name === 'string') {
            nameStr = i.name;
        }
        nameStr = nameStr.toLowerCase();

        const typeId = i.typeId?.toLowerCase() || '';
        if (itemTypes.includes(typeId as any) || typeId.includes('key')) return true;

        if (nameStr.includes('key') || nameStr.includes('กุญแจ')) return true;
        if (nameStr.includes('chip') || nameStr.includes('ชิป')) return true;
        if (nameStr.includes('mixer') || nameStr.includes('โต๊ะช่าง')) return true;
        if (nameStr.includes('magnifying') || nameStr.includes('แว่นขยาย')) return true;
        if (nameStr.includes('hourglass') || nameStr.includes('นาฬิกาทราย')) return true;
        if (nameStr.includes('ประกัน') || nameStr.includes('Insurance')) return true;
        if (nameStr.includes('vip') || nameStr.includes('บัตร')) return true;

        return false;
    };

    const isBuggy = (i: AccessoryItem) => {
        const nameStr = (typeof i.name === 'string' ? i.name : (i.name?.en || i.name?.th || '')).toLowerCase();
        // Specifically filter out the exact "robot" and "hat" lowercase name items seen in the screenshot
        // But keep "หุ่นยนต์ AI" or "AI Robot"
        if (nameStr === 'robot' || nameStr === 'hat') return true;
        return false;
    };

    // Robust filter logic: 
    // - Repair Kits: category is REPAIR_KIT or id starts with repair_kit_
    // - Items: in itemTypes list or matching item names
    // - Equipment: Everything else that isn't an item or repair kit
    const repairKitsList = inventory.filter(i => {
        if (isBuggy(i)) return false;
        return i.category === 'REPAIR_KIT' || i.typeId?.startsWith('repair_kit_');
    });

    const itemsList = inventory.filter(i => {
        if (isBuggy(i)) return false;
        return isItem(i);
    });

    const equipmentList = inventory.filter(i => {
        if (isBuggy(i)) return false;
        return !isItem(i) && i.category !== 'REPAIR_KIT' && !i.typeId?.startsWith('repair_kit_');
    });

    const groupedItems = isOpen ? groupInventoryItems(itemsList, true) : [];  // Group by typeId only for consumables
    const groupedEquipment = isOpen ? groupInventoryItems(equipmentList, false) : [];  // Full grouping for equipment
    const groupedRepairKits = isOpen ? groupInventoryItems(repairKitsList, true) : []; // Group repair kits

    if (!isOpen) return null;

    const handleCraftClick = (sourceTier: number) => {
        const nameData = MATERIAL_CONFIG.NAMES[sourceTier as keyof typeof MATERIAL_CONFIG.NAMES];
        const name = getLocalized(nameData);
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
            }, 300);
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

        // Safely extract name string
        let nameStr = '';
        if (item.name && typeof item.name === 'object') {
            nameStr = (item.name as any).en || '';
        } else if (typeof item.name === 'string') {
            nameStr = item.name;
        }

        if (typeId === 'chest_key' || nameStr.includes('กุญแจ') || nameStr.includes('Key')) return t('rig.mining_key');
        if (typeId === 'upgrade_chip' || nameStr.includes('ชิป') || nameStr.includes('Chip')) return t('inventory.upgrade');
        if (typeId === 'mixer' || nameStr.includes('โต๊ะช่าง') || nameStr.includes('Mixer')) return t('warehouse.extract');
        if (typeId === 'magnifying_glass' || nameStr.includes('แว่นขยาย') || nameStr.includes('Search')) return getLocalized(item.name);
        if (typeId === 'time_skip_ticket' || nameStr.includes('ตั๋วเร่งเวลา')) return language === 'th' ? 'ตั๋วเร่งเวลา' : 'Time Skip Ticket';
        if (typeId === 'construction_nanobot' || nameStr.includes('นาโนบอทก่อสร้าง')) return language === 'th' ? 'นาโนบอทก่อสร้าง' : 'Construction Nanobot';

        return getLocalized(item.name);
    };

    const getIcon = (item: any, className: string) => {
        let typeId = item.typeId || '';

        // Safely extract name string for internal mapping
        let nameStr = '';
        if (item.name && typeof item.name === 'object') {
            nameStr = (item.name as any).en || '';
        } else if (typeof item.name === 'string') {
            nameStr = item.name;
        }

        const rarity = (item.rarity && RARITY_SETTINGS[item.rarity]) ? item.rarity : 'COMMON';

        // Name-based overrides
        if (nameStr.includes('ชิป') || nameStr.includes('Chip')) typeId = 'upgrade_chip';
        else if (nameStr.includes('กุญแจ') || nameStr.includes('Key')) typeId = 'chest_key';
        else if (nameStr.includes('โต๊ะช่าง') || nameStr.includes('Mixer')) typeId = 'mixer';
        else if (nameStr.includes('แว่นขยาย') || nameStr.includes('Magnifying')) typeId = 'magnifying_glass';
        else if (nameStr.includes('ใบประกัน') || nameStr.includes('Insurance')) typeId = 'insurance_card';
        else if (nameStr.includes('นาฬิกาทราย') || nameStr.includes('Hourglass')) typeId = 'hourglass_small';
        else if (nameStr.includes('วัสดุปริศนา') || nameStr.includes('Mystery Item')) typeId = 'mystery_ore';
        else if (nameStr.includes('วัสดุหายาก') || nameStr.includes('Legendary Item')) typeId = 'legendary_ore';
        else if (nameStr.includes('รถกอล์ฟ') || nameStr.includes('Golf Cart') || nameStr.includes('รถไฟฟ้า') || nameStr.includes('Electric Vehicle')) typeId = 'auto_excavator';
        else if (nameStr.includes('หุ่นยนต์') || nameStr.includes('Robot')) typeId = 'ai_robot';
        // Classic Equipment
        else if (nameStr.includes('หมวก') || nameStr.includes('Helmet')) typeId = null;
        else if (nameStr.includes('แว่น') || nameStr.includes('Glasses')) typeId = 'glasses';
        else if (nameStr.includes('ชุด') || nameStr.includes('Uniform') || nameStr.includes('Suit')) typeId = 'uniform';
        else if (nameStr.includes('กระเป๋า') || nameStr.includes('Bag') || nameStr.includes('Backpack')) typeId = 'bag';
        else if (nameStr.includes('รองเท้า') || nameStr.includes('Boots')) typeId = 'boots';
        else if (nameStr.includes('มือถือ') || nameStr.includes('Mobile') || nameStr.includes('Phone')) typeId = 'mobile';
        else if (nameStr.includes('คอม') || nameStr.includes('PC') || nameStr.includes('Computer')) typeId = 'pc';
        else if (nameStr.includes('ตั๋วเร่งเวลา') || nameStr.includes('Time Skip Ticket')) typeId = 'time_skip_ticket';
        else if (nameStr.includes('นาโนบอทก่อสร้าง') || nameStr.includes('Construction Nanobot')) typeId = 'construction_nanobot';
        else if (nameStr.includes('Repair Kit') || nameStr.includes('ชุดซ่อม')) {
            if (nameStr.includes('Basic') || nameStr.includes('พื้นฐาน')) typeId = 'repair_kit_1';
            else if (nameStr.includes('Standard') || nameStr.includes('มาตรฐาน')) typeId = 'repair_kit_2';
            else if (nameStr.includes('Electronic') || nameStr.includes('อิเล็กทรอนิกส์')) typeId = 'repair_kit_3';
            else if (nameStr.includes('Mechanic') || nameStr.includes('เครื่องจักร')) typeId = 'repair_kit_4';
            else typeId = 'repair_kit_1';
        }

        if (typeId === 'vip_withdrawal_card' || nameStr.includes('บัตร VIP')) {
            return (
                <div className={`relative ${className.includes('w-') ? className : 'w-full h-full'} aspect-[1.58/1] bg-gradient-to-br from-yellow-100 via-yellow-500 to-yellow-800 rounded-[4px] border border-yellow-200/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center overflow-hidden group/card`}>
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60"></div>
                    {/* Magnetic Stripe Detail */}
                    <div className="absolute top-[20%] left-0 w-full h-[15%] bg-stone-900/40"></div>
                    {/* Chip Detail */}
                    <div className="absolute top-[45%] left-[10%] w-[15%] h-[20%] bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-sm border border-yellow-100/30"></div>
                    {/* VIP Text */}
                    <div className="absolute bottom-[10%] right-[10%] text-[8px] font-black italic text-black/40 tracking-tighter">VIP</div>
                    <CreditCard className="text-yellow-950 w-1/2 h-1/2 relative z-10 drop-shadow-sm opacity-60" />
                </div>
            );
        }

        if (!typeId) return <Briefcase className={className} />;
        if (typeId.includes('glove')) return <Briefcase className={className} />;

        if (typeId.includes('hat')) return <HardHat className={className} />;
        if (typeId.includes('glasses')) return <Glasses className={className} />;
        if (typeId.includes('uniform') || typeId.includes('shirt')) return <Shirt className={className} />;
        if (typeId.includes('bag') || typeId.includes('backpack')) return <Backpack className={className} />;
        if (typeId.includes('boots')) return <Footprints className={className} />;
        if (typeId.includes('mobile') || typeId.includes('phone')) return <Smartphone className={className} />;
        if (typeId.includes('pc') || typeId.includes('monitor')) return <Monitor className={className} />;
        if (typeId.includes('auto_excavator') || typeId.includes('truck')) return <TrainFront className={className} />;
        if (typeId.includes('upgrade_chip') || typeId.includes('chip')) return <Cpu className={className} />;
        if (typeId.includes('hourglass')) return <Hourglass className={className} />;
        if (typeId.includes('chest_key') || typeId.includes('key')) return <Key className={className} />;
        if (typeId.includes('mixer')) return <Factory className={className} />;
        if (typeId === 'ai_robot' || typeId.includes('robot')) return <Bot className={className} />;
        if (typeId.includes('magnifying_glass') || typeId.includes('search')) return <Search className={className} />;
        if (typeId.includes('insurance_card') || typeId.includes('filetext')) return <FileText className={className} />;
        if (typeId.includes('vip') || typeId.includes('credit')) return <CreditCard className={className} />;

        if (typeId.startsWith('repair_kit')) {
            let IconComp = Wrench;
            if (typeId === 'repair_kit_1') IconComp = Hammer;
            else if (typeId === 'repair_kit_2') IconComp = Briefcase;
            else if (typeId === 'repair_kit_3') IconComp = Cpu;
            else if (typeId === 'repair_kit_4') IconComp = Settings;

            return (
                <div className="relative flex items-center justify-center">
                    <div className={`absolute inset-0 opacity-20 blur-md rounded-full scale-125 animate-pulse ${typeId === 'repair_kit_4' ? 'bg-red-500' :
                        typeId === 'repair_kit_3' ? 'bg-yellow-500' :
                            typeId === 'repair_kit_2' ? 'bg-purple-500' : 'bg-emerald-500'
                        }`}></div>
                    <IconComp className={`${className} relative z-10`} />
                </div>
            );
        }
        if (typeId === 'FileText') return <FileText className={className} />;
        if (typeId.includes('mystery_ore')) return <Sparkles className={className} />;
        if (typeId.includes('legendary_ore')) return <Gem className={className} />;

        if (typeId === 'time_skip_ticket') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg scale-125 blur-md animate-pulse"></div>
                    <div className="absolute -top-1 -right-1">
                        <Timer size={10} className="text-blue-300 animate-[spin_3s_linear_infinite]" />
                    </div>
                    <Ticket className={`${className} text-blue-400 -rotate-12 relative z-10`} />
                </div>
            );
        }

        if (typeId === 'construction_nanobot') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-full scale-[1.5] blur-xl animate-pulse"></div>
                    <div className="absolute inset-0 border border-cyan-400/30 rounded-full scale-110 animate-[spin_8s_linear_infinite]"></div>
                    <div className="absolute -top-1 -right-1 bg-cyan-500 text-white rounded-full p-0.5">
                        <Zap size={8} className="animate-pulse" />
                    </div>
                    <Bot className={`${className} text-cyan-300 relative z-10`} />
                </div>
            );
        }

        return <Briefcase className={className} />;
    };

    const handleUpgradeEquipment = async () => {
        if (!selectedEquipmentGroup || !onUpgradeEquipment) return;
        const item = selectedEquipmentGroup.representative;
        setEquipmentAction('BUSY');
        try {
            await onUpgradeEquipment(item.id, false);
            setSelectedEquipmentGroup(null);
        } catch (e: any) {
            console.error("Upgrade failed:", e);
        } finally {
            setEquipmentAction('DETAILS');
        }
    };

    const handleScrapEquipment = async () => {
        if (!selectedEquipmentGroup || !onScrapEquipment) return;
        const item = selectedEquipmentGroup.representative;
        if (!confirm(t('inventory.sell_confirm'))) return;

        setEquipmentAction('BUSY');
        try {
            await onScrapEquipment(item.id);
            setSelectedEquipmentGroup(null);
        } catch (e: any) {
            console.error("Scrap failed:", e);
        } finally {
            setEquipmentAction('DETAILS');
        }
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
                            {t('warehouse.extract_processing').replace('{tier}', craftingTargetTier.toString())}
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
                                <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">{t('warehouse.crafting_complete')}</p>
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
                                <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{t('warehouse.item_received')}</div>
                                <div className={`text-xl font-bold ${getTierColor(successItem.tier)}`}>{successItem.name}</div>
                            </div>

                            <button
                                onClick={() => setSuccessItem(null)}
                                className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 hover:border-stone-500 text-white font-bold rounded-xl transition-all uppercase tracking-widest shadow-lg"
                            >
                                {t('common.confirm')}
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
                                <Gem className="text-yellow-500" size={20} /> {t('warehouse.confirm_extraction')}
                            </h3>
                            <p className="text-yellow-600/50 text-xs mt-1 uppercase tracking-widest font-bold">{t('warehouse.extract_desc').replace('{tier}', confirmState.tier.toString())}</p>
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
                                                <span className="text-[9px] text-stone-500 font-bold uppercase truncate max-w-[50px]">{getLocalized(MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES])}</span>
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
                                                    x{formatCurrency(confirmState.recipe.fee, { hideSymbol: true, showDecimals: true, forceTHB: true })}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-stone-500 font-bold uppercase">{t('common.thb')} <span className="text-[8px] opacity-70">({formatCurrency(confirmState.recipe.fee, { forceUSD: true })})</span></span>
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
                                    {getLocalized(MATERIAL_CONFIG.NAMES[confirmState.tier + 1 as keyof typeof MATERIAL_CONFIG.NAMES])}
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
                                            {t('warehouse.req_item')} {itemInfo ? getLocalized(itemInfo.name) : reqId}
                                        </span>
                                        <span className={hasItem ? "text-emerald-500 font-bold flex items-center gap-1" : "text-red-500 font-bold flex items-center gap-1"}>
                                            {hasItem ? <><CheckCircle2 size={12} /> {t('warehouse.owned_count_pcs').replace('{count}', itemCount.toString())}</> : <><AlertTriangle size={12} /> {t('warehouse.missing')}</>}
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
                                        const allTrends = marketState.trends ? Object.entries(marketState.trends) : [];
                                        // Exclude Stone Shards (tier 0) from market trend calculation
                                        const trends = allTrends.filter(([tierStr]) => parseInt(tierStr) !== 0).map(([, data]) => data as MarketItemData);
                                        const ups = trends.filter(t => t.trend === 'UP').length;
                                        const downs = trends.filter(t => t.trend === 'DOWN').length;

                                        if (ups > downs) return (
                                            <div className="flex items-center gap-1.5 text-emerald-500 animate-pulse">
                                                <TrendingUp size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('warehouse.bullish_market')}</span>
                                            </div>
                                        );
                                        if (downs > ups) return (
                                            <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                                                <TrendingDown size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('warehouse.bearish_market')}</span>
                                            </div>
                                        );
                                        return (
                                            <div className="flex items-center gap-1.5 text-stone-500">
                                                <Minus size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('warehouse.stable_market')}</span>
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
                        <div className="flex px-5 gap-8 overflow-x-auto no-scrollbar">
                            <button onClick={() => setActiveTab('MATERIALS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'MATERIALS' ? 'text-blue-400 border-blue-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{t('warehouse.materials_tab')}</button>
                            <button onClick={() => setActiveTab('ITEMS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'ITEMS' ? 'text-yellow-500 border-yellow-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{t('warehouse.items_tab')}</button>
                            <button onClick={() => setActiveTab('EQUIPMENT')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'EQUIPMENT' ? 'text-emerald-500 border-emerald-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>{t('warehouse.equipment_tab')}</button>
                            <button onClick={() => setActiveTab('REPAIR_KITS')} className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'REPAIR_KITS' ? 'text-red-400 border-red-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>
                                <Wrench size={16} /> {t('warehouse.repair_kits_tab')}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                        {activeTab === 'MATERIALS' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayTiers.map((tier) => {
                                    const count = materials[tier] || 0;
                                    const name = getLocalized(MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]);
                                    const recipe = MATERIAL_RECIPES[tier];
                                    const canCraft = checkRecipeAvailability(recipe);
                                    const currentPrice = (marketState?.trends?.[tier]?.currentPrice || MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES]) || 0;

                                    return (
                                        <div key={tier} className={`bg-stone-900/80 border border-stone-800 rounded-2xl p-5 flex flex-col gap-4 relative transition-all hover:border-stone-700`}>
                                            <div className="flex items-center gap-4">
                                                <div className="shrink-0 relative">
                                                    <MaterialIcon id={tier} size="w-14 h-14" iconSize={28} />
                                                    <div className="absolute -top-2 -right-2 bg-stone-950 border border-stone-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">{count.toLocaleString()}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-lg leading-tight ${getTierColor(tier)}`}>{name}</h3>
                                                    {tier > 0 && tier < 8 && (
                                                        <div className="space-y-1 mt-1">
                                                            <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                                                                <span>{t('warehouse.base_price')}</span>
                                                                <span>{formatCurrency(MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES] || 0)}</span>
                                                            </div>
                                                            <div
                                                                className="flex items-center justify-between cursor-pointer hover:bg-stone-800/50 p-1 -mx-1 rounded transition-colors group/price"
                                                                onClick={() => onOpenMarket?.(tier)}
                                                                title={t('warehouse.click_stats')}
                                                            >
                                                                {tier === 7 ? (
                                                                    <div className="w-full flex items-center justify-center py-1 bg-red-900/30 border border-red-500/30 rounded-lg">
                                                                        <span className="text-[10px] text-red-400 font-black uppercase tracking-widest animate-pulse">
                                                                            {language === 'th' ? 'ปิดการซื้อขายชั่วคราว' : 'Market Closed'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Tag size={10} className="text-stone-500 group-hover/price:text-emerald-400" />
                                                                                {formatCurrency(currentPrice)}
                                                                                <span className="text-[9px] text-stone-500 font-normal ml-1">
                                                                                    ({formatCurrency(currentPrice, { forceTHB: language === 'en', forceUSD: language === 'th' })})
                                                                                </span>
                                                                            </div>
                                                                            {marketState?.trends?.[tier]?.history && renderSparkline(marketState.trends[tier].history)}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            {(() => {
                                                                                const base = MATERIAL_CONFIG.PRICES[tier as keyof typeof MATERIAL_CONFIG.PRICES] || 0;
                                                                                const diffFromBase = currentPrice - base;
                                                                                const percent = (base > 0) ? (diffFromBase / base) * 100 : 0;

                                                                                if (percent >= 0) return (
                                                                                    <div className="flex flex-col items-end">
                                                                                        <div className="flex items-center text-[10px] text-emerald-500 font-bold animate-pulse">
                                                                                            <TrendingUp size={10} className="mr-0.5" /> {t('warehouse.market_up')}
                                                                                        </div>
                                                                                        <div className="text-[9px] text-emerald-400 font-bold">+{percent.toFixed(1)}%</div>
                                                                                    </div>
                                                                                );
                                                                                return (
                                                                                    <div className="flex flex-col items-end">
                                                                                        <div className="flex items-center text-[10px] text-red-500 font-bold animate-pulse">
                                                                                            <TrendingDown size={10} className="mr-0.5" /> {t('warehouse.market_down')}
                                                                                        </div>
                                                                                        <div className="text-[9px] text-red-400 font-bold">{percent.toFixed(1)}%</div>
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </>
                                                                )}
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
                                                        <div className="text-[10px] text-stone-600 text-center uppercase tracking-widest font-bold py-2.5">{t('warehouse.max_tier')}</div>
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
                                    <div className="text-center py-20 text-stone-600 italic">{t('warehouse.no_items')}</div>
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
                                                    case 'insurance_card': return RARITY_SETTINGS.ULTRA_LEGENDARY;
                                                    case 'hourglass_small': return RARITY_SETTINGS.UNCOMMON;
                                                    case 'hourglass_medium': return RARITY_SETTINGS.EPIC;
                                                    case 'hourglass_large': return RARITY_SETTINGS.LEGENDARY;
                                                    case 'repair_kit': return RARITY_SETTINGS.RARE;
                                                    case 'ancient_blueprint': return RARITY_SETTINGS.DIVINE;
                                                    case 'time_skip_ticket': return RARITY_SETTINGS.RARE;
                                                    case 'construction_nanobot': return RARITY_SETTINGS.EPIC;
                                                    case 'vip_withdrawal_card': return RARITY_SETTINGS.LEGENDARY;
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
                                                                {item.dailyBonus > 0 ? `${formatBonus(item.dailyBonus)}/${t('time.day')}` : (item.specialEffect || (activeTab === 'ITEMS' ? t('warehouse.items_tab') : t('warehouse.equipment_tab')))}
                                                            </div>
                                                            {getItemDisplayName(item).includes('หุ่นยนต์ AI') && (
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">ใช้งานอยู่ (Active)</span>
                                                                </div>
                                                            )}
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
                        {activeTab === 'REPAIR_KITS' && (
                            <div className="space-y-6">
                                {groupedRepairKits.length === 0 ? (
                                    <div className="text-center py-20 text-stone-600 italic">{t('warehouse.no_items')}</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedRepairKits.map((group, idx) => {
                                            const item = group.representative;
                                            const rarityStyle = RARITY_SETTINGS[item.rarity || 'COMMON'] || RARITY_SETTINGS.COMMON;

                                            return (
                                                <div key={idx} className={`bg-stone-900/80 border ${rarityStyle.border} rounded-xl p-4 flex items-center justify-between relative overflow-hidden group`}>
                                                    <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-stone-950 ${rarityStyle.border}`}>
                                                            {getIcon(item, `w-6 h-6 ${rarityStyle.color}`)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className={`text-sm font-bold truncate ${rarityStyle.color}`}>
                                                                {getItemDisplayName(item)}
                                                            </div>
                                                            <div className="text-[10px] text-stone-500 truncate mt-0.5">
                                                                {item.specialEffect || `Repair Value: +${(item as any).repairValue || 3000} HP`}
                                                            </div>
                                                            <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${rarityStyle.color}`}>
                                                                {item.rarity}
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
                            <div className="h-full">
                                {selectedEquipmentGroup ? (
                                    <div className="flex flex-col md:flex-row gap-6 h-full animate-in slide-in-from-right-10 duration-300">
                                        {/* Detail Panel */}
                                        <div className="flex-1 space-y-6">
                                            <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <button
                                                        onClick={() => setSelectedEquipmentGroup(null)}
                                                        className="p-2 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-white transition-colors"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col items-center text-center mb-8">
                                                    <div className={`w-32 h-32 rounded-3xl border-4 ${RARITY_SETTINGS[selectedEquipmentGroup.representative.rarity || 'COMMON']?.border || 'border-stone-700'} bg-stone-950 flex items-center justify-center shadow-2xl mb-4 relative group-hover:scale-105 transition-transform duration-500`}>
                                                        {getIcon(selectedEquipmentGroup.representative, `w-20 h-20 ${RARITY_SETTINGS[selectedEquipmentGroup.representative.rarity || 'COMMON']?.color || 'text-stone-400'}`)}
                                                        {selectedEquipmentGroup.representative.level && selectedEquipmentGroup.representative.level > 1 && (
                                                            <div className="absolute -bottom-3 bg-yellow-600 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-stone-950 shadow-lg">
                                                                Lv. {selectedEquipmentGroup.representative.level}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className={`text-2xl font-black uppercase tracking-tight ${selectedEquipmentGroup.representative.isHandmade ? 'text-yellow-400' : 'text-white'}`}>
                                                        {getItemDisplayName(selectedEquipmentGroup.representative)}
                                                    </h3>
                                                    <div className={`text-xs font-black uppercase tracking-widest mt-1 ${RARITY_SETTINGS[selectedEquipmentGroup.representative.rarity || 'COMMON']?.color || 'text-stone-400'}`}>
                                                        {selectedEquipmentGroup.representative.rarity || 'COMMON'}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-stone-950/50 border border-stone-800 rounded-xl p-4">
                                                        <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-1">{t('inventory.daily_bonus')}</div>
                                                        <div className="text-xl font-mono font-bold text-white flex items-center gap-2">
                                                            <Coins size={16} className="text-yellow-500" />
                                                            {formatCurrency(selectedEquipmentGroup.representative.dailyBonus || 0, { showDecimals: true })}
                                                            <span className="text-xs text-stone-500 font-normal">/{t('time.day')}</span>
                                                        </div>
                                                    </div>
                                                    {selectedEquipmentGroup.representative.specialEffect && (
                                                        <div className="bg-stone-950/50 border border-stone-800 rounded-xl p-4">
                                                            <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-1">{t('inventory.special_property')}</div>
                                                            <div className="text-sm font-bold text-emerald-400 uppercase tracking-tight">
                                                                {getLocalized(selectedEquipmentGroup.representative.specialEffect)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {equipmentAction === 'UPGRADE' ? (
                                                    <div className="bg-stone-950 rounded-2xl border border-yellow-500/30 p-6 animate-in zoom-in duration-300">
                                                        <div className="text-center mb-6">
                                                            <h4 className="text-yellow-500 font-black uppercase tracking-widest text-sm mb-1">{t('inventory.upgrade_req')}</h4>
                                                            <p className="text-stone-500 text-[10px] uppercase tracking-wider">{t('inventory.upgrade_fail_penalty')}</p>
                                                        </div>

                                                        {(() => {
                                                            const currentLevel = selectedEquipmentGroup.representative.level || 1;
                                                            const req = UPGRADE_REQUIREMENTS[currentLevel];
                                                            if (!req) return <div className="text-center text-stone-500 py-4 uppercase font-black tracking-widest">{t('inventory.max_level')}</div>;

                                                            const matTier = req.matTier || 1;
                                                            const matAmount = req.matAmount || 1;
                                                            const hasChip = inventory.some(i => i.typeId === 'upgrade_chip');
                                                            const hasMat = (materials[matTier] || 0) >= matAmount;

                                                            return (
                                                                <div className="space-y-6">
                                                                    <div className="flex items-center justify-center gap-6">
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${hasChip ? 'bg-purple-900/20 border-purple-500/50' : 'bg-stone-900 border-stone-800 grayscale'}`}>
                                                                                <Cpu size={28} className={hasChip ? 'text-purple-400' : 'text-stone-600'} />
                                                                            </div>
                                                                            <span className={`text-[10px] font-bold uppercase ${hasChip ? 'text-purple-400' : 'text-stone-600'}`}>1 CPU</span>
                                                                        </div>
                                                                        <Plus size={16} className="text-stone-800" />
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${hasMat ? 'bg-stone-800 border-emerald-500/50' : 'bg-stone-900 border-stone-800 grayscale'}`}>
                                                                                <MaterialIcon id={matTier} size="w-10 h-10" iconSize={20} />
                                                                                <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black border-2 border-stone-950 shadow-lg ${hasMat ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                                                                    x{matAmount}
                                                                                </span>
                                                                            </div>
                                                                            <span className={`text-[10px] font-bold uppercase truncate max-w-[60px] ${hasMat ? 'text-stone-300' : 'text-stone-600'}`}>
                                                                                {getLocalized(MATERIAL_CONFIG.NAMES[matTier as keyof typeof MATERIAL_CONFIG.NAMES])}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-500 px-4">
                                                                        <span>{t('inventory.upgrade_chance')}</span>
                                                                        <span className="text-yellow-500">{(req.chance * 100).toFixed(0)}%</span>
                                                                    </div>

                                                                    <div className="flex gap-3 mt-4">
                                                                        <button
                                                                            onClick={() => setEquipmentAction('DETAILS')}
                                                                            className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold rounded-xl transition-all uppercase tracking-widest text-xs"
                                                                        >
                                                                            {t('common.cancel')}
                                                                        </button>
                                                                        <button
                                                                            onClick={handleUpgradeEquipment}
                                                                            disabled={true}
                                                                            className="flex-1 py-3 bg-stone-800 text-stone-600 font-black rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-1 cursor-not-allowed opacity-75"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Hammer size={16} /> {t('inventory.upgrade')}
                                                                            </div>
                                                                            <span className="text-[9px] text-red-500 font-bold">ระบบตีบวกปิดปรับปรุงชั่วคราว</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-4 justify-center">
                                                        <button
                                                            onClick={() => setSelectedEquipmentGroup(null)}
                                                            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold rounded-xl transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                                                        >
                                                            <ArrowRight className="rotate-180" size={16} /> {t('common.cancel')}
                                                        </button>
                                                        <button
                                                            onClick={handleScrapEquipment}
                                                            disabled={equipmentAction === 'BUSY'}
                                                            className="px-6 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                                                        >
                                                            <Hammer size={16} className="rotate-180" /> {t('rig.destroy')}
                                                        </button>
                                                        <button
                                                            onClick={() => { }}
                                                            disabled={true}
                                                            className="px-8 py-3 bg-stone-800 text-stone-600 font-black rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-1 cursor-not-allowed opacity-75"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ArrowUpCircle size={16} /> {t('inventory.upgrade')}
                                                            </div>
                                                            <span className="text-[8px] text-red-500 font-bold">ระบบตีบวกปิดปรับปรุงชั่วคราว</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Group Info Sidebar */}
                                        <div className="w-full md:w-64 space-y-4">
                                            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4">
                                                <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-3">{t('inventory.remaining_count').replace('{count}', selectedEquipmentGroup.count.toString())}</div>
                                                <div className="space-y-2">
                                                    {selectedEquipmentGroup.originalItems.map((item, i) => {
                                                        const isSelected = selectedEquipmentGroup.representative.id === item.id;
                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={() => setSelectedEquipmentGroup({ ...selectedEquipmentGroup, representative: item })}
                                                                className={`flex items-center justify-between text-[10px] p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800 hover:border-stone-700'}`}
                                                            >
                                                                <span className="font-mono">ID: {item.id.slice(-6)}</span>
                                                                <span className={isSelected ? "font-black" : "font-bold opacity-50"}>{isSelected ? t('common.selected') : t('inventory.status')}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedEquipment.map((group, idx) => {
                                            const item = group.representative;
                                            const safeRarity = (item.rarity && RARITY_SETTINGS[item.rarity]) ? item.rarity : 'COMMON';
                                            let containerClass = `bg-stone-900/80 border ${RARITY_SETTINGS[safeRarity].border}`;

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedEquipmentGroup(group)}
                                                    className={`${containerClass} rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-pointer hover:bg-stone-800/80`}
                                                >
                                                    <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-stone-950 border-stone-800 group-hover:scale-110 transition-transform`}>
                                                            {getIcon(item, `w-6 h-6 ${RARITY_SETTINGS[safeRarity].color}`)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className={`text-sm font-bold truncate ${item.isHandmade ? 'text-yellow-400' : 'text-white'}`}>
                                                                {getLocalized(item.name)}
                                                                {item.level && item.level > 1 && <span className="ml-1 text-[10px] text-yellow-500">+{item.level}</span>}
                                                            </div>
                                                            <div className="text-[10px] text-stone-500 truncate">
                                                                {item.dailyBonus > 0 ? `${formatBonus(item.dailyBonus)}/${t('time.day')}` : (item.specialEffect || (activeTab === 'ITEMS' ? t('warehouse.items_tab') : t('warehouse.equipment_tab')))}
                                                            </div>
                                                            <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${RARITY_SETTINGS[safeRarity].color}`}>
                                                                {safeRarity}
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
                            <span className="text-lg font-mono font-bold text-white">
                                {formatCurrency(balance)}
                                <span className="text-sm font-normal opacity-50 ml-2">
                                    ({formatCurrency(balance, { forceTHB: language === 'en', forceUSD: language === 'th' })})
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-950 px-3 py-1 rounded-lg border border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">{t('warehouse.extractor_status')}</span>
                            <span className={hasMixer ? "text-emerald-500 text-xs font-bold" : "text-red-500 text-xs font-bold"}>{hasMixer ? t('warehouse.connected') : t('warehouse.not_installed')}</span>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};
