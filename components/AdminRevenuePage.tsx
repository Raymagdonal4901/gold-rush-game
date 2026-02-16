import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    Hammer,
    Wallet,
    Zap,
    ShoppingBag,
    Calendar,
    ChevronRight,
    ArrowDownRight,
    Flame
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';
import { api } from '../services/api';
import { StatCard } from './StatCard';
import { CURRENCY } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';

interface RevenueData {
    totals: Record<string, number>;
    trend: { date: string, amount: number }[];
    recent: { id: string, username: string, type: string, amount: number, description: string, timestamp: number }[];
    volumes?: {
        bank_deposits: number;
        usdt_deposits: number;
        bank_withdrawals: number;
        usdt_withdrawals: number;
    };
}

export const AdminRevenuePage: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<RevenueData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.admin.getRevenueStats();
                setData(res);
            } catch (error) {
                console.error('Failed to fetch revenue stats', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                <p className="text-yellow-500 font-display animate-pulse uppercase tracking-widest text-sm">{t('admin_revenue.loading')}</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">{t('common.error')}</div>;

    const { totals, trend, recent } = data;

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-stone-900 border border-stone-800 p-3 rounded-lg shadow-2xl">
                    <p className="text-stone-500 text-[10px] uppercase font-bold mb-1">{label}</p>
                    <p className="text-yellow-500 font-mono font-bold">
                        {payload[0].value?.toLocaleString()} {CURRENCY}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        {t('admin_revenue.title')} <TrendingUp className="text-yellow-500" size={28} />
                    </h1>
                    <p className="text-stone-500 text-sm mt-1 uppercase tracking-wider font-medium">{t('admin_revenue.subtitle')}</p>
                </div>

                <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-2 rounded-lg">
                    <Calendar size={16} className="text-stone-500" />
                    <span className="text-xs text-stone-300 font-bold">{t('admin_revenue.last_7_days')}</span>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('admin_revenue.total_revenue')}
                    value={`${totals.total.toLocaleString()} ${CURRENCY}`}
                    icon={DollarSign}
                    color="text-yellow-500"
                    trend={{ value: 12.5, isPositive: true }}
                />
                <StatCard
                    title={t('admin_revenue.game_profits')}
                    value={`${totals.GAME_LOSS.toLocaleString()} ${CURRENCY}`}
                    icon={Flame}
                    color="text-purple-500"
                    trend={{ value: 8.2, isPositive: true }}
                />
                <StatCard
                    title={t('admin_revenue.system_fees')}
                    value={`${(totals.WITHDRAW_FEE + totals.MARKET_FEE + totals.REPAIR).toLocaleString()} ${CURRENCY}`}
                    icon={Zap}
                    color="text-blue-500"
                    trend={{ value: 3.1, isPositive: false }}
                />
                <StatCard
                    title={t('admin_revenue.net_profit')}
                    value={`${(totals.total * 0.95).toLocaleString()} ${CURRENCY}`}
                    icon={ArrowUpRight}
                    color="text-emerald-500"
                    trend={{ value: 15.7, isPositive: true }}
                />
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {t('admin_revenue.trend_title')} <span className="text-xs font-normal text-stone-500 uppercase tracking-widest">{t('admin_revenue.trend_weekly')}</span>
                    </h3>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#737373', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#737373', fontSize: 10 }}
                                dx={-10}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#eab308', strokeWidth: 1 }} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#eab308"
                                strokeWidth={3}
                                shadow="0 10px 15px -3px rgb(0 0 0 / 0.1)"
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Income Stream */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 bg-stone-900/50 border-b border-stone-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {t('admin_revenue.recent_stream')} <span className="text-xs font-normal text-stone-500 uppercase tracking-widest px-2 py-0.5 bg-stone-800 rounded-full">{t('admin_revenue.stream_live')}</span>
                    </h3>
                    <button className="text-stone-500 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-950 text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="p-4">{t('admin_revenue.tx_details')}</th>
                                <th className="p-4">{t('admin_revenue.tx_user')}</th>
                                <th className="p-4 text-center">{t('admin_revenue.tx_type')}</th>
                                <th className="p-4 text-right">{t('admin_revenue.tx_amount')}</th>
                                <th className="p-4 text-right">{t('admin_revenue.tx_time')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {recent.map((tx) => (
                                <tr key={tx.id} className="hover:bg-stone-800/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="text-sm text-stone-200 group-hover:text-white transition-colors">{tx.description}</div>
                                        <div className="text-[10px] text-stone-600 font-mono mt-0.5 uppercase tracking-wider">{tx.id.substring(0, 8)}...</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-400">
                                                {tx.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-stone-300">{tx.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tx.type === 'GAME_LOSS' ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' :
                                            tx.type === 'RIG_BUY' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400' :
                                                'bg-blue-900/20 border-blue-500/30 text-blue-400'
                                            }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-mono font-bold text-emerald-400">+{tx.amount.toLocaleString()}</div>
                                        <div className="text-[10px] text-stone-500">{CURRENCY}</div>
                                    </td>
                                    <td className="p-4 text-right text-stone-500 text-xs font-mono">
                                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
