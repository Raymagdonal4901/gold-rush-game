
import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, TrendingUp, Gift, Truck, FileText, Monitor, Key, Smartphone, Diamond, Glasses, Cpu, Footprints, Wrench, Hourglass } from 'lucide-react';
import { CURRENCY } from '../constants';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
    const { t, language } = useTranslation();
    const [leaders, setLeaders] = useState<{ id: string, username: string, dailyIncome: number, rank: number }[]>([]);
    const [activeTab, setActiveTab] = useState<'RANKING' | 'REWARDS'>('RANKING');

    useEffect(() => {
        if (isOpen) {
            api.getLeaderboard().then(data => {
                setLeaders(data);
            }).catch(err => {
                console.error("Failed to fetch leaderboard", err);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown size={20} className="text-yellow-400 fill-yellow-400/20" />;
            case 2: return <Medal size={20} className="text-stone-300 fill-stone-300/20" />;
            case 3: return <Medal size={20} className="text-orange-400 fill-orange-400/20" />;
            default: return <span className="text-stone-500 font-bold w-5 text-center">{rank}</span>;
        }
    };

    const getRowStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-yellow-900/40 to-stone-900 border-yellow-700/50";
        if (rank === 2) return "bg-gradient-to-r from-stone-800/60 to-stone-900 border-stone-600/50";
        if (rank === 3) return "bg-gradient-to-r from-orange-900/30 to-stone-900 border-orange-800/50";
        return "bg-stone-900 border-stone-800 hover:bg-stone-800/50";
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-900/20 p-2 rounded text-yellow-500">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('leaderboard.title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">Top 10 Mining Empire</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-800 shrink-0">
                    <button
                        onClick={() => setActiveTab('RANKING')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'RANKING' ? 'bg-stone-800 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}
                    >
                        {t('leaderboard.ranking_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('REWARDS')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'REWARDS' ? 'bg-stone-800 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}
                    >
                        <Gift size={14} className="inline mr-1 mb-0.5" />
                        {t('leaderboard.rewards_tab')}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'RANKING' ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] space-y-2">
                        {leaders.length === 0 ? (
                            <div className="text-center py-10 text-stone-500">{t('leaderboard.no_data')}</div>
                        ) : (
                            leaders.map((player) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getRowStyle(player.rank)}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 flex justify-center shrink-0">
                                            {getRankIcon(player.rank)}
                                        </div>
                                        <div className="font-bold text-stone-200">
                                            {player.username}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-emerald-400 font-mono font-bold">
                                            <TrendingUp size={12} />
                                            {player.dailyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-[10px] text-stone-500">{CURRENCY}{t('common.per_day')}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-stone-950/50 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center border-2 border-dashed border-stone-800">
                            <Gift size={32} className="text-stone-700" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-stone-300">Coming soon</h3>
                            <p className="text-sm text-stone-500 max-w-[200px]">
                                {language === 'th' ? 'เตรียมพบกับระบบรางวัลเร็วๆ นี้' : 'Stay tuned for weekly prize pool updates.'}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'RANKING' && (
                    <div className="p-4 bg-stone-900/80 border-t border-stone-800 text-center text-[10px] text-stone-500">
                        {t('leaderboard.ranking_desc')}
                    </div>
                )}

            </div>
        </div>
    );
};
