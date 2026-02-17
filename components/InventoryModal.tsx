

import React, { useState, useEffect } from 'react';
import { X, Backpack, DollarSign, ArrowUpCircle, Cpu, Hammer, HardHat, Glasses, Shirt, Footprints, Smartphone, Monitor, Bot, Truck, ShoppingBag, Sparkles, AlertTriangle, Hourglass, Search, Factory, Key, FileText, Timer, Shield, Gem, Star, TrendingUp, TrendingDown, Ticket, Zap, TrainFront, CreditCard, Briefcase } from 'lucide-react';
import { AccessoryIcon } from './AccessoryIcon';
import { AccessoryItem } from '../services/types';
import { CURRENCY, RARITY_SETTINGS, UPGRADE_REQUIREMENTS, MATERIAL_CONFIG, SHOP_ITEMS } from '../constants';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { EnhanceModal } from './EnhanceModal';
import { EQUIPMENT_PRIMARY_MATERIALS } from '../constants';


interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: AccessoryItem[];
    userId: string;
    onRefresh: () => void;
    marketState?: any; // Use any for brevity or import MarketState
    materials?: Record<number, number>; // Pass materials to show total value
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, inventory, userId, onRefresh, marketState, materials = {} }) => {
    const { t, language, getLocalized, formatCurrency, formatBonus } = useTranslation();
    const [selectedItem, setSelectedItem] = useState<AccessoryItem | null>(null);
    const [action, setAction] = useState<'DETAILS' | 'UPGRADE' | 'SELL'>('DETAILS');
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [msg, setMsg] = useState('');

    const [animationStep, setAnimationStep] = useState<'IDLE' | 'PREPARE' | 'HAMMER' | 'IMPACT' | 'RESULT'>('IDLE');
    const [upgradeResult, setUpgradeResult] = useState<{ success: boolean, newItem?: AccessoryItem } | null>(null);
    const [showEnhanceModal, setShowEnhanceModal] = useState(false);
    const [rigs, setRigs] = useState<any[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedItem(null);
            setAction('DETAILS');
            setAnimationStep('IDLE');
            setUpgradeResult(null);
            setMsg('');
            api.getMyRigs().then(setRigs).catch(console.error);
        }
    }, [isOpen]);

    // rigs is now a state
    const equippedIds = new Set<string>();
    rigs.forEach(r => r.slots?.forEach((s: any) => { if (s) equippedIds.add(s); }));

    // Group items by typeId
    const groupedInventory = React.useMemo(() => {
        const groups: Record<string, { representative: AccessoryItem, count: number, allIds: string[], items: AccessoryItem[] }> = {};
        inventory.forEach(item => {
            const nameStr = (typeof item.name === 'string' ? item.name : (item.name?.en || item.name?.th || '')).toLowerCase();
            if (nameStr === 'robot' || nameStr === 'hat') return;

            const key = `${item.typeId}_${item.level || 1}_${item.rarity}`;
            if (!groups[key]) {
                groups[key] = { representative: item, count: 0, allIds: [], items: [] };
            }
            groups[key].count++;
            groups[key].allIds.push(item.id);
            groups[key].items.push(item);
        });
        return Object.values(groups);
    }, [inventory]);

    const totalMaterialsValue = React.useMemo(() => {
        if (!marketState?.trends || !materials) return 0;
        return Object.entries(materials).reduce((acc, [tier, count]) => {
            const price = marketState.trends[Number(tier)]?.currentPrice || (MATERIAL_CONFIG.PRICES as any)[tier] || 0;
            return acc + (price * (count as number));
        }, 0);
    }, [marketState, materials]);

    const getItemDisplayName = (item: any) => {
        if (!item) return '';
        // Try to find in SHOP_ITEMS first for bilingual name
        const typeId = item.typeId || item.id;
        if (typeId) {
            const shopItem = SHOP_ITEMS.find(s => s.id === typeId);
            if (shopItem && shopItem.name) {
                return getLocalized(shopItem.name);
            }
        }
        // Fallback to item.name if it exists (might be string or object)
        if (item.name) {
            return getLocalized(item.name);
        }
        return '';
    };




    const handleSell = async () => {
        try {
            await api.inventory.sell(selectedItem!.id);
            setMsg(t('inventory.sell_success'));
            setTimeout(() => {
                setMsg('');
                setSelectedItem(null);
                setAction('DETAILS');
                onRefresh();
            }, 500);
        } catch (e: any) {
            setMsg(e.message);
        }
    };

    const handleUpgrade = async () => {
        if (!selectedItem) return;
        setAnimationStep('PREPARE');
        setTimeout(async () => {
            try {
                const res = await api.inventory.upgrade(selectedItem.id, false);
                setAnimationStep('HAMMER');
                setTimeout(() => {
                    setAnimationStep('IMPACT');
                }, 400);
                setTimeout(() => {
                    setUpgradeResult({ success: res.success, newItem: res.item });
                    setAnimationStep('RESULT');
                    if (res.success) onRefresh();
                }, 800);
            } catch (e: any) {
                setMsg(e.message);
                setAnimationStep('IDLE');
            }
        }, 500);
    };

    const resetAfterUpgrade = () => {
        setAnimationStep('IDLE');
        setUpgradeResult(null);
        setAction('DETAILS');
        if (upgradeResult?.success) {
            setSelectedItem(null);
            onRefresh();
        }
    };

    // Determine upgrade requirements
    let matTier = 1;
    let matAmount = 1;
    let chance = 1.0;
    let isMaxLevel = false;

    if (selectedItem) {
        const currentLevel = selectedItem.level || 1;
        const req = UPGRADE_REQUIREMENTS[currentLevel];
        if (req) {
            matTier = req.matTier;
            matAmount = req.matAmount;
            chance = req.chance;
        } else {
            isMaxLevel = true;
        }
    }

    const matName = getLocalized(MATERIAL_CONFIG.NAMES[matTier as keyof typeof MATERIAL_CONFIG.NAMES]);

    if (!isOpen) return null;

    const renderDetailView = () => {
        if (!selectedItem) return <div className="text-stone-500 text-center mt-10">{t('inventory.select_item')}</div>;

        const isEquipped = equippedIds.has(selectedItem.id);
        const isChip = selectedItem.typeId === 'upgrade_chip';
        const isSpecial = ['chest_key', 'mixer', 'magnifying_glass', 'hourglass_small', 'hourglass_medium', 'hourglass_large'].includes(selectedItem.typeId);

        return (
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-16 h-16 rounded-lg border-2 ${RARITY_SETTINGS[selectedItem.rarity || 'COMMON']?.border || 'border-stone-600'} bg-stone-800 flex items-center justify-center`}>
                        <AccessoryIcon item={selectedItem} size={32} />
                    </div>
                    <div className="text-right">
                        <div className={`font-bold ${selectedItem.isHandmade ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'text-white'}`}>{getItemDisplayName(selectedItem)}</div>
                        <div className={`text-[10px] font-bold tracking-tight uppercase ${RARITY_SETTINGS[selectedItem.rarity || 'COMMON']?.color || 'text-stone-400'}`}>{selectedItem.rarity || 'COMMON'}</div>
                        {selectedItem.level && selectedItem.level > 1 && <div className="text-xs text-yellow-500 font-bold">Lv. {selectedItem.level}</div>}
                    </div>
                </div>

                <div className="space-y-2 text-sm text-stone-400 mb-6 relative z-10">
                    <div className="flex justify-between">
                        <span>{t('inventory.daily_bonus')}</span>
                        <span className="text-white font-mono">{formatCurrency(selectedItem.dailyBonus || 0, { showDecimals: true })}</span>
                    </div>
                    {selectedItem.specialEffect && (
                        <div className="flex justify-between">
                            <span>{t('inventory.special_property')}</span>
                            <span className="text-emerald-400 font-bold">{getLocalized(selectedItem.specialEffect)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>{t('inventory.status')}</span>
                        <span className={isEquipped ? 'text-green-400 font-bold' : 'text-stone-500'}>{isEquipped ? t('inventory.equipped') : t('inventory.empty_slot')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t('inventory.sell_price')}</span>
                        <span className="text-emerald-400 font-mono">{formatCurrency(selectedItem.price * 0.5)}</span>
                    </div>
                </div>

                {/* Duplicate Instances Selection */}
                {(() => {
                    const group = groupedInventory.find(g => g.allIds.includes(selectedItem.id));
                    if (!group || group.count <= 1) return null;
                    return (
                        <div className="mb-6 p-3 bg-stone-950/50 rounded-xl border border-stone-800 relative z-10">
                            <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                                <span>{t('inventory.remaining_count').replace('{count}', group.count.toString())}</span>
                                <span className="text-yellow-500/50">{t('common.select')}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map((it, idx) => {
                                    const isTarget = it.id === selectedItem.id;
                                    const itEquipped = equippedIds.has(it.id);
                                    return (
                                        <button
                                            key={it.id}
                                            onClick={() => setSelectedItem(it)}
                                            className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono transition-all flex items-center gap-1 ${isTarget ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700'}`}
                                        >
                                            ID:{it.id.slice(-4)}
                                            {itEquipped && <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {msg && <div className="mb-4 p-2 bg-blue-900/30 text-blue-200 text-xs text-center rounded relative z-10">{msg}</div>}

                {action === 'DETAILS' && (
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <button
                            onClick={() => setAction('SELL')}
                            disabled={isEquipped || isChip}
                            className="py-2 bg-red-900/20 border border-red-900/50 text-red-400 rounded hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <DollarSign size={16} /> {t('inventory.sell_back')}
                        </button>
                        <button
                            onClick={() => {
                                const isEnhanceable = Object.keys(EQUIPMENT_PRIMARY_MATERIALS).some(type => selectedItem.typeId.startsWith(type));
                                if (isEnhanceable) {
                                    setShowEnhanceModal(true);
                                } else {
                                    setAction('UPGRADE');
                                }
                            }}
                            disabled={isEquipped || isMaxLevel}
                            className="py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                        >
                            <ArrowUpCircle size={16} /> {t('inventory.upgrade')}
                        </button>
                    </div>
                )}

                {action === 'SELL' && (
                    <div className="text-center relative z-10">
                        <p className="text-red-400 text-sm mb-3">{t('inventory.sell_confirm')}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setAction('DETAILS')} className="flex-1 py-2 bg-stone-800 rounded text-stone-300">{t('common.cancel')}</button>
                            <button onClick={handleSell} className="flex-1 py-2 bg-red-600 rounded text-white font-bold">{t('inventory.confirm_sell')}</button>
                        </div>
                    </div>
                )}

                {action === 'UPGRADE' && (
                    <div className="text-center relative z-10">
                        {isMaxLevel ? (
                            <div className="text-stone-500 py-4">{t('inventory.max_level')}</div>
                        ) : (
                            <div className="bg-stone-950 p-2 rounded mb-3">
                                <div className="text-sm text-stone-300 mb-2 font-bold">{t('inventory.upgrade_req')}</div>
                                <div className="flex justify-center items-center gap-2 mb-2">
                                    <div className="w-10 h-10 border border-stone-700 bg-stone-800 rounded flex items-center justify-center relative">
                                        <AccessoryIcon item={selectedItem} size={24} />
                                    </div>
                                    <span className="text-stone-500">+</span>
                                    <div className="w-10 h-10 border border-purple-500 bg-purple-900/20 rounded flex items-center justify-center" title="ชิปอัปเกรด">
                                        <Cpu size={20} className="text-purple-400" />
                                    </div>
                                    <span className="text-stone-500">+</span>
                                    <div className="w-10 h-10 border border-stone-600 bg-stone-700 rounded flex items-center justify-center relative" title={matName}>
                                        <MaterialIcon id={matTier} size="w-6 h-6" iconSize={12} />
                                        <span className="absolute -bottom-1 -right-1 text-[8px] bg-black text-white px-1 rounded">x{matAmount}</span>
                                    </div>
                                </div>
                                <ul className="text-xs text-stone-500 space-y-1">
                                    <li>• {t('inventory.req_chip_mat').replace('{matName}', matName).replace('{matAmount}', matAmount.toString())}</li>
                                    <li>• {t('inventory.upgrade_chance')} {(chance * 100).toFixed(0)}%</li>
                                    <li>• <span className="text-red-400">{t('inventory.upgrade_fail_penalty')}</span></li>
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button onClick={() => setAction('DETAILS')} className="flex-1 py-2 bg-stone-800 rounded text-stone-300">{t('common.cancel')}</button>
                            <button
                                onClick={handleUpgrade}
                                disabled={isUpgrading || isMaxLevel}
                                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Hammer size={14} /> {t('inventory.upgrade')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">

                {animationStep !== 'IDLE' && selectedItem && (
                    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center overflow-hidden">
                        {(animationStep === 'PREPARE' || animationStep === 'HAMMER' || animationStep === 'IMPACT') && (
                            <div className="relative">
                                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-10 bg-stone-800 rounded-full blur-xl opacity-50"></div>
                                <div className={`relative z-10 transition-transform duration-100 ${animationStep === 'IMPACT' ? 'scale-90 translate-y-2' : 'scale-150 animate-[float-gold_2s_infinite]'}`}>
                                    <div className={`w-32 h-32 rounded-xl border-4 ${(RARITY_SETTINGS[selectedItem.rarity] || RARITY_SETTINGS.COMMON).border} bg-stone-900 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                                        <AccessoryIcon item={selectedItem} size={80} />
                                    </div>
                                </div>
                                {animationStep === 'PREPARE' && (
                                    <>
                                        <div className="absolute top-0 -left-32 animate-[converge-right_0.5s_forwards]">
                                            <div className="w-12 h-12 rounded-full border border-purple-500 bg-purple-900/50 flex items-center justify-center text-purple-300 shadow-[0_0_20px_purple]">
                                                <Cpu size={24} />
                                            </div>
                                        </div>
                                        <div className="absolute top-0 -right-32 animate-[converge-left_0.5s_forwards]">
                                            <div className="w-12 h-12 rounded-full border border-stone-500 bg-stone-900/50 flex items-center justify-center shadow-[0_0_20px_white]">
                                                <div className={`flex items-center justify-center w-full h-full`}>
                                                    <MaterialIcon id={matTier} size="w-8 h-8" iconSize={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {(animationStep === 'HAMMER' || animationStep === 'IMPACT') && (
                                    <div className={`absolute -top-32 -right-32 z-20 origin-bottom-left transition-transform duration-150 ${animationStep === 'IMPACT' ? '-rotate-45' : 'rotate-12'}`}>
                                        <Hammer size={120} className="text-stone-300 drop-shadow-2xl" fill="#57534e" />
                                    </div>
                                )}
                                {animationStep === 'IMPACT' && (
                                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                        <div className="w-full h-full animate-[ping_0.2s_ease-out]">
                                            <Sparkles size={100} className="text-yellow-200" />
                                        </div>
                                        <div className="absolute w-40 h-40 bg-white/50 rounded-full blur-xl animate-[pulse_0.1s_ease-out]"></div>
                                    </div>
                                )}
                            </div>
                        )}
                        {animationStep === 'RESULT' && upgradeResult && (
                            <div className="text-center animate-in zoom-in duration-500">
                                {upgradeResult.success ? (
                                    <>
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-yellow-500/30 blur-[60px] animate-pulse"></div>
                                            <div className="relative z-10 w-40 h-40 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-900 to-black flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.6)] animate-[bounce_2s_infinite]">
                                                <AccessoryIcon item={selectedItem} size={96} />
                                                <div className="absolute -bottom-2 bg-yellow-600 text-white font-black px-4 py-1 rounded-full border-2 border-yellow-300 shadow-lg text-xl">
                                                    Lv. {selectedItem.level ? selectedItem.level + 1 : 2}
                                                </div>
                                            </div>
                                            <Sparkles className="absolute -top-4 -right-4 text-yellow-200 animate-[spin_3s_linear_infinite]" size={40} />
                                            <Sparkles className="absolute -bottom-4 -left-4 text-yellow-200 animate-[spin_2s_linear_infinite]" size={30} />
                                        </div>
                                        <h3 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500 drop-shadow-lg mb-2">
                                            {t('inventory.upgrade_success_banner')}
                                        </h3>
                                        <p className="text-yellow-200/80 mb-8 font-bold tracking-widest uppercase">{t('inventory.permanent_boost')}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-red-500/20 blur-[50px]"></div>
                                            <div className="relative z-10 w-32 h-32 rounded-full border-4 border-red-900 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] grayscale opacity-80 animate-[shake_0.5s_ease-in-out]">
                                                <AccessoryIcon item={selectedItem} size={64} />
                                            </div>
                                            <AlertTriangle className="absolute -top-2 -right-2 text-red-500 animate-pulse" size={40} />
                                        </div>
                                        <h3 className="text-3xl font-display font-bold text-red-500 mb-2 tracking-widest">
                                            {t('inventory.upgrade_failed_banner')}
                                        </h3>
                                        <p className="text-stone-500 mb-8">{t('inventory.upgrade_fail_desc')}</p>
                                    </>
                                )}
                                <button onClick={resetAfterUpgrade} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold border border-stone-600 transition-all hover:scale-105">{t('common.confirm')}</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-900/20 p-2 rounded text-purple-500">
                            <Backpack size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('inventory.title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{t('inventory.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                    <div className="w-full sm:w-2/3 border-b sm:border-b-0 sm:border-r border-stone-800 overflow-y-auto custom-scrollbar p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {/* Render Grouped (Stacked) Inventory */}
                            {groupedInventory.map((group, idx) => {
                                const item = group.representative;
                                const isSelected = selectedItem?.id && group.allIds.includes(selectedItem.id);
                                const safeRarity = (item.rarity && RARITY_SETTINGS[item.rarity]) ? item.rarity : 'COMMON';
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => { setSelectedItem(item); setAction('DETAILS'); setMsg(''); }}
                                        className={`relative p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center group
                                 ${isSelected ? 'bg-stone-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-stone-900 border-stone-800 hover:bg-stone-800'}
`}
                                    >
                                        <div className="relative">
                                            <AccessoryIcon item={item} size={32} />

                                            {/* Quantity Badge */}
                                            {group.count > 1 && (
                                                <div className="absolute -top-1 -right-3 bg-yellow-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-stone-950 shadow-lg z-10">
                                                    x{group.count}
                                                </div>
                                            )}

                                            {/* Equipped Indicator */}
                                            {group.allIds.some(id => equippedIds.has(id)) && (
                                                <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full animate-pulse z-10"></div>
                                            )}

                                            {/* Level Badge */}
                                            {item.level && item.level > 1 && <span className="absolute -bottom-1 -right-2 text-[8px] bg-yellow-900 text-yellow-200 px-1 rounded">+{item.level}</span>}

                                            {/* Tooltip */}
                                            <div className="absolute left-[80%] top-0 z-[150] bg-stone-900/95 text-[10px] text-white p-2 rounded-lg border border-stone-700 shadow-xl opacity-0 group-hover:opacity-100 hover:opacity-100 pointer-events-none transition-opacity min-w-[120px] backdrop-blur-sm whitespace-nowrap">
                                                <div className={`font-bold ${(RARITY_SETTINGS[safeRarity] || RARITY_SETTINGS.COMMON).color} mb-1`}>{getItemDisplayName(item)}</div>
                                                {group.count > 1 && <div className="text-stone-400 text-[9px] mb-1 italic">{t('inventory.remaining_count').replace('{count}', group.count.toString())}</div>}
                                                {item.specialEffect && (
                                                    <div className="text-[9px] text-emerald-400 mb-1 font-bold">
                                                        {getLocalized(item.specialEffect)}
                                                    </div>
                                                )}
                                                {true && (
                                                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                                        <Star size={10} className="text-yellow-500" />
                                                        <span className="font-mono text-yellow-500">{t('inventory.bonus_per_day').replace('{bonus}', formatBonus(item.dailyBonus || 0, item.typeId))}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] truncate w-full ${item.isHandmade ? 'text-yellow-400 font-bold' : 'text-stone-400'}`}>
                                            {getItemDisplayName(item)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {inventory.length === 0 && <div className="text-stone-600 text-center mt-10">{t('inventory.empty')}</div>}

                        {/* Market Value Summary */}
                        {totalMaterialsValue > 0 && (
                            <div className="mt-6 pt-4 border-t border-stone-800/50">
                                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-emerald-400" />
                                        <span className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider">{t('inventory.total_value')}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-emerald-400 font-mono">
                                            {formatCurrency(totalMaterialsValue)}
                                        </div>
                                        <div className="text-[9px] text-emerald-500/50">{t('inventory.market_ref')}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full sm:w-1/3 bg-stone-950 p-4 overflow-y-auto">
                        {renderDetailView()}
                    </div>
                </div>

                <style>{`
@keyframes converge-right {
    0% { transform: translateX(0) scale(1); opacity: 1; }
    100% { transform: translateX(8rem) scale(0); opacity: 0; }
}
@keyframes converge-left {
    0% { transform: translateX(0) scale(1); opacity: 1; }
    100% { transform: translateX(-8rem) scale(0); opacity: 0; }
}
`}</style>
                {showEnhanceModal && selectedItem && (
                    <EnhanceModal
                        item={selectedItem}
                        materials={materials as any}
                        inventory={inventory}
                        language={language}
                        onClose={() => setShowEnhanceModal(false)}
                        onSuccess={(updated) => {
                            // Update the item in the local view if possible, or just refresh
                            onRefresh();
                        }}
                    />
                )}
            </div>
        </div>
    );
};
