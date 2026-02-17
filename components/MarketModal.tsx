
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, RefreshCw, BarChart2, DollarSign, ShoppingCart, CheckCircle2, History, ArrowRight, Bot } from 'lucide-react';
import { MarketState, Transaction, MarketItemData, AccessoryItem } from '../services/types';
import { MATERIAL_CONFIG, CURRENCY, MARKET_CONFIG, ROBOT_CONFIG, EXCHANGE_RATE_USD_THB } from '../constants';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { api } from '../services/api';

interface MarketModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
    initialTier?: number;
    addNotification?: (n: any) => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({ isOpen, onClose, userId, onSuccess, initialTier, addNotification }) => {
    const { t, language, formatCurrency, getLocalized } = useTranslation();
    const [market, setMarket] = useState<MarketState | null>(null);
    const [selectedTier, setSelectedTier] = useState<number>(1);
    const [amount, setAmount] = useState<number>(0);
    const [action, setAction] = useState<'BUY' | 'SELL'>('SELL');
    const [userMats, setUserMats] = useState<Record<number, number>>({});
    const [userBalance, setUserBalance] = useState<number>(0);
    const [userMastery, setUserMastery] = useState<number>(0);
    const [userInventory, setUserInventory] = useState<AccessoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<'TRADE' | 'HISTORY'>('TRADE');
    const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D'>('1D');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSafetyWarning, setShowSafetyWarning] = useState(false);
    const [history, setHistory] = useState<Transaction[]>([]);

    useEffect(() => {
        if (isOpen) {
            refreshMarket();
            refreshHistory();
            if (initialTier) setSelectedTier(initialTier);
        }
    }, [isOpen, initialTier]);

    const refreshMarket = async () => {
        try {
            const m = await api.getMarketStatus();
            setMarket(m);

            // Fetch real user data from backend
            const user = await api.getMe();
            if (user) {
                // Ensure materials is a clean Record<number, number>
                const mats: Record<number, number> = {};
                if (user.materials) {
                    Object.entries(user.materials).forEach(([k, v]) => {
                        mats[parseInt(k)] = Number(v);
                    });
                }
                setUserMats(mats);
                setUserBalance(Number(user.balance) || 0);
                setUserMastery(Number(user.masteryPoints) || 0);
                setUserInventory(user.inventory || []);
            }
        } catch (error) {
            console.error('Failed to refresh market data:', error);
        }
    };

    const refreshHistory = async () => {
        try {
            const txs = await api.getMyHistory();
            const marketTxs = txs.filter(t => t.type === 'MATERIAL_BUY' || t.type === 'MATERIAL_SELL');
            setHistory(marketTxs);
        } catch (error) {
            console.error('Failed to refresh transaction history:', error);
        }
    };

    if (!isOpen || !market) return null;

    const item = market.trends[selectedTier];
    const matName = getLocalized(MATERIAL_CONFIG.NAMES[selectedTier as keyof typeof MATERIAL_CONFIG.NAMES]);

    const spreadPercent = userMastery >= 1000 ? 0.12 : 0.15;
    const spreadLabel = (spreadPercent * 100).toFixed(0);

    const sellPrice = item.currentPrice;
    const buyPrice = parseFloat((item.currentPrice * (1 + spreadPercent)).toFixed(2));
    const sellTax = parseFloat((sellPrice * amount * 0.15).toFixed(2));
    const buyTax = parseFloat((item.currentPrice * spreadPercent * amount).toFixed(2));

    const unitPrice = action === 'BUY' ? buyPrice : sellPrice;
    const totalPrice = action === 'BUY'
        ? parseFloat((unitPrice * amount).toFixed(2))
        : parseFloat(((unitPrice * amount) - sellTax).toFixed(2));

    const maxSell = userMats[selectedTier] || 0;
    const maxBuy = Math.floor(userBalance / buyPrice);

    const handleTransaction = async () => {
        setLoading(true);
        try {
            if (action === 'SELL') {
                // --- SAFETY ADVISOR START ---
                const deviation = ((item.currentPrice - item.basePrice) / item.basePrice);
                const hasRobot = false;

                if (hasRobot && deviation < ROBOT_CONFIG.SAFE_SELL_THRESHOLD) {
                    if (!showSafetyWarning) {
                        setShowSafetyWarning(true);
                        setLoading(false);
                        return;
                    }
                }
                // --- SAFETY ADVISOR END ---

                await api.sellMaterial(selectedTier, amount);
            } else {
                await api.buyMaterial(selectedTier, amount);
            }
            setShowConfirm(false);
            setShowSafetyWarning(false);
            setAmount(0);
            onSuccess();
            refreshMarket();
            refreshHistory();
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: userId,
                message: action === 'BUY' ? t('market.buy_success') : t('market.sell_success'),
                type: 'SUCCESS',
                read: false,
                timestamp: Date.now()
            });
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message;
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: userId,
                message: errorMsg,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        } finally {
            setLoading(false);
        }
    };

    const renderGraph = (hist: number[]) => {
        if (!hist || hist.length < 2) return null;

        let data = [...hist];

        // Simulate different timeframes using current history data
        if (timeframe === '1H') {
            // Last 8 points with some micro-fluctuations for "real-time" feel
            data = data.slice(-8).map(v => v * (1 + (Math.random() - 0.5) * 0.002));
        } else if (timeframe === '4H') {
            // Last 14 points with slight smoothing
            data = data.slice(-14).map(v => v * (1 + (Math.random() - 0.5) * 0.001));
        }
        // 1D uses the full 20 point history

        const height = 60;
        const width = 100;
        const min = Math.min(...data) * 0.99;
        const max = Math.max(...data) * 1.01;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min || 1)) * height;
            return `${x},${y}`;
        }).join(' ');

        const isUp = data[data.length - 1] >= data[0];
        const color = isUp ? '#10b981' : '#ef4444';

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <linearGradient id={`grad-${selectedTier}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
                <polyline
                    fill={`url(#grad-${selectedTier})`}
                    stroke="none"
                    points={`${points} ${width},${height} 0,${height}`}
                />
            </svg>
        );
    };

    const deviationFromBase = ((item.currentPrice - item.basePrice) / item.basePrice);
    const isBotActive = Math.abs(deviationFromBase) > MARKET_CONFIG.BOT_INTERVENTION_THRESHOLD;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-stone-900 border-b border-stone-800 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-blue-900/20 p-1.5 sm:p-2 rounded text-blue-400">
                            <BarChart2 size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-display font-bold text-white leading-tight">{t('market.title')}</h2>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] sm:text-xs text-stone-500">
                                <span className="flex items-center gap-1"><RefreshCw size={8} /> {t('market.reset_note')} {MARKET_CONFIG.UPDATE_INTERVAL_HOURS} {t('time.hours')}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className={userMastery >= 1000 ? "text-cyan-400 font-bold" : "text-yellow-500"}>{t('market.fee_note')} {spreadLabel}% ({t('market.buy_side')})</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
                            <button onClick={() => setActiveTab('TRADE')} className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'TRADE' ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}>{t('market.trade_tab')}</button>
                            <button onClick={() => setActiveTab('HISTORY')} className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}>{t('market.history_tab')}</button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                    <div className="w-full md:w-80 border-r border-stone-800 bg-stone-900/50 overflow-y-auto custom-scrollbar shrink-0 max-h-[35vh] md:max-h-full">
                        {Object.entries(market.trends)
                            .filter(([key]) => parseInt(key) !== 0)
                            .map(([key, rawData]) => {
                                const tier = Number(key);
                                const data = rawData as MarketItemData;
                                const isSelected = selectedTier === tier;
                                const isClosed = tier === 7;
                                const name = getLocalized(MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]);
                                const count = userMats[tier] || 0;
                                const itemDev = ((data.currentPrice - data.basePrice) / data.basePrice);
                                const itemBot = Math.abs(itemDev) > MARKET_CONFIG.BOT_INTERVENTION_THRESHOLD;

                                return (
                                    <button
                                        key={tier}
                                        onClick={() => { setSelectedTier(tier); setAmount(0); setShowConfirm(false); }}
                                        className={`w-full p-2.5 sm:p-4 border-b border-stone-800 flex justify-between items-center transition-all ${isSelected ? 'bg-stone-800 border-l-4 border-l-blue-500 pl-2 sm:pl-3' : 'hover:bg-stone-900 border-l-4 border-l-transparent'} ${isClosed ? 'opacity-60 grayscale-[0.2]' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <MaterialIcon id={tier} size="w-7 h-7 sm:w-8 sm:h-8" iconSize={14} />
                                            <div className="text-left">
                                                <div className={`font-bold text-[13px] sm:text-sm flex items-center gap-1 ${isSelected ? 'text-white' : 'text-stone-400'}`}>
                                                    {name[language as keyof typeof name]}
                                                    {isClosed && <span className="text-[9px] bg-red-600/20 text-red-500 border border-red-500/30 px-1 rounded font-black ml-1 animate-pulse uppercase">{t('common.close')}</span>}
                                                    {itemBot && <Bot size={10} className="text-emerald-400 animate-pulse" title={t('market.bot_active')} />}
                                                </div>
                                                <div className="text-[9px] sm:text-[10px] text-stone-500">
                                                    {t('market.available')}: <span className={count > 0 ? "text-white font-bold" : "text-stone-600"}>{count}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-white text-[13px] sm:text-sm">
                                                {formatCurrency(data.currentPrice)}
                                            </div>
                                            <div className="text-[9px] sm:text-[10px] text-stone-500 font-mono">
                                                {language === 'th' ?
                                                    `(${formatCurrency(data.currentPrice, { forceUSD: true })})` :
                                                    `(${formatCurrency(data.currentPrice, { forceTHB: true })})`
                                                }
                                            </div>
                                            <div className={`text-[9px] sm:text-[10px] flex items-center justify-end gap-1 ${data.trend === 'UP' ? 'text-emerald-400' : data.trend === 'DOWN' ? 'text-red-400' : 'text-stone-500'}`}>
                                                {data.trend === 'UP' ? <TrendingUp size={9} /> : data.trend === 'DOWN' ? <TrendingDown size={9} /> : <Minus size={9} />}
                                                {Math.abs((data.multiplier - 1) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                    </div>

                    <div className="flex-1 flex flex-col bg-stone-950 relative">
                        {activeTab === 'TRADE' ? (
                            <>
                                {showSafetyWarning && (
                                    <div className="absolute inset-0 z-30 bg-red-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                                        <div className="bg-stone-900 border-2 border-red-500 w-full max-w-sm rounded-xl p-6 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-20"><Bot size={120} /></div>
                                            <div className="relative z-10 text-center">
                                                <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500 animate-pulse">
                                                    <Bot size={32} className="text-red-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-red-400 mb-2">{t('market.safety_warning')}</h3>
                                                <p className="text-white text-sm mb-4">
                                                    {language === 'th' ? (
                                                        <>
                                                            {t('market.safety_intro')} <span className="text-yellow-500 font-bold">{matName[language as keyof typeof matName]}</span> {t('market.safety_fall')} (<span className="text-red-400 font-bold">{(deviationFromBase * 100).toFixed(1)}%</span>) <br />
                                                            {t('market.safety_confirm')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {t('market.safety_intro')} <span className="text-yellow-500 font-bold">{matName[language as keyof typeof matName]}</span> {t('market.safety_fall')} (<span className="text-red-400 font-bold">{(deviationFromBase * 100).toFixed(1)}%</span>). <br />
                                                            {t('market.safety_confirm')}
                                                        </>
                                                    )}
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button onClick={() => setShowSafetyWarning(false)} className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold transition-colors">{t('market.safety_advice')}</button>
                                                    <button onClick={handleTransaction} className="py-3 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-900/40">{t('market.safety_ignore')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showConfirm && !showSafetyWarning && (
                                    <div className="absolute inset-0 z-20 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                                        <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-xl p-6 shadow-2xl">
                                            <h3 className="text-lg font-bold text-white mb-4 text-center border-b border-stone-800 pb-2">{t('market.confirm_title')}</h3>
                                            <div className="space-y-3 mb-6 text-sm">
                                                <div className="flex justify-between items-center"><span className="text-stone-400">{t('common.item')}</span><span className="text-white font-bold flex items-center gap-2"><MaterialIcon id={selectedTier} size="w-6 h-6" iconSize={12} /> {matName[language as keyof typeof matName]}</span></div>
                                                <div className="flex justify-between items-center"><span className="text-stone-400">{t('market.unit_price')}</span><span className="text-stone-300 font-mono">
                                                    {language === 'th' ?
                                                        <>{formatCurrency(unitPrice)} <span className="text-[10px] text-stone-500">({formatCurrency(unitPrice, { forceUSD: true })})</span></> :
                                                        <>{formatCurrency(unitPrice)} <span className="text-[10px] text-stone-500">({formatCurrency(unitPrice, { forceTHB: true })})</span></>
                                                    }
                                                </span></div>
                                                <div className="flex justify-between items-center"><span className="text-stone-400">{t('common.amount')}</span><span className="text-white font-bold">x{amount}</span></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-stone-400">{action === 'BUY' ? t('market.spread') : t('market.tax')}</span>
                                                    <span className="text-stone-500 font-mono">
                                                        {language === 'th' ?
                                                            (action === 'BUY' ? `+ ${formatCurrency(buyTax)}` : `- ${formatCurrency(sellTax)}`) :
                                                            (action === 'BUY' ? `+ ${formatCurrency(buyTax)}` : `- ${formatCurrency(sellTax)}`)
                                                        }
                                                    </span>
                                                </div>
                                                <div className="h-px bg-stone-800 my-2"></div>
                                                <div className="flex justify-between items-center text-base"><span className="text-stone-300">{t('market.total_price')}</span>
                                                    <span className={`font-mono font-bold ${action === 'BUY' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {language === 'th' ?
                                                            <>{formatCurrency(totalPrice)} <span className="text-xs font-normal opacity-70">({formatCurrency(totalPrice, { forceUSD: true })})</span></> :
                                                            <>{formatCurrency(totalPrice)} <span className="text-xs font-normal opacity-70">({formatCurrency(totalPrice, { forceTHB: true })})</span></>
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => setShowConfirm(false)} className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors">{t('common.cancel')}</button>
                                                <button onClick={handleTransaction} disabled={loading} className={`py-3 rounded font-bold text-white shadow-lg flex items-center justify-center gap-2 ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>{loading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}{action === 'BUY' ? t('market.confirm_buy') : t('market.confirm_sell')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="h-auto p-3 sm:p-4 border-b border-stone-800 relative">
                                    <div className="flex justify-between items-start mb-1.5 sm:mb-2 text-xs sm:text-base">
                                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                            <div className="p-1.5 sm:p-2 bg-stone-900 border border-stone-800 rounded-lg shrink-0"><MaterialIcon id={selectedTier} size="w-8 h-8 sm:w-10 sm:h-10" iconSize={16} /></div>
                                            <div className="overflow-hidden">
                                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 flex items-center gap-2 truncate">
                                                    {matName[language as keyof typeof matName]}
                                                    <span className="text-xs sm:text-sm font-normal text-stone-500">/ {CURRENCY}</span>
                                                </h3>
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] sm:text-sm">
                                                    <span className="text-stone-500">Base: {formatCurrency(item.basePrice)}</span>
                                                    <span className={item.trend === 'UP' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>Last: {formatCurrency(item.currentPrice)}</span>
                                                    {isBotActive && <div className="bg-emerald-900/40 text-emerald-400 text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30 animate-pulse"><Bot size={8} /> {t('market.bot_active')}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 bg-stone-900 p-0.5 sm:p-1 rounded-lg border border-stone-800 shrink-0">
                                            {['1H', '4H', '1D'].map(t => (
                                                <button key={t} onClick={() => setTimeframe(t as any)} className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded transition-colors font-bold ${timeframe === t ? 'bg-blue-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-20 sm:h-32 w-full relative group">{renderGraph(item.history)}<div className="absolute top-2 right-2 text-[9px] text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">{t('market.realtime_data')}</div></div>
                                </div>

                                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3 bg-stone-900 p-1 rounded-xl border border-stone-800">
                                        <button onClick={() => setAction('BUY')} disabled={selectedTier === 7} className={`py-1.5 sm:py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[12px] sm:text-base ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'} disabled:opacity-30 disabled:grayscale`}>
                                            <ArrowRight size={13} className="sm:w-4 sm:h-4 rotate-45" /> {t('market.buy_action')}
                                        </button>
                                        <button onClick={() => setAction('SELL')} disabled={selectedTier === 7} className={`py-1.5 sm:py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[12px] sm:text-base ${action === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'} disabled:opacity-30 disabled:grayscale`}>
                                            <ArrowRight size={13} className="sm:w-4 sm:h-4 -rotate-[135deg]" /> {t('market.sell_action')}
                                        </button>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between text-[11px] sm:text-xs text-stone-400 bg-stone-900/50 p-1.5 sm:p-2.5 rounded-lg border border-stone-800"><span>{t('common.your_balance')}:</span><span className="font-bold text-white">{action === 'SELL' ? `${maxSell} Units` : `${userBalance.toLocaleString()} ${CURRENCY}`}</span></div>
                                        <div className="space-y-1 sm:space-y-1.5">
                                            <div className="flex justify-between items-center"><label className="text-[10px] sm:text-xs text-stone-500 uppercase font-bold">{t('market.amount_label')}</label><span className="text-[10px] sm:text-xs text-blue-400 cursor-pointer hover:underline" onClick={() => setAmount(action === 'SELL' ? maxSell : maxBuy)}>{t('market.max_available')}</span></div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={amount === 0 ? '' : amount}
                                                    onChange={(e) => { const val = e.target.value === '' ? 0 : parseInt(e.target.value); setAmount(isNaN(val) ? 0 : val); }}
                                                    disabled={selectedTier === 7}
                                                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 sm:p-3 text-white font-mono text-sm sm:text-base focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
                                                    placeholder={selectedTier === 7 ? t('market.suspended') : t('market.enter_amount')}
                                                />
                                                <span className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-stone-500 text-[9px] sm:text-[10px] font-bold">UNITS</span>
                                            </div>
                                        </div>
                                        <div className="bg-stone-900 p-2.5 sm:p-4 rounded-xl border border-stone-800 space-y-0.5 sm:space-y-1.5">
                                            <div className="flex justify-between text-[12px] sm:text-sm"><span className="text-stone-400">{t('market.market_price')}</span><span className="text-white font-mono">
                                                {language === 'th' ?
                                                    <>{formatCurrency(item.currentPrice)} <span className="text-[9px] sm:text-[10px] text-stone-500">({formatCurrency(item.currentPrice, { forceUSD: true })})</span></> :
                                                    <>{formatCurrency(item.currentPrice)} <span className="text-[9px] sm:text-[10px] text-stone-500">({formatCurrency(item.currentPrice, { forceTHB: true })})</span></>
                                                }
                                            </span></div>
                                            <div className="flex justify-between text-[12px] sm:text-sm">
                                                <span className="text-stone-400">{action === 'BUY' ? t('market.spread') : t('market.tax')}</span>
                                                <span className={action === 'BUY' && userMastery >= 1000 ? "text-cyan-400 font-bold font-mono" : "text-stone-500 font-mono"}>
                                                    {action === 'BUY' ? `+${spreadLabel}%` : '-15%'}
                                                </span>
                                            </div>
                                            <div className="h-px bg-stone-800 my-1 sm:my-2"></div>
                                            <div className="flex justify-between text-sm sm:text-lg font-bold"><span className="text-stone-200">{t('market.total_price')}</span>
                                                <span className={action === 'BUY' ? 'text-red-400' : 'text-emerald-400'}>
                                                    {formatCurrency(totalPrice)}
                                                </span>
                                            </div>
                                            <div className="text-right text-[10px] sm:text-xs text-stone-500 font-mono mt-0.5 sm:mt-1 opacity-60">
                                                {language === 'th' ?
                                                    `(${formatCurrency(totalPrice, { forceUSD: true })})` :
                                                    `(${formatCurrency(totalPrice, { forceTHB: true })})`
                                                }
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowConfirm(true)}
                                            disabled={loading || selectedTier === 7 || amount <= 0 || (action === 'SELL' && amount > maxSell) || (action === 'BUY' && totalPrice > userBalance)}
                                            className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-800`}
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={18} sm:size={20} /> : (
                                                <>
                                                    {selectedTier === 7 ? t('market.suspended') :
                                                        action === 'BUY' && totalPrice > userBalance ? t('market.insufficient_funds') :
                                                            action === 'SELL' && amount > maxSell ? t('market.insufficient_mats') :
                                                                amount <= 0 ? t('market.enter_amount') :
                                                                    action === 'BUY' ? t('market.review_purchase') : t('market.review_sale')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                <div className="p-4 border-b border-stone-800 bg-stone-900/50 flex justify-between items-center"><h3 className="font-bold text-stone-300">{t('market.recent_history')}</h3><div className="text-xs text-stone-500">{t('market.history_limit')}</div></div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-2"><History size={32} opacity={0.5} /><p>{t('market.no_history')}</p></div>
                                    ) : (
                                        <div className="divide-y divide-stone-800">
                                            {history.map(tx => (
                                                <div key={tx.id} className="p-2.5 sm:p-4 hover:bg-stone-900 transition-colors flex items-center justify-between border-b border-stone-800 last:border-0">
                                                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center border ${tx.type === 'MATERIAL_BUY' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500' : 'bg-red-900/20 border-red-500/30 text-red-500'}`}>
                                                            {tx.type === 'MATERIAL_BUY' ? <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" /> : <DollarSign size={12} className="sm:w-3.5 sm:h-3.5" />}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="text-[11px] sm:text-sm font-bold text-stone-200 flex items-center gap-1.5 truncate">
                                                                {tx.type === 'MATERIAL_BUY' ? t('market.buy_side') : t('market.sell_action')}
                                                                <span className="text-[9px] sm:text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded shrink-0">
                                                                    {tx.description.split(':')[1]?.split('(')[0]?.trim() || tx.description}
                                                                </span>
                                                            </div>
                                                            <div className="text-[9px] sm:text-xs text-stone-500 font-mono truncate">{new Date(tx.timestamp).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`font-mono font-bold text-xs sm:text-sm shrink-0 pl-2 text-right ${tx.type === 'MATERIAL_SELL' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {tx.type === 'MATERIAL_SELL' ? '+' : ''}
                                                        {language === 'th' ?
                                                            <>{formatCurrency(tx.amount)} <div className="text-[8px] sm:text-[10px] font-normal opacity-50">{formatCurrency(tx.amount, { forceUSD: true })}</div></> :
                                                            <>{formatCurrency(tx.amount)} <div className="text-[8px] sm:text-[10px] font-normal opacity-50">{formatCurrency(tx.amount, { forceTHB: true })}</div></>
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
