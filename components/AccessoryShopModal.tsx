
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Coins, Zap, Clock, CalendarDays, Key, Star, Factory, Search, Truck, Cpu, Hammer, Timer, ArrowRight, ChevronRight, Hourglass, Sparkles, FileText, Fan, Wifi, Server, Grid, BoxSelect, Briefcase, CreditCard } from 'lucide-react';
import { SHOP_ITEMS, CURRENCY, RARITY_SETTINGS, MATERIAL_CONFIG, EQUIPMENT_SERIES } from '../constants';
import { CraftingQueueItem } from '../services/types';
import { InfinityGlove } from './InfinityGlove';
import { MaterialIcon } from './MaterialIcon';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

interface AccessoryShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletBalance: number;
    onBuy: (itemId: string) => void;
    onRefresh?: () => void;
    addNotification?: (n: any) => void;
    userId?: string;
}

export const AccessoryShopModal: React.FC<AccessoryShopModalProps> = ({ isOpen, onClose, walletBalance, onBuy, onRefresh, addNotification, userId }) => {
    const { t, getLocalized, formatCurrency, language, formatBonus } = useTranslation();
    const [activeTab, setActiveTab] = useState<'SHOP' | 'WORKSHOP'>('SHOP');
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [confirmItem, setConfirmItem] = useState<{ id: string, price: number, quantity: number, name: string } | null>(null);

    const [craftingQueue, setCraftingQueue] = useState<CraftingQueueItem[]>([]);
    const [userMaterials, setUserMaterials] = useState<Record<number, number>>({});
    const [userInventory, setUserInventory] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({});
    const [claimedItem, setClaimedItem] = useState<any>(null);


    useEffect(() => {
        if (isOpen) {
            api.crafting.getQueue().then(queue => {
                setCraftingQueue(queue || []);
            }).catch(err => {
                console.error('Failed to fetch crafting queue:', err);
                setCraftingQueue([]);
            });

            api.getMe().then(user => {
                setUserMaterials(user.materials || {});
                setUserInventory(user.inventory || []);
            }).catch(err => {
                console.error('Failed to fetch user data:', err);
                setUserMaterials({});
                setUserInventory([]);
            });
        }
    }, [isOpen, refreshTrigger]);

    useEffect(() => {
        if (!isOpen || activeTab !== 'WORKSHOP') return;
        const interval = setInterval(() => {
            setRefreshTrigger(prev => prev + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, [isOpen, activeTab]);

    if (!isOpen) return null;

    const handleBuyClick = (itemId: string, price: number, name: string) => {
        const quantity = buyQuantities[itemId] || 1;
        const totalCost = price * quantity;

        if (walletBalance < totalCost) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: userId || '',
                message: t('common.insufficient_balance'),
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
            return;
        }

        setConfirmItem({ id: itemId, price, quantity, name });
    };

    const handleConfirmBuy = () => {
        if (!confirmItem) return;
        const { id, quantity } = confirmItem;

        setBuyingId(id);
        const processBuy = async () => {
            for (let i = 0; i < quantity; i++) {
                await onBuy(id); // Wait for each purchase to finish
            }
            setBuyingId(null);
            setBuyQuantities(prev => ({ ...prev, [id]: 1 }));
            setRefreshTrigger(prev => prev + 1);
        };

        processBuy();
        setConfirmItem(null);

        // Sync stats - shop equipment purchase
        const totalCost = confirmItem.price * confirmItem.quantity;
        api.user.incrementStats({ weeklyStats: { moneySpent: totalCost } }).catch(console.error);
    };

    const handleQuantityChange = (itemId: string, delta: number) => {
        setBuyQuantities(prev => {
            const current = prev[itemId] || 1;
            const newVal = Math.max(1, current + delta);
            return { ...prev, [itemId]: newVal };
        });
    };

    const setQuantity = (itemId: string, amount: number) => {
        setBuyQuantities(prev => ({ ...prev, [itemId]: amount }));
    };

    const handleStartCraft = async (itemId: string) => {
        console.log('[DEBUG] handleStartCraft called with itemId:', itemId);
        try {
            console.log('[DEBUG] Calling api.crafting.start...');
            const result = await api.crafting.start(itemId);
            console.log('[DEBUG] API response:', result);
            if (result.success) {
                // Force re-fetch queue from server to ensure correct data
                const freshQueue = await api.crafting.getQueue();
                console.log('[DEBUG] Fresh queue from server:', freshQueue);
                setCraftingQueue(freshQueue || []);
                setUserMaterials(result.materials || {});
                setRefreshTrigger(prev => prev + 1);
                if (onRefresh) onRefresh();
            }
        } catch (e: any) {
            console.error('[DEBUG] handleStartCraft error:', e);
            const data = e.response?.data;
            const message = data?.message || e.message || 'เกิดข้อผิดพลาด';

            if (data?.missing) {
                const { name, need, have } = data.missing;
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: userId || '',
                    message: `${t('item_shop.insufficient_mats')}: "${name}" (${have}/${need})`,
                    type: 'ERROR',
                    read: false,
                    timestamp: Date.now()
                });
            } else {
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: userId || '',
                    message: message,
                    type: 'ERROR',
                    read: false,
                    timestamp: Date.now()
                });
            }
        }
    };

    const handleClaimCraft = async (queueId: string) => {
        try {
            const result = await api.crafting.claim(queueId);
            if (result.success) {
                setCraftingQueue(result.queue || []);
                setClaimedItem(result.item);
                setRefreshTrigger(prev => prev + 1);
                if (onRefresh) onRefresh();
            }
        } catch (e: any) {
            const message = e.response?.data?.message || e.message || 'เกิดข้อผิดพลาด';
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: userId || '',
                message: message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }
    };

    const getItemDisplayName = (item: any) => {
        if (!item) return '';
        if (item.name && typeof item.name === 'object') {
            return getLocalized(item.name);
        }
        return item.name || '';
    };

    const getIcon = (iconName: string, className: string, itemId?: string) => {
        if (itemId === 'auto_excavator') {
            return (
                <div className="relative">
                    <Zap className={className} />
                    <Star size={14} className="absolute -top-1 -right-1 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)] animate-pulse" />
                </div>
            );
        }

        // Special handling for Hourglasses to make them distinct
        if (itemId === 'hourglass_small') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-125 blur-sm"></div>
                    <Hourglass className={`${className} text-blue-400 relative z-10`} />
                </div>
            );
        }
        if (itemId === 'hourglass_medium') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full scale-150 blur-md animate-pulse"></div>
                    <div className="absolute inset-0 border border-purple-500/30 rounded-full scale-125"></div>
                    <Sparkles className="absolute -top-2 -right-2 text-purple-300 animate-pulse" size={14} />
                    <Hourglass className={`${className} text-purple-400 relative z-10`} />
                </div>
            );
        }
        if (itemId === 'hourglass_large') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-500/30 rounded-full scale-[1.8] blur-xl animate-pulse"></div>
                    <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-full scale-[1.4] animate-[spin_10s_linear_infinite] border-dashed"></div>
                    <div className="absolute inset-0 border border-white/20 rounded-full scale-[1.6] animate-[spin_15s_linear_infinite_reverse] border-dotted"></div>
                    <Sparkles className="absolute -top-4 -right-4 text-yellow-300 animate-bounce" size={20} />
                    <Hourglass className={`${className} text-yellow-400 drop-shadow-[0_0_15px_gold] relative z-10`} />
                </div>
            );
        }

        if (iconName === 'Key' || itemId === 'chest_key') return <Key className={className} />;
        if (iconName === 'Factory') return <Hammer className={className} />;
        if (iconName === 'Search') return <Search className={className} />;
        if (iconName === 'HardHat' || (itemId && itemId.startsWith('hat'))) return <HardHat className={className} />;
        if (iconName === 'Glasses' || (itemId && itemId.startsWith('glasses'))) return <Glasses className={className} />;
        if (iconName === 'Shirt' || (itemId && itemId.startsWith('uniform'))) return <Shirt className={className} />;
        if (iconName === 'Backpack' || (itemId && itemId.startsWith('bag'))) return <Backpack className={className} />;
        if (iconName === 'Footprints' || (itemId && itemId.startsWith('boots'))) return <Footprints className={className} />;
        if (iconName === 'Smartphone' || (itemId && itemId.startsWith('mobile'))) return <Smartphone className={className} />;
        if (iconName === 'Monitor' || (itemId && itemId.startsWith('pc'))) return <Monitor className={className} />;
        if (iconName === 'Bot' || (itemId && itemId.startsWith('robot'))) return <Bot className={className} />;
        if (iconName === 'Truck' || (itemId && itemId === 'auto_excavator')) return <Truck className={className} />;
        if (iconName === 'Zap') return <Zap className={className} />;
        if (iconName === 'Cpu' || itemId === 'upgrade_chip') return <Cpu className={className} />;
        if (iconName === 'Hourglass' || (itemId && itemId.startsWith('hourglass'))) return <Hourglass className={className} />;
        if (iconName === 'Shield' || iconName === 'FileText' || itemId === 'insurance_card') return <FileText className={className} />;
        if (iconName === 'CreditCard' || itemId === 'vip_withdrawal_card') {
            return (
                <div className={`relative ${className.includes('w-') ? className : 'w-full h-full'} aspect-[1.58/1] bg-gradient-to-br from-yellow-100 via-yellow-500 to-yellow-800 rounded-[4px] border border-yellow-200/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center overflow-hidden group/card`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-[20%] left-0 w-full h-[15%] bg-stone-900/40"></div>
                    <div className="absolute top-[45%] left-[10%] w-[15%] h-[20%] bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-sm border border-yellow-100/30"></div>
                    <div className="absolute bottom-[10%] right-[10%] text-[8px] font-black italic text-black/40 tracking-tighter">VIP</div>
                    <CreditCard className="text-yellow-950 w-1/2 h-1/2 relative z-10 drop-shadow-sm opacity-60" />
                </div>
            );
        }

        return <InfinityGlove className={className} />;
    };

    const renderTooltip = (item: typeof SHOP_ITEMS[0]) => {
        if (!item) return null; // Defensive check
        return (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-stone-950 border border-stone-700 rounded-xl shadow-2xl p-3 z-50 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="text-center">
                    <div className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-1">{getItemDisplayName(item)}</div>
                    <div className="text-[10px] text-stone-300 leading-relaxed">{getLocalized(item.description) || t('item_shop.default_desc')}</div>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-950 border-t border-l border-stone-700 transform rotate-45"></div>
            </div>
        );
    };

    const specialIds = ['chest_key', 'mixer', 'magnifying_glass', 'robot', 'upgrade_chip', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'dungeon_ticket_magma', 'ancient_blueprint', 'insurance_card', 'vip_withdrawal_card'];
    const specialItems = SHOP_ITEMS.filter(i => {
        if (!specialIds.includes(i.id) || i.buyable === false) return false;
        // Hide VIP card if already owned
        if (i.id === 'vip_withdrawal_card' && userInventory.some(inv => inv.typeId === 'vip_withdrawal_card')) return false;
        return true;
    });
    const shopEquipment = SHOP_ITEMS.filter(i => !specialIds.includes(i.id) && i.buyable !== false);
    const craftableItems = SHOP_ITEMS.filter(i => i.craftingRecipe);

    const renderItemCard = (item: typeof SHOP_ITEMS[0], isSpecial: boolean = false) => {
        let canAfford = walletBalance >= item.price * (buyQuantities[item.id] || 1);
        const isBuying = buyingId === item.id;

        // Robot Limits check
        let isCooldown = false;
        let cooldownText = '';
        if (item.id === 'robot') {
            const existingRobot = userInventory.find(i => i.typeId === 'robot');
            if (existingRobot) {
                // Check remaining time
                if (existingRobot.expireAt) {
                    const diff = existingRobot.expireAt - Date.now();
                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    if (days > 0) {
                        isCooldown = true;
                        cooldownText = t('item_shop.cooldown', { days });
                        canAfford = false; // Disable buy
                    }
                } else {
                    // Fallback: If no expireAt, assume it's active and on 30 day CD?
                    // But typically our MockDB adds expireAt.
                    isCooldown = true;
                    cooldownText = t('item_shop.active'); // Or 'Active'
                    canAfford = false;
                }
            }
        }

        let bonusRange = '';
        if (item.id === 'chest_key') bonusRange = t('item_shop.chest_key_desc');
        else if (item.id === 'mixer') bonusRange = t('item_shop.mixer_desc');
        else if (item.id === 'magnifying_glass') bonusRange = t('item_shop.lens_desc');
        else if (item.id === 'robot') bonusRange = t('item_shop.robot_desc');
        else if (item.id === 'upgrade_chip') bonusRange = t('item_shop.chip_desc');
        else if (item.id === 'insurance_card') bonusRange = t('item_shop.insurance_desc');
        else if (item.id === 'hourglass_small') bonusRange = '- 30 ' + t('time.minutes');
        else if (item.id === 'hourglass_medium') bonusRange = '- 2 ' + t('time.hours');
        else if (item.id === 'hourglass_large') bonusRange = '- 6 ' + t('time.hours');
        else bonusRange = `${item.minBonus}-${item.maxBonus}`;

        let rarityStyle = RARITY_SETTINGS.COMMON;

        // Define Rarity based on Item ID for clear visual differentiation
        if (item.id === 'hat') rarityStyle = RARITY_SETTINGS.UNCOMMON;
        else if (item.id === 'uniform') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'bag') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
        else if (item.id === 'boots') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'glasses') rarityStyle = RARITY_SETTINGS.LEGENDARY;
        else if (item.id === 'mobile') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
        else if (item.id === 'pc') rarityStyle = RARITY_SETTINGS.MYTHIC;
        else if (item.id === 'auto_excavator') rarityStyle = RARITY_SETTINGS.DIVINE;
        else if (item.id === 'robot') rarityStyle = RARITY_SETTINGS.MYTHIC;
        else if (item.id === 'insurance_card') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
        else if (item.id === 'upgrade_chip') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'mixer') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
        else if (item.id === 'chest_key') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'magnifying_glass') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'hourglass_small') rarityStyle = RARITY_SETTINGS.UNCOMMON;
        else if (item.id === 'hourglass_medium') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'hourglass_large') rarityStyle = RARITY_SETTINGS.LEGENDARY;
        else {
            // Default pricing logic for any other items
            if (item.price >= 500) rarityStyle = RARITY_SETTINGS.LEGENDARY;
            else if (item.price >= 350) rarityStyle = RARITY_SETTINGS.EPIC;
            else if (item.price >= 120) rarityStyle = RARITY_SETTINGS.RARE;
            else if (item.price >= 50) rarityStyle = RARITY_SETTINGS.UNCOMMON;
        }

        const isBulkItem = ['upgrade_chip', 'mixer', 'insurance_card', 'hourglass_small', 'hourglass_medium', 'hourglass_large'].includes(item.id);

        const isVipCard = item.id === 'vip_withdrawal_card';

        return (
            <div key={item.id} className={`group relative bg-stone-900/80 border ${isVipCard ? 'rainbow-border' : rarityStyle.border} rounded-xl overflow-visible shadow-lg transition-all duration-300 sm:hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(0,0,0,0.5)] flex flex-col ${isSpecial ? 'h-full' : ''}`}>

                <div className={`h-1 w-full bg-gradient-to-r ${rarityStyle.bgGradient} rounded-t-xl`}></div>

                <div className={`flex items-center justify-center relative overflow-visible bg-stone-950/50 ${isSpecial ? 'p-6' : 'p-8'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${rarityStyle.bgGradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-t-xl`}></div>

                    <div className={`group/icon relative rounded-full border-2 ${rarityStyle.border} bg-stone-900 flex items-center justify-center shadow-inner z-10 group-hover:scale-110 transition-transform duration-500 cursor-help ${isSpecial ? 'w-20 h-20' : 'w-24 h-24'}`}>
                        {getIcon(item.icon, `${isSpecial ? 'w-10 h-10' : 'w-12 h-12'} ${rarityStyle.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`, item.id)}
                        {renderTooltip(item)}
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col items-center text-center border-t border-stone-800">
                    <h3 className={`font-display font-bold text-lg mb-1 text-white`}>{getItemDisplayName(item)}</h3>

                    <div className="text-xs text-stone-400 mb-1 flex flex-col items-center gap-1">
                        {item.id === 'robot' ? (
                            <>
                                <span className="text-emerald-400 font-bold uppercase tracking-wider italic mb-1 flex items-center gap-1">
                                    <Bot size={14} /> Automation Active
                                </span>
                                <ul className="text-[10px] text-stone-500 text-left space-y-0.5 list-disc list-inside bg-stone-900/50 p-2 rounded-lg border border-stone-800/50">
                                    <li>เก็บของขวัญอัตโนมัติ (Auto-collect)</li>
                                    <li>เติมพลังงานอัตโนมัติ (Auto-refill)</li>
                                    <li>ซ่อมแซมอัตโนมัติ (Auto-repair)</li>
                                    <li>แจ้งเตือนราคาตลาด (Market alerts)</li>
                                </ul>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-1">
                                {(item.id === 'insurance_card' || item.id.includes('hourglass') || item.id === 'upgrade_chip' || item.id === 'chest_key' || item.id === 'mixer' || item.id === 'magnifying_glass' || item.id === 'repair_kit') ? (
                                    <span className="text-stone-500 font-medium">{t('item_shop.consumable')}</span>
                                ) : (
                                    <>
                                        <CalendarDays size={12} className="text-stone-500" />
                                        {item.lifespanDays > 0 ?
                                            (language === 'th' ? `อายุการใช้งาน ${item.lifespanDays} วัน` : `Lifespan: ${item.lifespanDays} Days`)
                                            : (language === 'th' ? 'ถาวร' : 'Permanent')}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mb-2 mt-2">
                        {['chest_key', 'mixer', 'magnifying_glass', 'upgrade_chip', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'insurance_card', 'robot', 'vip_withdrawal_card'].includes(item.id) ? (
                            <div className="text-[9px] text-stone-400 flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                                {['robot', 'vip_withdrawal_card'].includes(item.id) ? <Zap size={10} className="text-emerald-400" /> : <Zap size={10} className="text-yellow-500" />}
                                {item.id === 'robot' ? t('item_shop.automation_system') : isVipCard ? (language === 'th' ? 'ปลดล็อกถาวร' : 'Permanent Unlock') : t('item_shop.consumable')}
                            </div>
                        ) : (
                            <div className="text-[9px] text-yellow-500 flex items-center gap-1 bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-900/30">
                                <Star size={10} /> {t('item_shop.bonus')}: {formatBonus(item.maxBonus, item.id)} / {t('time.day')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 pt-0">
                    {/* Only show quantity for special bulk items, hide for equipment and robot */}
                    {isSpecial && item.id !== 'robot' && (
                        <div className="flex items-center justify-between mb-3 bg-stone-950 p-1 rounded-lg border border-stone-800">
                            <button onClick={() => handleQuantityChange(item.id, -1)} className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors">-</button>
                            <span className="font-mono font-bold text-white text-sm">{buyQuantities[item.id] || 1}</span>
                            <button onClick={() => handleQuantityChange(item.id, 1)} className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors">+</button>
                        </div>
                    )}

                    {isBulkItem && (
                        <div className="flex gap-1 mb-3 justify-center">
                            <button onClick={() => setQuantity(item.id, 10)} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[10px] text-stone-400 hover:text-white border border-stone-700">x10</button>
                            <button onClick={() => setQuantity(item.id, 50)} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[10px] text-stone-400 hover:text-white border border-stone-700">x50</button>
                        </div>
                    )}

                    <button
                        onClick={() => handleBuyClick(item.id, item.price, getItemDisplayName(item))}
                        disabled={!canAfford || isBuying || isCooldown}
                        className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
                        ${isBuying ? 'bg-stone-700 text-stone-400 cursor-wait' :
                                isCooldown ? 'bg-red-900/20 text-red-500 border border-red-900 cursor-not-allowed' :
                                    canAfford
                                        ? `bg-gradient-to-r from-stone-800 to-stone-700 hover:from-yellow-700 hover:to-yellow-600 border border-stone-600 hover:border-yellow-500 text-white shadow-lg`
                                        : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed opacity-70'
                            }
                    `}
                    >
                        {isBuying ? t('common.loading') : isCooldown ? cooldownText : (
                            <>
                                <span>{formatCurrency(item.price * (buyQuantities[item.id] || 1))}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderConfirmationModal = () => {
        if (!confirmItem) return null;
        const total = confirmItem.price * confirmItem.quantity;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-stone-900 border-2 border-yellow-600/50 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-stone-900/50 pointer-events-none"></div>

                    <h3 className="text-2xl font-black text-white text-center uppercase tracking-wider mb-2 font-display">
                        {t('item_shop.confirm_title')}
                    </h3>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mb-6"></div>

                    <div className="space-y-4 mb-8">
                        <div className="bg-stone-950/80 rounded-xl p-4 border border-stone-800 flex items-center gap-4">
                            <div className="w-16 h-16 bg-stone-900 rounded-lg flex items-center justify-center border border-stone-700">
                                {getIcon(SHOP_ITEMS.find(i => i.id === confirmItem.id)?.icon || 'Box', "w-8 h-8 text-yellow-500", confirmItem.id)}
                            </div>
                            <div>
                                <div className="text-stone-400 text-xs uppercase tracking-widest font-bold">{t('item_shop.product')}</div>
                                <div className="text-white font-bold text-lg">{getItemDisplayName(confirmItem)}</div>
                                <div className="text-stone-500 text-xs">x{confirmItem.quantity} {t('item_shop.quantity')}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end bg-stone-950/50 p-4 rounded-xl border border-stone-800">
                            <div className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-1">{t('item_shop.total_price')}</div>
                            <div className="text-yellow-400 font-mono font-bold text-2xl flex items-baseline gap-1">
                                {formatCurrency(total)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setConfirmItem(null)}
                            className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold uppercase tracking-wider rounded-xl transition-colors border border-stone-700"
                        >
                            {t('item_shop.confirm_cancel')}
                        </button>
                        <button
                            onClick={handleConfirmBuy}
                            className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] border border-yellow-500"
                        >
                            {t('item_shop.confirm_buy')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCraftCard = (item: typeof SHOP_ITEMS[0]) => {
        if (!item.craftingRecipe) return null;

        const fee = item.craftingFee || 0;
        const canAffordFee = walletBalance >= fee;

        let hasAllMats = true;
        const matsList = Object.entries(item.craftingRecipe).map(([tierStr, needed]) => {
            const tier = parseInt(tierStr);
            const owned = userMaterials[tier] || 0;
            if (owned < needed) hasAllMats = false;
            return { tier, needed, owned };
        });

        const canCraft = canAffordFee && hasAllMats;

        let rarityStyle = RARITY_SETTINGS.COMMON;
        if (item.id === 'hat') rarityStyle = RARITY_SETTINGS.UNCOMMON;
        else if (item.id === 'uniform') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'bag') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
        else if (item.id === 'boots') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'glasses') rarityStyle = RARITY_SETTINGS.LEGENDARY;
        else if (item.id === 'mobile') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
        else if (item.id === 'pc') rarityStyle = RARITY_SETTINGS.MYTHIC;
        else if (item.id === 'auto_excavator') rarityStyle = RARITY_SETTINGS.DIVINE;
        else {
            if (item.price >= 500) rarityStyle = RARITY_SETTINGS.LEGENDARY;
            else if (item.price >= 350) rarityStyle = RARITY_SETTINGS.EPIC;
            else if (item.price >= 200) rarityStyle = RARITY_SETTINGS.RARE;
            else if (item.price >= 50) rarityStyle = RARITY_SETTINGS.UNCOMMON;
        }

        return (
            <div key={item.id} className={`bg-stone-900 border ${rarityStyle.border} rounded-xl overflow-hidden flex flex-col gap-4 relative shadow-lg`}>
                <div className={`h-1 w-full bg-gradient-to-r ${rarityStyle.bgGradient}`}></div>
                <div className="p-4 flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className={`group/icon relative w-16 h-16 rounded-lg border-2 ${rarityStyle.border} bg-stone-950 flex items-center justify-center shrink-0 cursor-help`}>
                            {getIcon(item.icon, `w-8 h-8 ${rarityStyle.color}`, item.id)}
                            {renderTooltip(item)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h3 className="text-base font-bold text-white leading-tight">{getItemDisplayName(item)}</h3>
                                    {item.lifespanDays && (
                                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-0.5">
                                            <Star size={10} />
                                            <span>{t('item_shop.bonus')}: {formatBonus(item.maxBonus, item.id)} / {t('time.day')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-blue-500/30 flex flex-col items-end leading-none gap-0.5">
                                    <span className="flex items-center gap-1"><Clock size={10} /> {item.craftDurationMinutes ? item.craftDurationMinutes / 60 : 0} ชม.</span>
                                </div>
                            </div>
                            <div className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                <CalendarDays size={12} className="text-stone-500" />
                                {item.lifespanDays > 0 ?
                                    (language === 'th' ? `อายุการใช้งาน ${item.lifespanDays} วัน` : `Lifespan: ${item.lifespanDays} Days`)
                                    : (language === 'th' ? 'ถาวร' : 'Permanent')}
                            </div>
                            {item.specialEffect && (
                                <div className="text-[10px] text-emerald-400 mt-1 font-bold">
                                    {getLocalized(item.specialEffect)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800 flex justify-between text-[10px]">
                        <span className="text-stone-400">Success: <span className="text-white font-bold">90%</span></span>
                        <span className="text-yellow-600">Great Success: <span className="text-yellow-400 font-bold animate-pulse">10%</span></span>
                    </div>

                    <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-2">
                        <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">{t('item_shop.materials_required')}</div>
                        <div className="grid grid-cols-2 gap-2">
                            {matsList.map((m, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-stone-900 p-1.5 rounded">
                                    <div className="flex items-center gap-2">
                                        <MaterialIcon id={m.tier} size="w-4 h-4" iconSize={12} />
                                        <span className="text-stone-300">{getLocalized(MATERIAL_CONFIG.NAMES[m.tier as keyof typeof MATERIAL_CONFIG.NAMES])}</span>
                                    </div>
                                    <span className={m.owned >= m.needed ? 'text-green-400' : 'text-red-400'}>
                                        {m.owned}/{m.needed}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between text-xs bg-stone-900 p-1.5 rounded col-span-2">
                                <div className="flex items-center gap-2">
                                    <Coins size={14} className="text-yellow-500" />
                                    <span className="text-stone-300">{t('item_shop.fee')}</span>
                                </div>
                                <span className={canAffordFee ? 'text-green-400' : 'text-red-400'}>
                                    {formatCurrency(fee)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleStartCraft(item.id)}
                        disabled={!canCraft}
                        className={`w-full py-2.5 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all
                      ${canCraft ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg' : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'}
                  `}
                    >
                        <Hammer size={16} /> {t('item_shop.start_craft')}
                    </button>
                </div>
            </div>
        );
    };

    const renderQueue = () => {
        // Defensive check: ensure craftingQueue is an array
        if (!craftingQueue || !Array.isArray(craftingQueue) || craftingQueue.length === 0) return (
            <div className="text-center py-8 text-stone-500 text-sm border-2 border-dashed border-stone-800 rounded-xl">
                {t('item_shop.no_active_tasks')}
            </div>
        );

        return (
            <div className="space-y-3 mb-6">
                <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t('item_shop.crafting_status', { count: craftingQueue.length })}</h4>
                {craftingQueue.map(q => {
                    const item = SHOP_ITEMS.find(i => i.id === q.itemId);
                    if (!item) return null;

                    const now = Date.now();
                    const totalTime = q.finishAt - q.startedAt;
                    const elapsed = now - q.startedAt;
                    const progress = Math.min(100, (elapsed / totalTime) * 100);
                    const isReady = now >= q.finishAt;
                    const timeLeft = Math.max(0, q.finishAt - now);
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    let rarityStyle = RARITY_SETTINGS.COMMON;
                    if (item.id === 'hat') rarityStyle = RARITY_SETTINGS.UNCOMMON;
                    else if (item.id === 'uniform') rarityStyle = RARITY_SETTINGS.RARE;
                    else if (item.id === 'bag') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
                    else if (item.id === 'boots') rarityStyle = RARITY_SETTINGS.EPIC;
                    else if (item.id === 'glasses') rarityStyle = RARITY_SETTINGS.LEGENDARY;
                    else if (item.id === 'mobile') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
                    else if (item.id === 'pc') rarityStyle = RARITY_SETTINGS.MYTHIC;
                    else if (item.id === 'auto_excavator') rarityStyle = RARITY_SETTINGS.MYTHIC;

                    return (
                        <div key={q.id} className="bg-stone-900 border border-stone-700 p-3 rounded-lg flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-stone-800 z-0" style={{ width: `${progress}%`, transition: 'width 1s linear', opacity: 0.2 }}></div>

                            <div className={`relative z-10 w-10 h-10 bg-stone-950 rounded flex items-center justify-center border ${rarityStyle.border}`}>
                                {getIcon(item.icon, `w-6 h-6 ${rarityStyle.color}`, item.id)}
                            </div>

                            <div className="relative z-10 flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-stone-200 text-sm">{getItemDisplayName(item)}</span>
                                    {isReady ? (
                                        <span className="text-green-400 text-xs font-bold animate-pulse">{t('item_shop.complete')}</span>
                                    ) : (
                                        <span className="text-stone-500 text-xs font-mono">{hours}h {mins}m</span>
                                    )}
                                </div>
                                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                                    <div className={`h-full ${isReady ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                {isReady ? (
                                    <button onClick={() => handleClaimCraft(q.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg animate-bounce">
                                        <Star size={12} /> {t('item_shop.claim_item')}
                                    </button>
                                ) : (
                                    <div className="text-xs text-stone-500 font-mono"><Clock size={14} className="animate-spin-slow" /></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-yellow-900/50 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b border-stone-800 shrink-0">
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-600/20 p-2 rounded-xl border border-yellow-600/50 text-yellow-500">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-white">{t('item_shop.title')}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex bg-stone-900 px-4 py-2 rounded-lg border border-stone-700 items-center gap-2">
                                <Coins size={18} className="text-emerald-500" />
                                <span className="font-mono font-bold text-emerald-400">{formatCurrency(walletBalance)}</span>
                            </div>
                            <button onClick={onClose} className="text-stone-500 hover:text-white bg-stone-900 p-2 rounded-full hover:bg-stone-800"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="flex px-4 gap-4">
                        <button
                            onClick={() => setActiveTab('SHOP')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'SHOP' ? 'text-yellow-500 border-yellow-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <ShoppingBag size={16} /> {t('item_shop.items_tab')}
                        </button>
                        <button
                            onClick={() => setActiveTab('WORKSHOP')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'WORKSHOP' ? 'text-orange-500 border-orange-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <Hammer size={16} /> {t('item_shop.workshop_tab')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pb-24 sm:pb-6">
                    {activeTab === 'SHOP' ? (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="text-yellow-500" size={20} />
                                    <h3 className="text-lg font-bold text-stone-200 uppercase tracking-wider">{t('item_shop.recommended')}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {specialItems.map(item => renderItemCard(item, true))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full">
                            {renderQueue()}
                            <div className="flex items-center gap-2 mb-4">
                                <Hammer className="text-orange-500" size={20} />
                                <h3 className="text-lg font-bold text-stone-200 uppercase tracking-wider">{t('item_shop.workshop_tab')}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {craftableItems.map(item => renderCraftCard(item))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CRAFTING SUCCESS MODAL */}
            {claimedItem && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-stone-900 border border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center relative overflow-hidden">

                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                        <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-yellow-500/20 blur-[50px] rounded-full"></div>

                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-6 drop-shadow-md tracking-wider">{t('item_shop.craft_success_title')}</h2>

                        <div className="w-32 h-32 bg-stone-950 rounded-full border-4 border-yellow-600/50 flex items-center justify-center mb-6 shadow-inner relative group">
                            <div className="absolute inset-0 bg-yellow-500/10 rounded-full animate-pulse"></div>
                            {getIcon(SHOP_ITEMS.find(i => i.id === claimedItem.typeId)?.icon || 'Box', "w-16 h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]", claimedItem.typeId)}
                            <Sparkles className="absolute top-0 right-0 text-yellow-200 animate-bounce" />
                        </div>

                        <div className="text-center mb-6 w-full">
                            <h3 className="text-xl font-bold text-white mb-2">{getItemDisplayName(claimedItem)}</h3>
                            <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase mb-4 border ${RARITY_SETTINGS.RARE.border} ${RARITY_SETTINGS.RARE.color} bg-stone-900`}>
                                {t('item_shop.obtained_label')}
                            </div>

                            <div className="bg-stone-950/50 rounded-xl p-4 space-y-3 border border-stone-800 text-sm w-full">
                                <div className="flex justify-between items-center text-stone-400">
                                    <span>{t('item_shop.bonus_info')}</span>
                                    <span className="text-yellow-400 font-bold">{formatBonus(claimedItem.dailyBonus || 0, claimedItem.typeId)}/{t('time.day')}</span>
                                </div>
                                <div className="flex justify-between items-center text-stone-400">
                                    <span>{t('item_shop.status_label')}</span>
                                    <span className="text-white font-bold">{t('item_shop.success_status')}</span>
                                </div>
                                {claimedItem.specialEffect && (
                                    <div className="pt-2 border-t border-stone-800 text-xs text-emerald-400 text-center font-bold">
                                        {t('item_shop.property_label')}: {claimedItem.specialEffect}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setClaimedItem(null)}
                            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-stone-900 font-bold rounded-xl shadow-lg transform hover:-translate-y-1 transition-all"
                        >
                            {t('item_shop.equip_action')}
                        </button>
                    </div>
                </div>
            )}
            {/* CONFIRMATION POPUP */}
            {renderConfirmationModal()}
        </div>
    );
};
