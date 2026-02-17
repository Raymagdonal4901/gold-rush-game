
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Coins, Zap, Clock, CalendarDays, Key, Star, Factory, Search, Truck, Cpu, Hammer, Timer, ArrowRight, ChevronRight, Hourglass, Sparkles, FileText, Fan, Wifi, Server, Grid, BoxSelect, Briefcase, CreditCard, Ticket, Shield, Wrench, Settings, StarHalf, Pickaxe, AlertCircle, TrainFront, Info, Clover, Flame } from 'lucide-react';
import { AccessoryIcon } from './AccessoryIcon';
import { SHOP_ITEMS, CURRENCY, RARITY_SETTINGS, MATERIAL_CONFIG, EQUIPMENT_SERIES, REPAIR_KITS, RIG_PRESETS, MINING_VOLATILITY_CONFIG } from '../constants';
import { CraftingQueueItem } from '../services/types';
import { MaterialIcon } from './MaterialIcon';
import { PixelProgressBar } from './PixelProgressBar';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

interface AccessoryShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletBalance: number;
    onBuy: (itemId: string) => void;
    onBuyRig?: (preset: any) => void;
    onRefresh?: () => void;
    addNotification?: (n: any) => void;
    userId?: string;
    currentRigCount?: number;
    maxRigs?: number;
    materials?: Record<number, number>;
    inventory?: any[];
    rigs?: any[];
}

export const AccessoryShopModal: React.FC<AccessoryShopModalProps> = ({
    isOpen, onClose, walletBalance, onBuy, onBuyRig, onRefresh, addNotification, userId,
    currentRigCount = 0, maxRigs = 3, materials = {}, inventory = [], rigs = []
}) => {
    const { t, getLocalized, formatCurrency, language, formatBonus } = useTranslation();
    const [activeTab, setActiveTab] = useState<'RIGS' | 'SHOP' | 'WORKSHOP' | 'REPAIR' | 'UPGRADE'>('RIGS');
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [upgradeTargetId, setUpgradeTargetId] = useState<string | null>(null);
    const [upgradeMaterialId, setUpgradeMaterialId] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [confirmItem, setConfirmItem] = useState<{ id: string, price: number, quantity: number, name: string } | null>(null);

    const [craftingQueue, setCraftingQueue] = useState<CraftingQueueItem[]>([]);
    const [userMaterials, setUserMaterials] = useState<Record<number, number>>({});
    const [userInventory, setUserInventory] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({});
    const [claimedItem, setClaimedItem] = useState<any>(null);
    const [purchasedItem, setPurchasedItem] = useState<any>(null);
    const [userMiningSlots, setUserMiningSlots] = useState(3);


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
                setUserMiningSlots(user.warehouseCapacity || user.miningSlots || 3);
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
            try {
                let lastItem = null;
                for (let i = 0; i < quantity; i++) {
                    lastItem = await onBuy(id);
                }
                setBuyingId(null);
                setBuyQuantities(prev => ({ ...prev, [id]: 1 }));
                setRefreshTrigger(prev => prev + 1);
                setPurchasedItem(lastItem);
            } catch (err) {
                setBuyingId(null);
            }
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

    const handleUseSkip = async (queueId: string, itemTypeId: string) => {
        try {
            const result = await api.crafting.useSkip(queueId, itemTypeId);
            if (result.success) {
                setCraftingQueue(result.queue || []);
                setUserInventory(result.inventory || []);
                setRefreshTrigger(prev => prev + 1);
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: userId || '',
                    message: result.message || 'ใช้ไอเทมสำเร็จ',
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
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

    const specialIds = ['chest_key', 'mixer', 'magnifying_glass', 'upgrade_chip', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'dungeon_ticket_magma', 'ancient_blueprint', 'insurance_card', 'vip_withdrawal_card', 'time_skip_ticket', 'construction_nanobot', 'ai_robot'];
    const specialItems = SHOP_ITEMS.filter(i => {
        if (!specialIds.includes(i.id) || i.buyable === false) return false;
        // Hide VIP card if already owned
        if (i.id === 'vip_withdrawal_card' && userInventory.some(inv => inv.typeId === i.id)) return false;
        return true;
    });
    const shopEquipment = SHOP_ITEMS.filter(i => !specialIds.includes(i.id) && i.buyable !== false);
    const craftableItems = SHOP_ITEMS.filter(i => i.craftingRecipe && i.id !== 'magnifying_glass');

    const renderItemCard = (item: typeof SHOP_ITEMS[0], isSpecial: boolean = false) => {
        let canAfford = walletBalance >= item.price * (buyQuantities[item.id] || 1);
        const isBuying = buyingId === item.id;

        // Robot Limits check
        let isCooldown = false;
        let cooldownText = '';

        let bonusRange = '';
        if (item.id === 'chest_key') bonusRange = t('item_shop.chest_key_desc');
        else if (item.id === 'mixer') bonusRange = t('item_shop.mixer_desc');
        else if (item.id === 'magnifying_glass') bonusRange = t('item_shop.lens_desc');
        else if (item.id === 'upgrade_chip') bonusRange = t('item_shop.chip_desc');
        else if (item.id === 'insurance_card') bonusRange = t('item_shop.insurance_desc');
        else if (item.id === 'hourglass_small') bonusRange = '- 30 ' + t('time.minutes');
        else if (item.id === 'hourglass_medium') bonusRange = '- 2 ' + t('time.hours');
        else if (item.id === 'hourglass_large') bonusRange = '- 6 ' + t('time.hours');
        else bonusRange = `${item.minBonus}-${item.maxBonus}`;

        let rarityStyle = RARITY_SETTINGS.COMMON;

        // Define Rarity based on Item ID for clear visual differentiation
        if (item.id === 'uniform') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'bag') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
        else if (item.id === 'boots') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'glasses') rarityStyle = RARITY_SETTINGS.LEGENDARY;
        else if (item.id === 'mobile') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
        else if (item.id === 'pc') rarityStyle = RARITY_SETTINGS.MYTHIC;
        else if (item.id === 'auto_excavator') rarityStyle = RARITY_SETTINGS.DIVINE;
        else if (item.id === 'insurance_card') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
        else if (item.id === 'upgrade_chip') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'mixer') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
        else if (item.id === 'chest_key') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'magnifying_glass') rarityStyle = RARITY_SETTINGS.RARE;
        else if (item.id === 'hourglass_small') rarityStyle = RARITY_SETTINGS.UNCOMMON;
        else if (item.id === 'hourglass_medium') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (item.id === 'hourglass_large') rarityStyle = RARITY_SETTINGS.LEGENDARY;
        else if (item.id === 'time_skip_ticket') rarityStyle = RARITY_SETTINGS.UNCOMMON;
        else if (item.id === 'construction_nanobot') rarityStyle = RARITY_SETTINGS.EPIC;
        else {
            // Default pricing logic for any other items
            if (item.price >= 500) rarityStyle = RARITY_SETTINGS.LEGENDARY;
            else if (item.price >= 350) rarityStyle = RARITY_SETTINGS.EPIC;
            else if (item.price >= 120) rarityStyle = RARITY_SETTINGS.RARE;
            else if (item.price >= 50) rarityStyle = RARITY_SETTINGS.UNCOMMON;
        }

        const isBulkItem = ['upgrade_chip', 'mixer', 'insurance_card', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'time_skip_ticket', 'construction_nanobot', 'magnifying_glass', 'chest_key'].includes(item.id);

        const isVipCard = item.id === 'vip_withdrawal_card';

        return (
            <div key={item.id} className={`group relative bg-stone-900/80 border ${isVipCard ? 'rainbow-border' : rarityStyle.border} rounded-xl overflow-visible shadow-lg transition-all duration-300 sm:hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(0,0,0,0.5)] flex flex-col ${isSpecial ? 'h-full' : ''}`}>

                <div className={`h-1 w-full bg-gradient-to-r ${rarityStyle.bgGradient} rounded-t-xl`}></div>

                <div className={`flex items-center justify-center relative overflow-visible bg-stone-950/50 ${isSpecial ? 'p-3' : 'p-4'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${rarityStyle.bgGradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-t-xl`}></div>

                    <div className={`group/icon relative rounded-full border-2 ${rarityStyle.border} bg-stone-900 flex items-center justify-center shadow-inner z-10 group-hover:scale-110 transition-transform duration-500 cursor-help ${isSpecial ? 'w-16 h-16' : 'w-20 h-20'}`}>
                        <AccessoryIcon item={{ typeId: item.id, name: item.name }} size={isSpecial ? 32 : 40} />
                        {renderTooltip(item)}
                    </div>
                </div>

                <div className="p-3 flex-1 flex flex-col items-center text-center border-t border-stone-800">
                    <h3 className={`font-display font-bold text-sm sm:text-lg mb-1 text-white truncate w-full px-1`}>{getItemDisplayName(item)}</h3>

                    <div className="text-xs text-stone-400 mb-1 flex flex-col items-center gap-1">
                        {item.id === 'NOT_A_ROBOT' ? (
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
                                {(item.id === 'insurance_card' || item.id.includes('hourglass') || item.id === 'upgrade_chip' || item.id === 'chest_key' || item.id === 'mixer' || item.id === 'magnifying_glass' || item.id === 'repair_kit' || item.id === 'time_skip_ticket' || item.id === 'construction_nanobot' || item.id === 'ai_robot') ? (
                                    <span className="text-stone-500 font-medium h-4">
                                        {item.id === 'ai_robot' ? '' : getLocalized(item.description)}
                                    </span>
                                ) : (
                                    <div className="w-full px-2">
                                        {(item as any).maxDurability > 0 ? (
                                            <PixelProgressBar
                                                current={(item as any).maxDurability}
                                                max={(item as any).maxDurability}
                                                showValue={true}
                                                label={language === 'th' ? 'ความทนทาน' : 'Durability'}
                                                icon={<Shield size={12} className="text-emerald-500" />}
                                                className="w-full"
                                                color="green"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center gap-1 text-xs text-stone-400">
                                                <CalendarDays size={12} className="text-stone-500" />
                                                <span>{language === 'th' ? 'ถาวร' : 'Permanent'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mb-2 mt-2">
                        {item.id === 'ai_robot' ? null : (['chest_key', 'mixer', 'magnifying_glass', 'upgrade_chip', 'hourglass_small', 'hourglass_medium', 'hourglass_large', 'insurance_card', 'vip_withdrawal_card', 'time_skip_ticket', 'construction_nanobot'].includes(item.id) ? (
                            <div className="text-[9px] text-stone-400 flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                                {item.id === 'vip_withdrawal_card' ? <Zap size={10} className="text-emerald-400" /> : <Zap size={10} className="text-yellow-500" />}
                                {item.id === 'NOT_A_ROBOT'
                                    ? t('item_shop.automation_system')
                                    : isVipCard
                                        ? (language === 'th' ? 'ปลดล็อกถาวร' : 'Permanent Unlock')
                                        : (['time_skip_ticket', 'construction_nanobot'].includes(item.id))
                                            ? (language === 'th' ? 'เร่งเวลาสร้างอุปกรณ์' : 'Accelerate Crafting')
                                            : item.id.includes('hourglass')
                                                ? (language === 'th' ? 'ใช้ลงเหมืองลับ' : 'Use in Secret Mine')
                                                : t('item_shop.consumable')}
                            </div>
                        ) : (
                            <div className="text-[9px] text-yellow-500 flex items-center gap-1 bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-900/30">
                                <Star size={10} /> {t('item_shop.bonus')}: {formatBonus(item.maxBonus, item.id)} / {t('time.day')}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 pt-0">
                    {/* Only show quantity for special bulk items, hide for equipment and robot */}
                    {isSpecial && item.id !== 'ai_robot' && (
                        <div className="flex items-center justify-between mb-2 bg-stone-950 p-0.5 rounded-lg border border-stone-800">
                            <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1.5 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors">-</button>
                            <span className="font-mono font-bold text-white text-xs">{buyQuantities[item.id] || 1}</span>
                            <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1.5 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors">+</button>
                        </div>
                    )}

                    {isBulkItem && (
                        <div className="flex gap-1 mb-2 justify-center">
                            <button onClick={() => setQuantity(item.id, 10)} className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] text-stone-400 hover:text-white border border-stone-700">x10</button>
                            <button onClick={() => setQuantity(item.id, 50)} className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] text-stone-400 hover:text-white border border-stone-700">x50</button>
                        </div>
                    )}

                    {(() => {
                        const existingBot = item.id === 'ai_robot' ? inventory?.find((i: any) => i.typeId === 'ai_robot' && (!i.expireAt || i.expireAt > Date.now())) : null;
                        const isOwned = !!existingBot;

                        let buttonText: React.ReactNode = formatCurrency(item.price * (buyQuantities[item.id] || 1));
                        if (isOwned && existingBot) {
                            const remainingMs = existingBot.expireAt ? existingBot.expireAt - Date.now() : 0;
                            const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                            buttonText = language === 'th' ? `ครอบครองแล้ว: ${remainingDays} ว.` : `Owned: ${remainingDays} d.`;
                        }

                        return (
                            <button
                                onClick={() => handleBuyClick(item.id, item.price, getItemDisplayName(item))}
                                disabled={!canAfford || isBuying || isCooldown || isOwned}
                                className={`w-full py-2 rounded-lg font-bold uppercase tracking-wider text-[11px] sm:text-xs flex items-center justify-center gap-2 transition-all
                                ${isBuying ? 'bg-stone-700 text-stone-400 cursor-wait' :
                                        isCooldown ? 'bg-red-900/20 text-red-500 border border-red-900 cursor-not-allowed' :
                                            isOwned ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed' :
                                                canAfford
                                                    ? `bg-gradient-to-r from-stone-800 to-stone-700 hover:from-yellow-700 hover:to-yellow-600 border border-stone-600 hover:border-yellow-500 text-white shadow-lg`
                                                    : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed opacity-70'
                                    }
                            `}
                            >
                                {isBuying ? t('common.loading') : isCooldown ? cooldownText : buttonText}
                            </button>
                        );
                    })()}
                </div>
            </div >
        );
    };

    const renderConfirmationModal = () => {
        if (!confirmItem) return null;
        const total = confirmItem.price * confirmItem.quantity;
        const shopItem = SHOP_ITEMS.find(i => i.id === confirmItem.id);

        let rarityStyle = RARITY_SETTINGS.COMMON;
        if (shopItem?.id === 'uniform') rarityStyle = RARITY_SETTINGS.RARE;
        else if (shopItem?.id === 'bag') rarityStyle = RARITY_SETTINGS.SUPER_RARE;
        else if (shopItem?.id === 'boots') rarityStyle = RARITY_SETTINGS.EPIC;
        else if (shopItem?.id === 'glasses') rarityStyle = RARITY_SETTINGS.LEGENDARY;
        else if (shopItem?.id === 'mobile') rarityStyle = RARITY_SETTINGS.ULTRA_LEGENDARY;
        else if (shopItem?.id === 'pc') rarityStyle = RARITY_SETTINGS.MYTHIC;
        else if (shopItem?.id === 'auto_excavator') rarityStyle = RARITY_SETTINGS.DIVINE;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="relative w-full max-w-md">
                    {/* Animated Background Glow */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${rarityStyle.bgGradient} opacity-20 blur-2xl animate-pulse`}></div>

                    <div className="relative bg-stone-900 border border-stone-700/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        {/* Header Section */}
                        <div className={`h-2 w-full bg-gradient-to-r ${rarityStyle.bgGradient}`}></div>

                        <div className="p-8">
                            <h3 className="text-3xl font-black text-white text-center uppercase tracking-[0.2em] mb-6 font-display italic">
                                {language === 'th' ? 'ยืนยันการซื้อไอเทม' : (t('item_shop.confirm_purchase') || 'CONFIRM PURCHASE')}
                            </h3>

                            <div className="flex flex-col items-center gap-6 mb-8">
                                {/* Item Preview */}
                                <div className="relative group">
                                    <div className={`absolute -inset-4 bg-gradient-to-r ${rarityStyle.bgGradient} opacity-30 blur-xl group-hover:opacity-50 transition-opacity`}></div>
                                    <div className={`relative w-32 h-32 bg-stone-950 rounded-2xl border-2 ${rarityStyle.border} flex items-center justify-center shadow-2xl overflow-hidden`}>
                                        <div className={`absolute inset-0 bg-gradient-to-b ${rarityStyle.bgGradient} opacity-10`}></div>
                                        <AccessoryIcon item={{ typeId: confirmItem.id, name: shopItem?.name || confirmItem.id }} size={64} />
                                    </div>
                                </div>

                                <div className="text-center">
                                    {shopItem?.id !== 'ai_robot' && (
                                        <div className={`text-xs font-black uppercase tracking-[0.3em] ${rarityStyle.color} mb-1 animate-pulse`}>
                                            {shopItem?.id === 'auto_excavator' ? 'DIVINE ARTIFACT' : rarityStyle.color.replace('text-', '').replace('-', ' ').toUpperCase()}
                                        </div>
                                    )}
                                    <h4 className="text-2xl font-bold text-white mb-2">{getItemDisplayName(confirmItem)}</h4>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="px-3 py-1 bg-stone-800 rounded-full border border-stone-700 text-stone-400 text-xs font-bold">
                                            {t('item_shop.quantity')}: <span className="text-white">x{confirmItem.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between items-center px-4 py-3 bg-stone-950/50 rounded-xl border border-stone-800/50">
                                    <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">{t('item_shop.price_per_unit')}</span>
                                    <span className="text-stone-200 font-mono font-bold">{formatCurrency(confirmItem.price)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-4 bg-stone-950 rounded-xl border border-yellow-500/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
                                    <span className="text-yellow-600/80 text-xs font-black uppercase tracking-widest">{t('item_shop.total_payment')}</span>
                                    <div className="text-yellow-400 font-mono font-black text-2xl flex items-baseline gap-1">
                                        {formatCurrency(total)}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setConfirmItem(null)}
                                    className="py-4 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white font-black uppercase tracking-widest rounded-xl transition-all border border-stone-700 text-xs"
                                >
                                    {t('common.cancel') || 'CANCEL'}
                                </button>
                                <button
                                    onClick={handleConfirmBuy}
                                    className="py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-stone-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] border border-yellow-400 text-xs"
                                >
                                    {t('common.confirm') || 'CONFIRM'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSuccessModal = () => {
        if (!purchasedItem) return null;

        const shopItem = SHOP_ITEMS.find(i => i.id === purchasedItem.typeId);
        let rarityStyle = RARITY_SETTINGS.COMMON;
        if (purchasedItem.rarity && RARITY_SETTINGS[purchasedItem.rarity]) {
            rarityStyle = RARITY_SETTINGS[purchasedItem.rarity];
        }

        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in zoom-in duration-500">
                {/* Background Particle Effects (CSS only) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 rounded-full ${rarityStyle.bgGradient.split(' ')[1]} opacity-40 animate-bounce`}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>

                <div className="relative w-full max-w-sm">
                    {/* Main Success Card */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${rarityStyle.bgGradient} rounded-[2rem] blur-xl opacity-50 animate-pulse`}></div>

                    <div className="relative bg-stone-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className={`h-24 bg-gradient-to-b ${rarityStyle.bgGradient} flex items-center justify-center relative`}>
                            <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"></div>
                            <Sparkles className="text-white relative z-10 animate-spin-slow" size={48} />
                        </div>

                        <div className="p-8 pt-0 -mt-10 flex flex-col items-center">
                            {/* Item Preview Card */}
                            <div className="relative mb-8">
                                <div className={`absolute -inset-6 bg-gradient-to-r ${rarityStyle.bgGradient} opacity-40 blur-2xl rounded-full`}></div>
                                <div className={`relative w-40 h-40 bg-stone-950 rounded-3xl border-4 ${rarityStyle.border} flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group`}>
                                    <div className={`absolute inset-0 bg-gradient-to-tr ${rarityStyle.bgGradient} opacity-20`}></div>
                                    <AccessoryIcon item={purchasedItem} size={96} />

                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-sm font-black text-yellow-500 uppercase tracking-[0.4em] mb-2 animate-bounce">
                                    {t('item_shop.purchase_success') || 'ITEM ACQUIRED'}
                                </h2>
                                <h3 className="text-3xl font-bold text-white mb-2">{getItemDisplayName(purchasedItem)}</h3>
                            </div>

                            <button
                                onClick={() => setPurchasedItem(null)}
                                className="w-full py-5 bg-white text-stone-950 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm"
                            >
                                {t('common.awesome') || 'AWESOME!'}
                            </button>
                        </div>
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
        if ((item as any).rarity && RARITY_SETTINGS[(item as any).rarity]) {
            rarityStyle = RARITY_SETTINGS[(item as any).rarity];
        }
        if (item.id === 'uniform') rarityStyle = RARITY_SETTINGS.RARE;
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

        const isAlreadyCrafting = craftingQueue.some(q => q.itemId === item.id);
        const requiredItemConfig = (item as any).requiredItem ? SHOP_ITEMS.find(i => i.id === (item as any).requiredItem) : null;
        const hasRequiredItem = (item as any).requiredItem ? (inventory || []).some(inv => inv.typeId === (item as any).requiredItem) : true;

        const canCraftActual = canCraft && !isAlreadyCrafting && hasRequiredItem;

        return (
            <div key={item.id} className={`bg-stone-900 border ${rarityStyle.border} rounded-xl overflow-hidden flex flex-col gap-4 relative shadow-lg`}>
                <div className={`h-1 w-full bg-gradient-to-r ${rarityStyle.bgGradient}`}></div>
                <div className="p-3 flex flex-col gap-3">
                    <div className="flex flex-col xs:flex-row gap-3">
                        <div className={`group/icon relative w-14 h-14 rounded-lg border-2 ${rarityStyle.border} bg-stone-950 flex items-center justify-center shrink-0 cursor-help`}>
                            <AccessoryIcon item={item} size={28} />
                            {renderTooltip(item)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h3 className="text-base font-bold text-white leading-tight">{getItemDisplayName(item)}</h3>
                                    {(item.lifespanDays ?? 0) > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-0.5">
                                            <Star size={10} />
                                            <span>{t('item_shop.bonus')}: {formatBonus(item.maxBonus, item.id)} / {t('time.day')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-blue-500/30 flex flex-col items-end leading-none gap-0.5">
                                    <span className="flex items-center gap-1"><Clock size={10} />
                                        {item.craftDurationMinutes && item.craftDurationMinutes < 60
                                            ? `${item.craftDurationMinutes} ${language === 'th' ? 'นาที' : 'mins'}`
                                            : `${item.craftDurationMinutes ? (item.craftDurationMinutes / 60).toFixed(1).replace(/\.0$/, '') : 0} ${language === 'th' ? 'ชม.' : 'hrs'}`
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 w-full">
                                {(item as any).maxDurability > 0 ? (
                                    <PixelProgressBar
                                        current={(item as any).maxDurability}
                                        max={(item as any).maxDurability}
                                        showValue={true}
                                        label={language === 'th' ? 'ความทนทาน' : 'Durability'}
                                        icon={<Shield size={12} className="text-emerald-500" />}
                                        className="w-full"
                                        color="green"
                                    />
                                ) : (
                                    <div className="flex items-center gap-1 text-xs text-stone-400">
                                        {item.id.startsWith('repair_kit') ? (
                                            <>
                                                <Zap size={12} className="text-yellow-500" />
                                                <span>{language === 'th' ? 'ใช้แล้วหมดไป' : 'Consumable'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <CalendarDays size={12} className="text-stone-500" />
                                                <span>{language === 'th' ? 'ถาวร' : 'Permanent'}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {item.specialEffect && (
                                <div className="text-[10px] text-emerald-400 mt-1 font-bold">
                                    {getLocalized(item.specialEffect)}
                                </div>
                            )}
                        </div>
                    </div>

                    {!item.id.startsWith('repair_kit') && (
                        <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800 flex justify-between text-[10px]">
                            <span className="text-stone-400">Success: <span className="text-white font-bold">90%</span></span>
                            <span className="text-yellow-600">Great Success: <span className="text-yellow-400 font-bold animate-pulse">10%</span></span>
                        </div>
                    )}

                    <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-2">
                        <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">{t('item_shop.materials_required')}</div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {matsList.map((m, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] bg-stone-900 p-1.5 rounded">
                                    <div className="flex items-center gap-1.5">
                                        <MaterialIcon id={m.tier} size="w-3.5 h-3.5" iconSize={10} />
                                        <span className="text-stone-300 truncate max-w-[60px]">{getLocalized(MATERIAL_CONFIG.NAMES[m.tier as keyof typeof MATERIAL_CONFIG.NAMES])}</span>
                                    </div>
                                    <span className={m.owned >= m.needed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
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
                            {requiredItemConfig && (
                                <div className="flex items-center justify-between text-xs bg-stone-900 p-1.5 rounded col-span-2 border border-blue-500/20">
                                    <div className="flex items-center gap-2">
                                        <AccessoryIcon item={requiredItemConfig} size={16} />
                                        <span className="text-blue-300 font-bold">{getItemDisplayName(requiredItemConfig)}</span>
                                    </div>
                                    <span className={hasRequiredItem ? 'text-green-400' : 'text-red-400 font-black animate-pulse'}>
                                        {hasRequiredItem ? (language === 'th' ? 'พร้อมใช้งาน' : 'Ready') : (language === 'th' ? 'ขาดอุปกรณ์นี้' : 'Missing Item')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => handleStartCraft(item.id)}
                        disabled={!canCraftActual}
                        className={`w-full py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                      ${canCraftActual ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg' : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'}
                  `}
                    >
                        {isAlreadyCrafting ? (
                            <>{language === 'th' ? 'รอ...' : 'Wait...'}</>
                        ) : (
                            <><Hammer size={12} /> {t('item_shop.start_craft')}</>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderQueue = () => {
        // Defensive check: ensure craftingQueue is an array
        if (!craftingQueue || !Array.isArray(craftingQueue) || craftingQueue.length === 0) return (
            <div className="text-center py-8 text-stone-500 text-sm border-2 border-dashed border-stone-800 rounded-xl mb-6">
                {t('item_shop.no_active_tasks')}
            </div>
        );

        return (
            <div className="mb-8">
                <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Hammer size={16} className="text-orange-500" />
                    {t('item_shop.crafting_status', { count: craftingQueue.length })}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {craftingQueue.map(q => {
                        // FIX: Search in both SHOP_ITEMS and REPAIR_KITS
                        const item = SHOP_ITEMS.find(i => i.id === q.itemId) || (REPAIR_KITS as any[]).find(i => i.id === q.itemId);
                        if (!item) return null;

                        const now = Date.now();
                        const totalTime = q.finishAt - q.startedAt;
                        const elapsed = now - q.startedAt;
                        const progress = Math.min(100, (elapsed / totalTime) * 100);
                        const isReady = now >= q.finishAt;
                        const timeLeft = Math.max(0, q.finishAt - now);

                        // Format time as HH:mm:ss
                        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                        const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                        const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
                        const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                        let rarityStyle = RARITY_SETTINGS.COMMON;
                        if ((item as any).rarity && RARITY_SETTINGS[(item as any).rarity]) {
                            rarityStyle = RARITY_SETTINGS[(item as any).rarity];
                        }
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
                            else if (item.price >= 120) rarityStyle = RARITY_SETTINGS.RARE;
                        }

                        // Determine Border Color based on state
                        const borderColor = isReady ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-stone-700';

                        return (
                            <div key={q.id} className={`group relative bg-stone-900 border ${borderColor} rounded-xl overflow-hidden shadow-lg transition-all flex flex-col h-full`}>
                                {/* Top Gradient Bar */}
                                <div className={`h-1 w-full bg-gradient-to-r ${isReady ? 'from-green-400 to-emerald-600' : rarityStyle.bgGradient}`}></div>

                                {/* Card Body */}
                                <div className="p-6 flex flex-col items-center justify-center flex-1 relative min-h-[180px]">

                                    {/* BACKGROUND PROGRESS FILL */}
                                    {!isReady && (
                                        <div className="absolute inset-0 bg-stone-800/50 z-0 flex items-end">
                                            <div className="w-full bg-orange-600/10 transition-all duration-1000" style={{ height: `${progress}%` }}></div>
                                        </div>
                                    )}

                                    {/* Main Icon or Animation */}
                                    <div className="relative z-10 mb-4">
                                        {isReady ? (
                                            <div className="relative">
                                                <div className={`absolute inset-0 bg-green-500 rounded-full blur-xl opacity-40 animate-pulse`}></div>
                                                <div className={`w-20 h-20 rounded-xl bg-stone-950 border-2 border-green-500 flex items-center justify-center shadow-lg relative overflow-hidden`}>
                                                    <AccessoryIcon item={item} size={40} />
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                                                    <Star size={12} fill="currentColor" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                {/* Pulsing Crafting Circle */}
                                                <div className="w-20 h-20 rounded-full border-4 border-stone-800 border-t-orange-500 animate-spin absolute inset-0"></div>
                                                <div className="w-20 h-20 rounded-full bg-stone-950 flex items-center justify-center shadow-inner relative overflow-hidden">
                                                    {/* Animated Hammer Overlay */}
                                                    <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
                                                    <Hammer size={32} className="text-orange-500 animate-bounce transition-transform duration-500" />
                                                    <div className="absolute bottom-1 w-10 h-1 bg-stone-800 rounded-full opacity-50 blur-sm animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Name */}
                                    <h3 className="text-base font-bold text-white relative z-10 text-center leading-tight mb-2">{getItemDisplayName(item)}</h3>

                                    {/* Status Text / Timer */}
                                    <div className="relative z-10">
                                        {isReady ? (
                                            <div className="text-green-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                                                {t('item_shop.complete')}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">{language === 'th' ? 'กำลังสร้าง...' : 'Crafting...'}</div>
                                                <div className="bg-black/40 px-3 py-1 rounded border border-stone-700/50 flex items-center gap-2">
                                                    <Clock size={12} className="text-orange-400 animate-pulse" />
                                                    <span className="font-mono text-lg font-bold text-orange-400">{timeString}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-3 bg-stone-950 border-t border-stone-800 z-10">
                                    {isReady ? (
                                        <button
                                            onClick={() => handleClaimCraft(q.id)}
                                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.4)] flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wider text-sm"
                                        >
                                            <Star size={16} fill="currentColor" /> {t('item_shop.claim_item')}
                                        </button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Time Skip Ticket Button */}
                                            {(() => {
                                                const tickets = userInventory.filter(i => i.typeId === 'time_skip_ticket');
                                                const hasTicket = tickets.length > 0;
                                                return (
                                                    <button
                                                        onClick={() => hasTicket && handleUseSkip(q.id, 'time_skip_ticket')}
                                                        disabled={!hasTicket}
                                                        className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all border
                                                            ${hasTicket ? 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 border-blue-800/50 hover:border-blue-500' : 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed opacity-50'}
                                                        `}
                                                        title="Skip 1 Hour"
                                                    >
                                                        <span className="flex items-center gap-1"><Timer size={10} /> -1h</span>
                                                        <span className="text-[9px] opacity-70">({tickets.length})</span>
                                                    </button>
                                                );
                                            })()}

                                            {/* Construction Nanobot Button */}
                                            {(() => {
                                                const nanobots = userInventory.filter(i => i.typeId === 'construction_nanobot');
                                                const hasBot = nanobots.length > 0;
                                                return (
                                                    <button
                                                        onClick={() => hasBot && handleUseSkip(q.id, 'construction_nanobot')}
                                                        disabled={!hasBot}
                                                        className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all border
                                                            ${hasBot ? 'bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 border-cyan-800/50 hover:border-cyan-500' : 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed opacity-50'}
                                                        `}
                                                        title="Instant Finish"
                                                    >
                                                        <span className="flex items-center gap-1"><Zap size={10} /> Instant</span>
                                                        <span className="text-[9px] opacity-70">({nanobots.length})</span>
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleUpgrade = async () => {
        if (!upgradeTargetId || !upgradeMaterialId) return;
        setIsUpgrading(true);
        try {
            const res = await api.upgradeItem(upgradeTargetId, upgradeMaterialId);
            if (res.success) {
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: userId || '',
                    message: res.message || 'Upgrade Successful!',
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
                // Refresh data
                const user = await api.getMe();
                setUserInventory(user.inventory || []);
                setUserMaterials(user.materials || {});
                setRefreshTrigger(prev => prev + 1);
                setUpgradeTargetId(null);
                setUpgradeMaterialId(null);
                if (onRefresh) onRefresh();
            } else {
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: userId || '',
                    message: res.message || 'Upgrade Failed!',
                    type: 'ERROR',
                    read: false,
                    timestamp: Date.now()
                });
            }
        } catch (error: any) {
            console.error('Upgrade error:', error);
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: userId || '',
                message: error.response?.data?.message || 'Upgrade Error',
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    const renderTierIcon = (id: number) => {
        const baseClass = "relative flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0 bg-white border-2";
        const tierColors = {
            1: 'border-stone-400',
            2: 'border-blue-500',
            3: 'border-stone-600',
            4: 'border-orange-500',
            5: 'border-slate-500',
            6: 'border-yellow-500',
            7: 'border-cyan-400',
            8: 'border-purple-500'
        };
        const colorClass = tierColors[id as keyof typeof tierColors] || 'border-stone-200';
        const sizeClass = id <= 2 ? "w-10 h-10" : id <= 5 ? "w-12 h-12" : "w-14 h-14";

        if (id === 9) {
            return (
                <div className={`${baseClass} ${sizeClass} ${colorClass} rounded-lg overflow-hidden flex items-center justify-center bg-stone-950`}>
                    <div className="relative group/glove">
                        {/* Toxic Smoke/Glow Effect */}
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse scale-150"></div>
                        <div className="absolute inset-0 bg-emerald-600/10 blur-lg rounded-full animate-pulse delay-700"></div>

                        <div className="relative z-10 flex items-center justify-center">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                {/* The Glove Body (Tattered Hand) */}
                                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" className="opacity-80" />
                                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />

                                {/* Rotten Details / Holes */}
                                <circle cx="15" cy="18" r="1" fill="currentColor" className="text-stone-900" />
                                <circle cx="12" cy="14" r="0.8" fill="currentColor" className="text-stone-900" />
                                <path d="M7 16l-1 1" stroke="currentColor" strokeWidth="1" className="text-stone-800" />

                                {/* Toxic Drips */}
                                <path d="M12 22v2" stroke="currentColor" strokeWidth="1" className="animate-bounce" />
                                <path d="M15 21v1" stroke="currentColor" strokeWidth="1" className="animate-bounce delay-150" />
                            </svg>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`${baseClass} ${sizeClass} ${colorClass} rounded-lg overflow-hidden`}>
                <img src={`/assets/rigs/rig_${id}.png`} alt={`Rig Tier ${id}`} className="w-full h-full object-contain p-1" />
            </div>
        );
    };

    const getTierStyles = (id: number) => {
        switch (id) {
            case 1: return { border: "border-stone-600", text: "text-stone-400", bg: "from-stone-800/50 to-stone-950/80" };
            case 2: return { border: "border-blue-600", text: "text-blue-400", bg: "from-blue-900/20 to-stone-950/80" };
            case 3: return { border: "border-stone-500", text: "text-stone-300", bg: "from-stone-800/50 to-stone-950/80" };
            case 4: return { border: "border-orange-500", text: "text-orange-400", bg: "from-orange-900/20 to-stone-950/80" };
            case 5: return { border: "border-slate-400", text: "text-slate-300", bg: "from-slate-800/50 to-stone-950/80" };
            case 6: return { border: "border-yellow-500", text: "text-yellow-400", bg: "from-yellow-900/20 to-stone-950/80" };
            case 7: return { border: "border-cyan-400", text: "text-cyan-300", bg: "from-cyan-900/20 to-stone-950/80" };
            case 8: return { border: "border-purple-500", text: "text-purple-400", bg: "from-purple-900/30 to-stone-950/80" };
            case 9: return { border: "border-green-900/50", text: "text-green-500/70", bg: "from-green-950/20 to-stone-950/80" };
            default: return { border: "border-stone-800", text: "text-stone-400", bg: "bg-stone-900" };
        }
    };

    const renderRigShop = () => {
        const isSlotLimitReached = currentRigCount >= maxRigs;

        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Pickaxe className="text-yellow-500" size={24} />
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">{t('machine_shop.title')}</h3>
                            <p className="text-xs text-stone-500">{t('machine_shop.slots_used')}: {rigs.length}/{userMiningSlots}</p>
                        </div>
                    </div>
                </div>

                {/* {t('machine_shop.stats.warehouse_capacity')} Bar */}
                <div className="mb-6 bg-stone-900/40 p-4 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                                <BoxSelect size={16} className="text-yellow-500" />
                            </div>
                            <div>
                                <div className="text-[10px] text-stone-500 uppercase font-black tracking-widest leading-none mb-1">{t('machine_shop.stats.warehouse_capacity')}</div>
                                <div className="text-sm font-bold text-white leading-none">{t('machine_shop.stats.warehouse_capacity')}</div>
                            </div>
                        </div>
                        <div className={`text-sm font-mono font-bold ${rigs.length >= userMiningSlots ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                            {rigs.length} / {userMiningSlots}
                        </div>
                    </div>
                    <div className="h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${rigs.length >= userMiningSlots ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'}`}
                            style={{ width: `${Math.min(100, (rigs.length / userMiningSlots) * 100)}%` }}
                        ></div>
                    </div>
                    {rigs.length >= userMiningSlots && (
                        <div className="mt-2 text-[10px] text-red-400 font-bold flex items-center gap-1 animate-pulse">
                            <AlertCircle size={10} />
                            {language === 'th' ? 'โกดังเต็มแล้ว! ต้องขยายพื้นที่ก่อน' : 'Warehouse full! Must expand first.'}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-4">
                    {RIG_PRESETS.map((preset) => {
                        // Special logic: Hide Rotten Glove (Tier 9) if already owned
                        if (preset.id === 9) {
                            const isOwned = rigs.some(r => {
                                const name = typeof r.name === 'string' ? r.name : (r.name?.th || r.name?.en);
                                return r.tierId === 9 || name?.includes('เน่า') || name?.includes('Rotten');
                            });
                            if (isOwned) return null;
                        }

                        let isMaxReached = false;
                        if (preset.specialProperties?.maxAllowed) {
                            const existingCount = rigs.filter(r => {
                                const rName = typeof r.name === 'string' ? r.name : (r.name?.th || r.name?.en);
                                return rName === preset.name.th || rName === preset.name.en;
                            }).length;
                            if (existingCount >= preset.specialProperties.maxAllowed) isMaxReached = true;
                        }

                        let isAffordable = true;
                        if (preset.craftingRecipe) {
                            if (preset.craftingRecipe.materials) {
                                for (const [tier, amount] of Object.entries(preset.craftingRecipe.materials)) {
                                    if ((materials[parseInt(tier)] || 0) < amount) isAffordable = false;
                                }
                            }
                            if (preset.craftingRecipe.items) {
                                for (const [imgId, amount] of Object.entries(preset.craftingRecipe.items)) {
                                    const count = inventory.filter(i => i.typeId === imgId).length;
                                    if (count < amount) isAffordable = false;
                                }
                            }
                        } else {
                            isAffordable = walletBalance >= preset.price;
                        }

                        const tierOwnedCount = rigs.filter(r => r.tierId === preset.id).length;
                        const tierMax = MINING_VOLATILITY_CONFIG[preset.id]?.maxQuantity || 50;
                        const isTierLimitReached = tierOwnedCount >= tierMax;
                        const isWarehouseFull = rigs.length >= userMiningSlots;

                        const canBuy = isAffordable && !isWarehouseFull && !isTierLimitReached;
                        const durationDays = preset.durationDays || (preset.durationMonths || 1) * 30;
                        const netProfit = preset.bonusProfit !== undefined ? preset.bonusProfit : (preset.dailyProfit * durationDays) - preset.price;
                        const styles = getTierStyles(preset.id);
                        const isCrafting = !!preset.craftingRecipe;

                        return (
                            <div key={preset.id} className={`bg-stone-900/60 backdrop-blur border rounded-lg overflow-hidden flex flex-col transition-all duration-300 group relative hover:bg-stone-900 ${styles.border}`}>
                                <div className={`p-2 sm:p-3 flex items-center gap-2 sm:gap-3 bg-gradient-to-r ${styles.bg} border-b border-stone-800/50`}>
                                    {renderTierIcon(preset.id)}
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{t('machine_shop.stats.tier')} {preset.id}</div>
                                        <h3 className={`font-display font-bold text-xs sm:text-sm leading-tight truncate ${styles.text}`}>{getLocalized(preset.name)}</h3>
                                    </div>
                                    {/* Recommendation Badge */}
                                    {MINING_VOLATILITY_CONFIG[preset.id]?.tag && (
                                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter shadow-sm z-10 animate-fade-in
                                            ${MINING_VOLATILITY_CONFIG[preset.id].tagColor === 'green' ? 'bg-green-500 text-white' :
                                                MINING_VOLATILITY_CONFIG[preset.id].tagColor === 'orange' ? 'bg-orange-500 text-white' :
                                                    MINING_VOLATILITY_CONFIG[preset.id].tagColor === 'purple' ? 'bg-purple-600 text-white' :
                                                        MINING_VOLATILITY_CONFIG[preset.id].tagColor === 'red' ? 'bg-red-600 text-white' :
                                                            'bg-yellow-500 text-stone-900 shadow-[0_0_10px_rgba(234,179,8,0.4)]'}
                                        `}>
                                            {t(MINING_VOLATILITY_CONFIG[preset.id].tag || '')}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                                    {/* Hashrate & {t('machine_shop.stats.stability')} (Volatility Model) */}
                                    <div className="flex flex-col gap-1 w-full bg-stone-950/30 px-1.5 sm:px-2 py-1 rounded">
                                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-tighter">
                                            <div className="flex items-center gap-1">
                                                <span className="truncate max-w-[50px] sm:max-w-none">Hashrate ⓘ</span>
                                                <div className="group/tooltip relative">
                                                    <Info size={10} className="text-stone-600 cursor-help" />
                                                    <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-stone-900 border border-stone-800 rounded shadow-xl text-[10px] text-stone-400 leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-sans">
                                                        <div className="font-bold text-white mb-1">{t('rig.mystery_yield')}</div>
                                                        <div>{t('machine_shop.stats.current_rate')} {MINING_VOLATILITY_CONFIG[preset.id]?.hashrateMin}-{MINING_VOLATILITY_CONFIG[preset.id]?.hashrateMax} MH/s</div>
                                                        <div className="text-white mt-1 flex items-center gap-1.5 font-bold">
                                                            <span className="text-yellow-500">≈</span>
                                                            <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent animate-pulse drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] tracking-widest">
                                                                ???
                                                            </span>
                                                        </div>
                                                        <div className="text-[8px] text-stone-500 mt-1 italic">{t('rig.mystery_yield_tooltip')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-yellow-500 font-bold font-mono text-[9px] sm:text-[10px]">
                                                {MINING_VOLATILITY_CONFIG[preset.id]?.hashrateMin}-{MINING_VOLATILITY_CONFIG[preset.id]?.hashrateMax}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-stone-500 uppercase tracking-tighter">
                                            <span>{t('machine_shop.stats.stability')}</span>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={8} className={i < (MINING_VOLATILITY_CONFIG[preset.id]?.stabilityStars || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-stone-700'} />
                                                ))}
                                            </div>
                                        </div>
                                        {/* {t('machine_shop.stats.jackpot')} / Luck Row */}
                                        <div className="flex justify-between items-center text-[10px] text-stone-500 uppercase tracking-tighter border-t border-stone-800/50 pt-1 mt-0.5">
                                            <div className="flex items-center gap-1">
                                                <span>{t('machine_shop.stats.jackpot')}</span>
                                                {(MINING_VOLATILITY_CONFIG[preset.id]?.jackpotChance || 0) > 0.05 ? (
                                                    <Flame size={10} className="text-orange-500 animate-pulse" />
                                                ) : (
                                                    <Clover size={10} className="text-emerald-500" />
                                                )}
                                            </div>
                                            <span className={`font-mono font-bold ${(MINING_VOLATILITY_CONFIG[preset.id]?.jackpotChance || 0) > 0.05 ? 'text-orange-400 animate-pulse' : 'text-stone-400'}`}>
                                                {(MINING_VOLATILITY_CONFIG[preset.id]?.jackpotChance || 0) * 100}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded">
                                        <span className="text-stone-500">{t('machine_shop.contract')}</span>
                                        <span className="text-stone-300 font-mono">
                                            {preset.specialProperties?.infiniteDurability ? t('rig.permanent') : preset.durationDays ? `${preset.durationDays} ${t('time.days')}` : `${preset.durationMonths} ${t('time.months_short')}`}
                                        </span>
                                    </div>

                                    {/* {t('machine_shop.stats.owned')} Counter */}
                                    <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded border border-stone-800/50">
                                        <span className="text-stone-500">{t('machine_shop.stats.owned')}</span>
                                        <span className={`font-mono font-bold ${isTierLimitReached ? 'text-red-500' : 'text-stone-300'}`}>
                                            {tierOwnedCount} / {tierMax}
                                        </span>
                                    </div>
                                    <div className="mt-auto pt-1.5 border-t border-dashed border-stone-800">
                                        <div className="text-[9px] text-stone-400 mb-1">{t('machine_shop.craft_req')}:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {preset.craftingRecipe?.materials && Object.entries(preset.craftingRecipe.materials).map(([tierStr, amt]) => {
                                                const tier = parseInt(tierStr);
                                                const has = materials[tier] || 0;
                                                const enough = has >= amt;
                                                return (
                                                    <div key={`mat-${tier}`} className={`flex items-center gap-1 px-1 py-0.5 rounded border ${enough ? 'bg-emerald-900/30 border-emerald-800' : 'bg-red-900/30 border-red-800'}`}>
                                                        <MaterialIcon id={tier} size="w-3 h-3" iconSize={8} />
                                                        <span className={`text-[8px] font-mono ${enough ? 'text-emerald-400' : 'text-red-400'}`}>{has}/{amt}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 pt-0 mt-auto">
                                    <button
                                        onClick={() => onBuyRig && onBuyRig(preset)}
                                        disabled={!canBuy}
                                        className={`w-full py-2 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-[10px] sm:text-xs
                                                ${canBuy
                                                ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white shadow-lg'
                                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                                            }
                                            `}
                                    >
                                        {isWarehouseFull
                                            ? (language === 'th' ? 'โกดังเต็ม' : 'Full')
                                            : isTierLimitReached
                                                ? (language === 'th' ? `จำกัด (${tierMax})` : `Limit (${tierMax})`)
                                                : isCrafting
                                                    ? t('shop.craft_action')
                                                    : formatCurrency(preset.price)}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderUpgradeStation = () => {
        // Filter eligible items for upgrade (must be upgradable type)
        const upgradableTypes = Object.keys(EQUIPMENT_SERIES);

        const inventoryItems = userInventory.filter(i => upgradableTypes.includes(i.typeId));

        // Target Selection
        const targetItem = upgradeTargetId ? userInventory.find(i => i.id === upgradeTargetId) : null;

        // Material Selection (Must be same typeId, different ID, and Level 1)
        const eligibleMaterials = targetItem
            ? userInventory.filter(i => i.typeId === targetItem.typeId && i.id !== targetItem.id && (i.level || 1) === 1)
            : [];

        const materialItem = upgradeMaterialId ? userInventory.find(i => i.id === upgradeMaterialId) : null;

        // Config for next level
        const currentLevel = targetItem?.level || 1;
        const nextLevel = currentLevel + 1;

        // Config Lookup
        // @ts-ignore
        const upgradeConfig = (window as any).UPGRADE_CONFIG || { LEVELS: {} };
        const localConfig = {
            2: { successRate: 1.0, catalystCost: 1, fee: 10 },
            3: { successRate: 0.9, catalystCost: 2, fee: 20 },
            4: { successRate: 0.8, catalystCost: 3, fee: 40 },
            5: { successRate: 0.7, catalystCost: 5, fee: 80 },
            6: { successRate: 0.6, catalystCost: 8, fee: 150 },
            7: { successRate: 0.5, catalystCost: 12, fee: 300 },
            8: { successRate: 0.4, catalystCost: 18, fee: 500 },
            9: { successRate: 0.3, catalystCost: 25, fee: 1000 },
            10: { successRate: 0.2, catalystCost: 35, fee: 2000 }
        } as Record<number, any>;

        const config = localConfig[nextLevel];
        const successRate = config ? Math.round(config.successRate * 100) : 0;
        const catalystCost = config ? config.catalystCost : 0;

        // Check Catalysts in inventory
        const catalystCount = userInventory.filter(testItem => testItem.typeId === 'magnifying_glass').length || 0;

        return (
            <div className="flex flex-col h-full text-stone-300">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="text-purple-500" size={24} />
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{language === 'th' ? 'สถานีอัปเกรด' : 'Upgrade Station'}</h3>
                        <p className="text-xs text-stone-500">{language === 'th' ? 'ผสมอุปกรณ์เพื่อเพิ่มระดับและความสามารถ' : 'Fuse equipment to increase level and stats'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center h-full">
                    {/* Left Slot: Base Item */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 flex flex-col items-center gap-4 h-full relative">
                        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider">{language === 'th' ? 'อุปกรณ์หลัก' : 'Base Item'}</h4>
                        {targetItem ? (
                            <div className="relative group cursor-pointer" onClick={() => setUpgradeTargetId(null)}>
                                <div className={`w-32 h-32 bg-stone-950 rounded-xl border-2 ${RARITY_SETTINGS[targetItem.rarity]?.border || 'border-stone-700'} flex items-center justify-center relative overflow-hidden`}>
                                    <AccessoryIcon item={targetItem} size={64} />

                                    {/* STAR RATING SYSTEM - VERTICAL LEFT */}
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20">
                                        {[...Array(5)].map((_, index) => {
                                            // Level 1 = 0 stars
                                            // Level 2 = 0.5 stars
                                            // Level 3 = 1.0 stars
                                            // ...
                                            // Level 10 = 4.5 stars
                                            const currentStars = ((targetItem.level || 1) - 1) / 2;
                                            const slotIndex = 4 - index; // Render from top (4) to bottom (0)? NO. 
                                            // User said "Start with 5 empty star slots...". Vertical.
                                            // Usually stars go bottom to top for "filling up"? Or Top to bottom?
                                            // "Gradient from top to bottom" implies visual.
                                            // Let's assume standard vertical stack: Bottom is 1st star, Top is 5th?
                                            // The user said "5 slots on the left, top to bottom 5 stars".
                                            // "ไล่จากบนลงล่างจำนวน 5 ดวง" -> Start from Top.
                                            // Index 0 is Top. Index 4 is Bottom.

                                            const starValue = currentStars - index;

                                            // Logic check:
                                            // Lvl 1 (Stars=0). Index 0 (Top): 0 - 0 = 0. Empty.
                                            // Lvl 2 (Stars=0.5). Index 0: 0.5 - 0 = 0.5. Half.
                                            // Lvl 3 (Stars=1). Index 0: 1 - 0 = 1. Full.
                                            // Lvl 4 (Stars=1.5). Index 0: 1.5 -> Full. Index 1: 1.5 - 1 = 0.5. Half.

                                            return (
                                                <div key={index} className="w-3 h-3 flex items-center justify-center">
                                                    {starValue >= 1 ? (
                                                        <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]" />
                                                    ) : starValue === 0.5 ? (
                                                        <div className="relative">
                                                            <StarHalf size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]" />
                                                            {/* Empty background for half star? Optional but looks better */}
                                                            <Star size={12} className="text-stone-700 absolute inset-0 -z-10" />
                                                        </div>
                                                    ) : (
                                                        <Star size={12} className="text-stone-700" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    <div className={`font-bold ${RARITY_SETTINGS[targetItem.rarity]?.color}`}>{getItemDisplayName(targetItem)}</div>
                                    <div className="text-xs text-stone-500">{t('item_shop.click_to_remove')}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 w-full flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[400px]">
                                {inventoryItems.length === 0 ? (
                                    <div className="text-center text-stone-600 py-10">{t('item_shop.no_items')}</div>
                                ) : (
                                    inventoryItems.map(item => (
                                        <div key={item.id} onClick={() => { setUpgradeTargetId(item.id); setUpgradeMaterialId(null); }}
                                            className={`flex items-center gap-3 p-3 rounded-lg border border-stone-800 bg-stone-900/80 hover:bg-stone-800 cursor-pointer transition-all ${RARITY_SETTINGS[item.rarity]?.border ? 'hover:' + RARITY_SETTINGS[item.rarity].border : ''}`}>
                                            <div className={`w-10 h-10 rounded bg-stone-950 flex items-center justify-center border ${RARITY_SETTINGS[item.rarity]?.border}`}>
                                                <AccessoryIcon item={item} size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-bold ${RARITY_SETTINGS[item.rarity]?.color}`}>{getItemDisplayName(item)}</div>
                                                <div className="text-xs text-stone-500">Lv.{item.level || 1}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Center: Info & Action */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4 text-stone-600">
                            <ChevronRight size={32} />
                            <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center">
                                <Search className="text-purple-400" size={24} />
                            </div>
                            <ChevronRight size={32} />
                        </div>

                        {targetItem && nextLevel <= 10 ? (
                            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 w-full text-center space-y-2">
                                <div className="text-stone-400 text-sm">{language === 'th' ? 'โอกาสสำเร็จ' : 'Success Rate'}</div>
                                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                                    {successRate}%
                                </div>
                                <div className="text-xs text-stone-400 border-t border-stone-800 pt-2 mt-2">
                                    {language === 'th' ? 'ใช้แว่นขยายส่องแร่' : 'Cost'}: <span className={`${catalystCount >= catalystCost ? 'text-green-400' : 'text-red-400'} font-bold`}>{catalystCount}/{catalystCost}</span>
                                </div>
                            </div>
                        ) : targetItem && nextLevel > 10 ? (
                            <div className="text-yellow-500 font-bold text-xl uppercase tracking-widest border-2 border-yellow-500 px-6 py-2 rounded">Max Level</div>
                        ) : null}

                        <button
                            disabled={!upgradeTargetId || !upgradeMaterialId || isUpgrading || (catalystCount < catalystCost)}
                            onClick={handleUpgrade}
                            className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg transform active:scale-95 transition-all flex items-center gap-2
                                ${!upgradeTargetId || !upgradeMaterialId || (catalystCount < catalystCost) ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'}
                            `}
                        >
                            {isUpgrading ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> Processing...</>
                            ) : (
                                <><Zap size={18} /> {language === 'th' ? 'อัปเกรด' : 'Upgrade'}</>
                            )}
                        </button>
                    </div>

                    {/* Right Slot: Material Item */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 flex flex-col items-center gap-4 h-full">
                        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider">{language === 'th' ? 'วัตถุดิบ (หายไป)' : 'Material (Consumed)'}</h4>
                        {materialItem ? (
                            <div className="relative group cursor-pointer" onClick={() => setUpgradeMaterialId(null)}>
                                <div className={`w-32 h-32 bg-stone-950 rounded-xl border-2 border-stone-600 border-dashed flex items-center justify-center relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity`}>
                                    <AccessoryIcon
                                        item={{ typeId: materialItem.typeId, name: materialItem.name, rarity: materialItem.rarity }}
                                        size={64}
                                        className="grayscale opacity-50"
                                    />
                                </div>
                                <div className="text-center mt-4">
                                    <div className={`font-bold text-stone-400`}>{getItemDisplayName(materialItem)}</div>
                                    <div className="text-xs text-red-500">{t('item_shop.click_to_remove')}</div>
                                </div>
                            </div>
                        ) : targetItem ? (
                            <div className="flex-1 w-full flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[400px]">
                                {eligibleMaterials.length === 0 ? (
                                    <div className="text-center text-stone-600 py-10">{language === 'th' ? 'ไม่มีวัตถุดิบที่ใช้ได้' : 'No eligible materials'}</div>
                                ) : (
                                    eligibleMaterials.map(item => (
                                        <div key={item.id} onClick={() => setUpgradeMaterialId(item.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border border-stone-800 bg-stone-900/80 hover:bg-stone-800 cursor-pointer transition-all opacity-75 hover:opacity-100`}>
                                            <div className={`w-10 h-10 rounded bg-stone-950 flex items-center justify-center border border-stone-700`}>
                                                <AccessoryIcon item={item} size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-bold text-stone-400`}>{getItemDisplayName(item)}</div>
                                                <div className="text-xs text-stone-500">Lv.{item.level || 1}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-stone-600 text-sm text-center px-6">
                                {language === 'th' ? 'กรุณาเลือกอุปกรณ์หลักก่อน' : 'Select Base Item First'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-yellow-900/50 w-[95%] sm:w-full sm:max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
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
                    <div className="flex flex-wrap px-4 gap-1 sm:gap-4 py-1">
                        <button
                            onClick={() => setActiveTab('RIGS')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'RIGS' ? 'text-yellow-500 border-yellow-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <Pickaxe size={16} /> {language === 'th' ? 'เครื่องขุด' : 'Mining Rigs'}
                        </button>
                        <button
                            onClick={() => setActiveTab('SHOP')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'SHOP' ? 'text-yellow-500 border-yellow-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <ShoppingBag size={16} /> {t('item_shop.items_tab')}
                        </button>
                        <button
                            onClick={() => setActiveTab('WORKSHOP')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'WORKSHOP' ? 'text-orange-500 border-orange-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <Hammer size={16} /> {t('item_shop.workshop_tab')}
                        </button>
                        <button
                            onClick={() => setActiveTab('REPAIR')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'REPAIR' ? 'text-green-500 border-green-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <Wrench size={16} /> {language === 'th' ? 'กล่องชุดซ่อมอุปกรณ์' : 'Repair Kit Sets'}
                        </button>
                        {/* 
                        <button
                            onClick={() => setActiveTab('UPGRADE')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'UPGRADE' ? 'text-purple-500 border-purple-500' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                        >
                            <Zap size={16} /> {language === 'th' ? 'สถานีอัปเกรด' : 'Upgrade Station'}
                        </button>
                        */}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pb-24 sm:pb-6">
                    {activeTab === 'RIGS' ? (
                        renderRigShop()
                    ) : activeTab === 'SHOP' ? (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="text-yellow-500" size={20} />
                                    <h3 className="text-lg font-bold text-stone-200 uppercase tracking-wider">{t('item_shop.recommended')}</h3>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-6">
                                    {specialItems.map(item => renderItemCard(item, true))}
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'WORKSHOP' ? (
                        <div className="flex flex-col h-full">
                            {renderQueue()}
                            <div className="flex items-center gap-2 mb-4">
                                <Hammer className="text-orange-500" size={20} />
                                <h3 className="text-lg font-bold text-stone-200 uppercase tracking-wider">{t('item_shop.workshop_tab')}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-6 mb-8">
                                {craftableItems.map(item => renderCraftCard(item))}
                            </div>
                        </div>
                    ) : activeTab === 'UPGRADE' ? (
                        renderUpgradeStation()
                    ) : (
                        <div className="flex flex-col h-full">
                            {renderQueue()}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wrench className="text-green-500" size={20} />
                                    <h3 className="text-lg font-bold text-stone-200 uppercase tracking-wider">{language === 'th' ? 'กล่องชุดซ่อมอุปกรณ์' : 'Repair Kit Sets'}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-6">
                                    {REPAIR_KITS.map(kit => renderCraftCard(kit as any))}
                                </div>
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
                            <AccessoryIcon item={claimedItem} size={64} />
                            <Sparkles className="absolute top-0 right-0 text-yellow-200 animate-bounce" />
                        </div>

                        <div className="text-center mb-6 w-full">
                            <h3 className="text-xl font-bold text-white mb-2">{getItemDisplayName(claimedItem)}</h3>
                            <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase mb-4 border ${RARITY_SETTINGS.RARE.border} ${RARITY_SETTINGS.RARE.color} bg-stone-900`}>
                                {t('item_shop.obtained_label')}
                            </div>

                            <div className="bg-stone-950/50 rounded-xl p-4 space-y-3 border border-stone-800 text-sm w-full">
                                {claimedItem.dailyBonus > 0 && (
                                    <div className="flex justify-between items-center text-stone-400">
                                        <span>{t('item_shop.bonus_info')}</span>
                                        <span className="text-yellow-400 font-bold">{formatBonus(claimedItem.dailyBonus || 0, claimedItem.typeId)}/{t('time.day')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-stone-400">
                                    <span>{t('item_shop.status_label')}</span>
                                    <span className="text-white font-bold">{t('item_shop.success_status')}</span>
                                </div>
                                {claimedItem.specialEffect && (
                                    <div className="pt-2 border-t border-stone-800 text-xs text-emerald-400 text-center font-bold">
                                        {t('item_shop.property_label')}: {getLocalized(claimedItem.specialEffect)}
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
            {renderSuccessModal()}
        </div>
    );
};


