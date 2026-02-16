
import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, TrendingUp, Gift, Zap, Pickaxe } from 'lucide-react';
import { MINING_VOLATILITY_CONFIG } from '../constants';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface LeaderEntry {
    id: string;
    username: string;
    dailyIncome: number;
    rigCount: number;
    aceRig: { tierId: number; name: any } | null;
    rank: number;
}

// Tier color mapping for "Ace Machine" badges
const TIER_STYLES: Record<number, { bg: string; border: string; text: string; label: string }> = {
    1: { bg: 'bg-stone-800', border: 'border-stone-600', text: 'text-stone-300', label: 'Starter' },
    2: { bg: 'bg-blue-950', border: 'border-blue-700', text: 'text-blue-300', label: 'Common' },
    3: { bg: 'bg-green-950', border: 'border-green-700', text: 'text-green-300', label: 'Uncommon' },
    4: { bg: 'bg-orange-950', border: 'border-orange-600', text: 'text-orange-300', label: 'Rare' },
    5: { bg: 'bg-slate-900', border: 'border-slate-500', text: 'text-slate-300', label: 'Epic' },
    6: { bg: 'bg-yellow-950', border: 'border-yellow-600', text: 'text-yellow-300', label: 'Legendary' },
    7: { bg: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-300', label: 'Mythical' },
    8: { bg: 'bg-purple-950', border: 'border-purple-500', text: 'text-purple-300', label: 'God' },
    9: { bg: 'bg-emerald-950', border: 'border-emerald-700', text: 'text-emerald-400', label: 'Glove' },
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
    const { t, language, formatCurrency } = useTranslation();
    const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'RANKING' | 'REWARDS'>('RANKING');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.getLeaderboard().then(data => {
                setLeaders(data);
            }).catch(err => {
                console.error("Failed to fetch leaderboard", err);
            }).finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown size={22} className="text-yellow-400 fill-yellow-400/30 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" />;
            case 2: return <Medal size={20} className="text-stone-300 fill-stone-300/20" />;
            case 3: return <Medal size={20} className="text-orange-400 fill-orange-400/20" />;
            default: return <span className="text-stone-500 font-mono font-bold text-sm w-6 text-center">{rank}</span>;
        }
    };

    const getRowStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-yellow-900/50 via-yellow-800/20 to-stone-900 border-yellow-600/60 shadow-[0_0_20px_rgba(250,204,21,0.08)]";
        if (rank === 2) return "bg-gradient-to-r from-stone-700/40 to-stone-900 border-stone-500/50 shadow-[0_0_10px_rgba(168,162,158,0.05)]";
        if (rank === 3) return "bg-gradient-to-r from-orange-900/30 to-stone-900 border-orange-700/40 shadow-[0_0_10px_rgba(234,88,12,0.05)]";
        return "bg-stone-900/60 border-stone-800/60 hover:bg-stone-800/40";
    };

    const getAvatarBorder = (rank: number) => {
        if (rank === 1) return "ring-2 ring-yellow-500 shadow-[0_0_12px_rgba(250,204,21,0.3)]";
        if (rank === 2) return "ring-2 ring-stone-400";
        if (rank === 3) return "ring-2 ring-orange-500";
        return "ring-1 ring-stone-700";
    };

    const getRigName = (aceRig: { tierId: number; name: any } | null) => {
        if (!aceRig) return t('leaderboard.no_rig');
        if (typeof aceRig.name === 'object' && aceRig.name) {
            return aceRig.name[language] || aceRig.name.en || aceRig.name.th || 'Unknown';
        }
        return aceRig.name || 'Unknown';
    };

    const getPower = (aceRig: { tierId: number; name: any } | null, rigCount: number) => {
        if (!aceRig || rigCount === 0) return 0;
        const config = MINING_VOLATILITY_CONFIG[aceRig.tierId];
        if (!config) return 0;
        return config.hashrateMax;
    };

    const getTierBadge = (aceRig: { tierId: number; name: any } | null) => {
        if (!aceRig) return (
            <span className="text-[10px] text-stone-600 font-mono">—</span>
        );
        const style = TIER_STYLES[aceRig.tierId] || TIER_STYLES[1];
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${style.bg} ${style.border} border text-[10px] font-bold ${style.text} uppercase tracking-wider`}>
                <Pickaxe size={10} />
                <span>T{aceRig.tierId}</span>
            </div>
        );
    };

    // Rewards data for the rewards tab
    const rewardTiers = [
        { rank: '🥇 1', titleKey: 'leaderboard.reward_rank_1', descKey: 'leaderboard.reward_desc_1', gradient: 'from-yellow-900/40 to-stone-900', border: 'border-yellow-700/50', icon: <Crown size={20} className="text-yellow-400" /> },
        { rank: '🥈 2', titleKey: 'leaderboard.reward_rank_2', descKey: 'leaderboard.reward_desc_2', gradient: 'from-stone-700/30 to-stone-900', border: 'border-stone-600/50', icon: <Medal size={20} className="text-stone-300" /> },
        { rank: '🥉 3', titleKey: 'leaderboard.reward_rank_3', descKey: 'leaderboard.reward_desc_3', gradient: 'from-orange-900/30 to-stone-900', border: 'border-orange-700/40', icon: <Medal size={20} className="text-orange-400" /> },
        { rank: '4-10', titleKey: 'leaderboard.reward_rank_other', descKey: 'leaderboard.reward_desc_other', gradient: 'from-stone-800/30 to-stone-900', border: 'border-stone-700/40', icon: <Gift size={20} className="text-stone-400" /> },
    ];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-stone-900 via-stone-900 to-yellow-950/30 p-5 border-b border-stone-800 flex justify-between items-center shrink-0 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/30 p-2.5 rounded-xl text-yellow-500 border border-yellow-800/30">
                            <Trophy size={26} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white tracking-tight">{t('leaderboard.title')}</h2>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Top 10 Mining Empire</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors bg-stone-900/50 p-2 rounded-lg hover:bg-stone-800 relative z-10">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-800 shrink-0">
                    <button
                        onClick={() => setActiveTab('RANKING')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'RANKING' ? 'bg-stone-800/50 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}
                    >
                        <Trophy size={13} className="inline mr-1.5 mb-0.5" />
                        {t('leaderboard.ranking_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('REWARDS')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'REWARDS' ? 'bg-stone-800/50 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}
                    >
                        <Gift size={13} className="inline mr-1.5 mb-0.5" />
                        {t('leaderboard.rewards_tab')}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'RANKING' ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                            </div>
                        ) : leaders.length === 0 ? (
                            <div className="text-center py-10 text-stone-500">{t('leaderboard.no_data')}</div>
                        ) : (
                            leaders.map((player) => (
                                <div
                                    key={player.id}
                                    className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${getRowStyle(player.rank)} ${player.rank === 1 ? 'p-4' : 'p-3'}`}
                                >
                                    {/* Champion Shimmer Effect */}
                                    {player.rank === 1 && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse pointer-events-none"></div>
                                    )}

                                    <div className="relative z-10 flex items-center gap-3">
                                        {/* Rank */}
                                        <div className="w-8 flex justify-center shrink-0">
                                            {getRankIcon(player.rank)}
                                        </div>

                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className={`w-9 h-9 rounded-full ${getAvatarBorder(player.rank)} flex items-center justify-center bg-gradient-to-br from-stone-700 to-stone-800 shrink-0 text-sm font-bold text-stone-300 uppercase`}>
                                                {player.username.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className={`font-bold truncate ${player.rank === 1 ? 'text-yellow-200 text-base' : 'text-stone-200 text-sm'}`}>
                                                    {player.username}
                                                    {player.rank === 1 && <span className="ml-1.5 text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">{t('leaderboard.champion')}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {getTierBadge(player.aceRig)}
                                                    {player.rigCount > 0 && (
                                                        <span className="text-[10px] text-stone-500 font-mono">{t('leaderboard.rigs_count').replace('{count}', String(player.rigCount))}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {/* Power */}
                                            {player.aceRig && (
                                                <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                                                    <Zap size={10} className="fill-cyan-400/30" />
                                                    {getPower(player.aceRig, player.rigCount)} MH/s
                                                </div>
                                            )}
                                            {/* Income */}
                                            <div className={`flex items-center gap-1 font-mono font-bold ${player.rank === 1 ? 'text-emerald-400 text-sm' : 'text-emerald-400/80 text-xs'}`}>
                                                <TrendingUp size={11} />
                                                {formatCurrency(player.dailyIncome)}
                                            </div>
                                            <div className="text-[9px] text-stone-600 font-mono">{t('leaderboard.per_day')}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* Rewards Tab */
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {/* Info Banner */}
                        <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="p-1.5 bg-yellow-900/20 rounded-lg text-yellow-500 shrink-0 mt-0.5">
                                <Gift size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-stone-400 leading-relaxed">{t('leaderboard.weekly_reward_desc')}</p>
                                <p className="text-[10px] text-stone-600 mt-1 font-mono">{t('leaderboard.reset_time')}</p>
                            </div>
                        </div>

                        {/* Reward Tiers */}
                        {rewardTiers.map((tier, idx) => (
                            <div key={idx} className={`bg-gradient-to-r ${tier.gradient} border ${tier.border} rounded-xl p-4 transition-all`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {tier.icon}
                                    <h4 className="text-sm font-bold text-white">{t(tier.titleKey)}</h4>
                                </div>
                                <div className="ml-8 flex flex-wrap gap-2">
                                    <span className="text-xs text-stone-300 bg-stone-800/50 px-2.5 py-1 rounded-lg border border-stone-700/50">
                                        {t(tier.descKey)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'RANKING' && (
                    <div className="p-3 bg-stone-900/80 border-t border-stone-800 text-center text-[10px] text-stone-500 font-mono">
                        {t('leaderboard.ranking_desc')}
                    </div>
                )}

            </div>
        </div>
    );
};
