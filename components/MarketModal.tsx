
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, RefreshCw, BarChart2, DollarSign, ShoppingCart, CheckCircle2, History, ArrowRight, Bot } from 'lucide-react';
import { MarketState, Transaction, MarketItemData, AccessoryItem } from '../services/types';
import { MATERIAL_CONFIG, CURRENCY, MARKET_CONFIG, ROBOT_CONFIG } from '../constants';
import { MaterialIcon } from './MaterialIcon';
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
    const matName = MATERIAL_CONFIG.NAMES[selectedTier as keyof typeof MATERIAL_CONFIG.NAMES];

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
                const hasRobot = userInventory.some(i => i.typeId === 'robot');

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
                message: `${action === 'BUY' ? 'ซื้อ' : 'ขาย'}สำเร็จ!`,
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-5xl rounded-xl shadow-2xl flex flex-col h-[90vh] md:h-[85vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-stone-900 border-b border-stone-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-900/20 p-2 rounded text-blue-400">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">ตลาดกลางวัสดุ (Material Exchange)</h2>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className="flex items-center gap-1"><RefreshCw size={10} /> รีเซ็ตทุก {MARKET_CONFIG.UPDATE_INTERVAL_HOURS} ชม.</span>
                                <span>•</span>
                                <span className={userMastery >= 1000 ? "text-cyan-400 font-bold" : "text-yellow-500"}>ค่าธรรมเนียม {spreadLabel}% (ฝั่งซื้อ)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
                            <button onClick={() => setActiveTab('TRADE')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'TRADE' ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}>ซื้อขาย</button>
                            <button onClick={() => setActiveTab('HISTORY')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}>ประวัติ</button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full text-stone-500 hover:text-white ml-2">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                    <div className="w-full md:w-80 border-r border-stone-800 bg-stone-900/50 overflow-y-auto custom-scrollbar shrink-0 max-h-[35vh] md:max-h-full">
                        {Object.entries(market.trends).map(([key, rawData]) => {
                            const t = Number(key);
                            const data = rawData as MarketItemData;
                            const isSelected = selectedTier === t;
                            const name = MATERIAL_CONFIG.NAMES[t as keyof typeof MATERIAL_CONFIG.NAMES];
                            const count = userMats[t] || 0;
                            const itemDev = ((data.currentPrice - data.basePrice) / data.basePrice);
                            const itemBot = Math.abs(itemDev) > MARKET_CONFIG.BOT_INTERVENTION_THRESHOLD;

                            return (
                                <button
                                    key={t}
                                    onClick={() => { setSelectedTier(t); setAmount(0); setShowConfirm(false); }}
                                    className={`w-full p-4 border-b border-stone-800 flex justify-between items-center transition-all ${isSelected ? 'bg-stone-800 border-l-4 border-l-blue-500 pl-3' : 'hover:bg-stone-900 border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <MaterialIcon id={t} size="w-8 h-8" iconSize={16} />
                                        <div className="text-left">
                                            <div className={`font-bold text-sm flex items-center gap-1 ${isSelected ? 'text-white' : 'text-stone-400'}`}>
                                                {name}
                                                {itemBot && <Bot size={12} className="text-emerald-400 animate-pulse" title="System Stabilizer Bot Active" />}
                                            </div>
                                            <div className="text-[10px] text-stone-500">
                                                คงเหลือ: <span className={count > 0 ? "text-white font-bold" : "text-stone-600"}>{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-white text-sm">{data.currentPrice.toFixed(2)}</div>
                                        <div className={`text-[10px] flex items-center justify-end gap-1 ${data.trend === 'UP' ? 'text-emerald-400' : data.trend === 'DOWN' ? 'text-red-400' : 'text-stone-500'}`}>
                                            {data.trend === 'UP' ? <TrendingUp size={10} /> : data.trend === 'DOWN' ? <TrendingDown size={10} /> : <Minus size={10} />}
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
                                                <h3 className="text-xl font-bold text-red-400 mb-2">คำเตือนจากผู้ช่วย!</h3>
                                                <p className="text-white text-sm mb-4">
                                                    "คุณผู้จัดการครับ! ช่วงนี้ราคา <span className="text-yellow-500 font-bold">{matName}</span> ตกหนักมาก (<span className="text-red-400 font-bold">{(deviationFromBase * 100).toFixed(1)}%</span>) <br />
                                                    แน่ใจนะครับว่าจะขายตอนนี้? ผมแนะนำให้รอก่อนครับ"
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button onClick={() => setShowSafetyWarning(false)} className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold transition-colors">เชื่อคำแนะนำ (ยกเลิก)</button>
                                                    <button onClick={handleTransaction} className="py-3 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-900/40">ขายเลย (ไม่สน)</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showConfirm && !showSafetyWarning && (
                                    <div className="absolute inset-0 z-20 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                                        <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-xl p-6 shadow-2xl">
                                            <h3 className="text-lg font-bold text-white mb-4 text-center border-b border-stone-800 pb-2">ยืนยันรายการ{action === 'BUY' ? 'ซื้อ' : 'ขาย'}</h3>
                                            <div className="space-y-3 mb-6 text-sm">
                                                <div className="flex justify-between items-center"><span className="text-stone-400">รายการ</span><span className="text-white font-bold flex items-center gap-2"><MaterialIcon id={selectedTier} size="w-6 h-6" iconSize={12} /> {matName}</span></div>
                                                <div className="flex justify-between items-center"><span className="text-stone-400">ราคาต่อหน่วย</span><span className="text-stone-300 font-mono">{unitPrice.toFixed(2)}</span></div>
                                                <div className="flex justify-between items-center"><span className="text-stone-400">จำนวน</span><span className="text-white font-bold">x{amount}</span></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-stone-400">{action === 'BUY' ? 'ค่าธรรมเนียม' : 'ภาษีตลาด'}</span>
                                                    <span className="text-stone-500 font-mono">
                                                        {action === 'BUY' ? `+${buyTax.toFixed(2)}` : `-${sellTax.toFixed(2)}`}
                                                    </span>
                                                </div>
                                                <div className="h-px bg-stone-800 my-2"></div>
                                                <div className="flex justify-between items-center text-base"><span className="text-stone-300">ราคารวมสุทธิ</span><span className={`font-mono font-bold ${action === 'BUY' ? 'text-red-400' : 'text-emerald-400'}`}>{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}</span></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => setShowConfirm(false)} className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors">แก้ไข</button>
                                                <button onClick={handleTransaction} disabled={loading} className={`py-3 rounded font-bold text-white shadow-lg flex items-center justify-center gap-2 ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>{loading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}{action === 'BUY' ? 'ยืนยันการสั่งซื้อ' : 'ยืนยันการขายออก'}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="h-auto p-4 border-b border-stone-800 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-stone-900 border border-stone-800 rounded-lg"><MaterialIcon id={selectedTier} size="w-10 h-10" iconSize={20} /></div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                                    {matName}
                                                    <span className="text-sm font-normal text-stone-500">/ {CURRENCY}</span>
                                                    {isBotActive && <div className="bg-emerald-900/40 text-emerald-400 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30 animate-pulse"><Bot size={10} /> Assistant Monitoring</div>}
                                                </h3>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="text-stone-500">Base: {item.basePrice}</span>
                                                    <span className={item.trend === 'UP' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>Last: {item.currentPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
                                            {['1H', '4H', '1D'].map(t => (
                                                <button key={t} onClick={() => setTimeframe(t as any)} className={`text-xs px-3 py-1 rounded transition-colors font-bold ${timeframe === t ? 'bg-blue-600 text-white ring-2 ring-white ring-inset' : 'text-stone-500 hover:text-stone-300'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-32 w-full relative group">{renderGraph(item.history)}<div className="absolute top-2 right-2 text-[10px] text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">Real-time System Data</div></div>
                                </div>

                                <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-3 mb-4 bg-stone-900 p-1 rounded-xl border border-stone-800">
                                        <button onClick={() => setAction('BUY')} className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}><ArrowRight size={16} className="rotate-45" /> สั่งซื้อ (BUY)</button>
                                        <button onClick={() => setAction('SELL')} className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${action === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'}`}><ArrowRight size={16} className="-rotate-[135deg]" /> ขายออก (SELL)</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs text-stone-400 bg-stone-900/50 p-2.5 rounded-lg border border-stone-800"><span>Available Balance:</span><span className="font-bold text-white">{action === 'SELL' ? `${maxSell} Units` : `${userBalance.toLocaleString()} ${CURRENCY}`}</span></div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center"><label className="text-xs text-stone-500 uppercase font-bold">จำนวนที่ต้องการ (Amount)</label><span className="text-xs text-blue-400 cursor-pointer hover:underline" onClick={() => setAmount(action === 'SELL' ? maxSell : maxBuy)}>Max Available</span></div>
                                            <div className="relative">
                                                <input type="number" value={amount === 0 ? '' : amount} onChange={(e) => { const val = e.target.value === '' ? 0 : parseInt(e.target.value); setAmount(isNaN(val) ? 0 : val); }} className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-white font-mono text-base focus:border-blue-500 outline-none transition-colors" placeholder="0" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 text-[10px] font-bold">UNITS</span>
                                            </div>
                                        </div>
                                        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 space-y-2">
                                            <div className="flex justify-between text-sm"><span className="text-stone-400">ราคาตลาด (Price)</span><span className="text-white font-mono">{item.currentPrice.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-400">{action === 'BUY' ? 'ค่าธรรมเนียม (Spread)' : 'ภาษีตลาด (Market Tax)'}</span>
                                                <span className={action === 'BUY' && userMastery >= 1000 ? "text-cyan-400 font-bold font-mono" : "text-stone-500 font-mono"}>
                                                    {action === 'BUY' ? `+${spreadLabel}%` : '-15%'}
                                                </span>
                                            </div>
                                            <div className="h-px bg-stone-800 my-2"></div>
                                            <div className="flex justify-between text-lg font-bold"><span className="text-stone-200">รวมสุทธิ (Total)</span><span className={action === 'BUY' ? 'text-red-400' : 'text-emerald-400'}>{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}</span></div>
                                        </div>
                                        <button
                                            onClick={() => setShowConfirm(true)}
                                            disabled={loading || amount <= 0 || (action === 'SELL' && amount > maxSell) || (action === 'BUY' && totalPrice > userBalance)}
                                            className={`w-full py-3 rounded-xl font-bold text-base shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-800`}
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                                                <>
                                                    {action === 'BUY' && totalPrice > userBalance ? 'ยอดเงินไม่เพียงพอ' :
                                                        action === 'SELL' && amount > maxSell ? 'วัตถุดิบไม่เพียงพอ' :
                                                            amount <= 0 ? 'ระบุจำนวนที่ต้องการ' :
                                                                action === 'BUY' ? 'ตรวจสอบรายการสั่งซื้อ' : 'ตรวจสอบรายการขาย'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                <div className="p-4 border-b border-stone-800 bg-stone-900/50 flex justify-between items-center"><h3 className="font-bold text-stone-300">ประวัติการซื้อขายล่าสุด</h3><div className="text-xs text-stone-500">แสดง 20 รายการล่าสุด</div></div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-2"><History size={32} opacity={0.5} /><p>ยังไม่มีประวัติการซื้อขาย</p></div>
                                    ) : (
                                        <div className="divide-y divide-stone-800">
                                            {history.map(tx => (
                                                <div key={tx.id} className="p-4 hover:bg-stone-900 transition-colors flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${tx.type === 'MATERIAL_BUY' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500' : 'bg-red-900/20 border-red-500/30 text-red-500'}`}>{tx.type === 'MATERIAL_BUY' ? <ShoppingCart size={14} /> : <DollarSign size={14} />}</div>
                                                        <div>
                                                            <div className="text-sm font-bold text-stone-200 flex items-center gap-2">{tx.type === 'MATERIAL_BUY' ? 'ซื้อเข้า (Buy)' : 'ขายออก (Sell)'}<span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 rounded">{tx.description.split(':')[1]?.split('x')[0]?.trim()}</span></div>
                                                            <div className="text-xs text-stone-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`font-mono font-bold text-sm ${tx.type === 'MATERIAL_SELL' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.type === 'MATERIAL_SELL' ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
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
