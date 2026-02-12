
import React, { useState } from 'react';
import { X, Target, Trophy, Check, Star, Lock, Gift, Package, Coins, Medal, Sparkles, ChevronUp } from 'lucide-react';
import { QUESTS, ACHIEVEMENTS, CURRENCY, MATERIAL_CONFIG, SHOP_ITEMS, MINING_RANKS } from '../constants';
import { User } from '../services/types';
import { MaterialIcon } from './MaterialIcon';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

interface MissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onRefresh: () => void;
    addNotification?: (n: any) => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ isOpen, onClose, user, onRefresh, addNotification }) => {
    const { t, language, getLocalized } = useTranslation();
    const [activeTab, setActiveTab] = useState<'QUEST' | 'MASTERY'>('QUEST');
    const [weeklyStats, setWeeklyStats] = useState<any>(null);
    const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
    const [nextResetAt, setNextResetAt] = useState<number | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

    // Fetch quest status from API when modal opens
    React.useEffect(() => {
        if (isOpen) {
            fetchQuestStatus();
        }
    }, [isOpen]);

    const fetchQuestStatus = async () => {
        try {
            const data = await api.getQuestStatus();
            setWeeklyStats(data.weeklyStats);
            setClaimedQuests(data.claimedQuests);
            // Convert ISO string or Date to timestamp to avoid NaN in countdown
            const resetTime = data.nextResetAt ? new Date(data.nextResetAt).getTime() : null;
            setNextResetAt(resetTime);
            setHasFetched(true);
        } catch (error) {
            console.error('Failed to fetch quest status:', error);
        }
    };

    // Countdown Timer
    React.useEffect(() => {
        if (!isOpen || !nextResetAt) return;

        const updateTimer = () => {
            const now = Date.now();
            const diff = nextResetAt - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                fetchQuestStatus(); // Re-fetch if time is up
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            let timeStr = '';
            if (days > 0) timeStr += `${days} ${t('mission.day')} `;
            timeStr += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            setTimeLeft(timeStr);
        };

        const timerId = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(timerId);
    }, [isOpen, nextResetAt]);

    if (!isOpen) return null;

    if (!isOpen) return null;

    // Use API data if available, fall back to user stats (lifetime) for simplicity if loading
    // ideally, weekly quests should strictly use weeklyStats
    const currentStats = weeklyStats || {};
    const stats = user.stats || { totalMaterialsMined: 0, totalMoneySpent: 0, totalLogins: 0, luckyDraws: 0, questsCompleted: 0 };
    const masteryPoints = user.masteryPoints || 0;

    const handleClaimQuest = async (id: string) => {
        try {
            await api.claimQuestReward(id);
            // MockDB.claimQuest(user.id, id); // Deprecated
            fetchQuestStatus(); // Refresh local state
            onRefresh(); // Refresh parent user state (balance/points)
        } catch (e: any) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }
    };

    const handleClaimAchievement = async (id: string) => {
        try {
            await api.claimAchievement(id);
            onRefresh();
        } catch (e: any) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }
    };

    const handleClaimRank = async (id: string) => {
        try {
            await api.claimRankReward(id);
            // Removed alert('Claim Successful! Rewards added to inventory.');
            onRefresh();
        } catch (e: any) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: 'Error claiming reward: ' + (e.response?.data?.message || e.message),
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }
    };

    const getProgress = (target: number, type: string) => {
        // For Weekly Quests, use weeklyStats
        if (type === 'materials_crafted') return Math.min(currentStats.materialsCrafted || 0, target);
        if (type === 'spend') return Math.min(currentStats.moneySpent || 0, target);
        if (type === 'dungeon') return Math.min(currentStats.dungeonsEntered || 0, target);
        if (type === 'items_crafted') return Math.min(currentStats.itemsCrafted || 0, target);
        if (type === 'rare_loot') return Math.min(currentStats.rareLootCount || 0, target);
        if (type === 'repair') return Math.min(currentStats.repairAmount || 0, target);

        // Fallback for Achievements (Lifetime)
        if (type === 'login') return Math.min(stats.totalLogins, target);
        if (type === 'lucky') return Math.min(stats.luckyDraws, target);
        // ... mixed logic for other types if needed, but primarily weekly quests use weeklyStats

        return 0;
    };

    const renderReward = (quest: any) => {
        if (quest.rewardType === 'money') {
            return <div className="text-emerald-400 font-mono font-bold mb-2 flex items-center justify-center gap-1"><Coins size={14} /> +{quest.rewardAmount} {CURRENCY}</div>;
        }
        if (quest.rewardType === 'material') {
            return (
                <div className="text-stone-300 font-bold mb-2 flex items-center justify-center gap-1">
                    <MaterialIcon id={Number(quest.rewardId)} size="w-5 h-5" iconSize={12} />
                    <span className="text-xs">x{quest.rewardAmount}</span>
                </div>
            );
        }
        if (quest.rewardType === 'points') {
            return (
                <div className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-1 text-xs">
                    <Star size={14} fill="currentColor" /> {quest.rewardAmount} {t('mission.points_unit')}
                </div>
            );
        }
        if (quest.rewardType === 'item') {
            const item = SHOP_ITEMS.find(i => i.id === quest.rewardId);
            return (
                <div className="text-purple-400 font-bold mb-2 flex items-center justify-center gap-1 text-xs truncate">
                    <Gift size={14} /> {getLocalized(item?.name)} x{quest.rewardAmount}
                </div>
            );
        }
        return null;
    };

    const renderMasteryProgress = () => {
        // Find current rank index
        let currentRankIdx = -1;
        for (let i = MINING_RANKS.length - 1; i >= 0; i--) {
            if (masteryPoints >= MINING_RANKS[i].points) {
                currentRankIdx = i;
                break;
            }
        }

        const nextRank = MINING_RANKS[currentRankIdx + 1];
        const maxPoints = nextRank ? nextRank.points : MINING_RANKS[MINING_RANKS.length - 1].points;
        const progressPercent = Math.min(100, (masteryPoints / maxPoints) * 100);

        return (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Trophy size={150} /></div>

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{t('mission.mastery_title')}</h3>
                        <p className="text-stone-400 text-sm">{t('mission.mastery_subtitle')}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-yellow-500">{masteryPoints}</div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">{t('mission.total_points')}</div>
                    </div>
                </div>

                <div className="relative h-4 bg-stone-950 rounded-full border border-stone-800 overflow-hidden mb-2">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>

                <div className="flex justify-between text-xs text-stone-500 font-bold">
                    <span>0</span>
                    {nextRank && <span>{t('mission.next_rank')}: {getLocalized(nextRank.label)} ({nextRank.points})</span>}
                    {!nextRank && <span>{t('mission.max_rank')}</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-900/20 p-2 rounded text-blue-500">
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('mission.title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{t('mission.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-stone-800 shrink-0">
                    <button
                        onClick={() => setActiveTab('QUEST')}
                        className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'QUEST' ? 'bg-stone-800 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        {t('mission.weekly_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('MASTERY')}
                        className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'MASTERY' ? 'bg-stone-800 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        {t('mission.mastery_tab')}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-950/50">
                    {activeTab === 'QUEST' ? (
                        <div className="space-y-4">
                            {/* Reset Timer Info */}
                            <div className="flex justify-between items-center bg-blue-900/10 border border-blue-500/30 p-3 rounded-xl mb-2">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Sparkles size={16} className="animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{t('mission.reset_note')}</span>
                                </div>
                                <div className="text-right min-w-fit">
                                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">{t('mission.reset_in')}</div>
                                    <div className="text-base sm:text-lg font-mono font-bold text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] whitespace-nowrap">{timeLeft}</div>
                                </div>
                            </div>
                            {/* Weekly Quests */}
                            {QUESTS.map(quest => {
                                const progress = getProgress(quest.target, quest.type);
                                const percent = Math.min(100, (progress / quest.target) * 100);
                                const isClaimed = claimedQuests.includes(quest.id);
                                const canClaim = percent >= 100 && !isClaimed;

                                return (
                                    <div key={quest.id} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex items-center gap-4">
                                        <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 text-blue-500">
                                            <Target size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{getLocalized(quest.title)}</h4>
                                            <p className="text-xs text-stone-400 mb-2">{getLocalized(quest.desc)}</p>
                                            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <div className="text-[10px] text-right mt-1 text-stone-500">{progress} / {quest.target}</div>
                                        </div>
                                        <div className="w-28 text-center flex flex-col justify-end">
                                            {renderReward(quest)}
                                            <button
                                                onClick={() => handleClaimQuest(quest.id)}
                                                disabled={!canClaim}
                                                className={`w-full py-1.5 rounded text-xs font-bold uppercase transition-all
                                            ${isClaimed ? 'bg-stone-800 text-stone-500 cursor-default' :
                                                        canClaim ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
                                        `}
                                            >
                                                {isClaimed ? t('mission.claimed') : t('mission.claim')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="h-px bg-stone-800 my-4"></div>
                            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">{t('mission.achievements')}</h3>

                            {/* Achievements */}
                            {ACHIEVEMENTS.map(ach => {
                                const progress = getProgress(ach.target, ach.type);
                                const percent = Math.min(100, (progress / ach.target) * 100);
                                const isClaimed = user.claimedAchievements?.includes(ach.id);
                                const canClaim = percent >= 100 && !isClaimed;

                                return (
                                    <div key={ach.id} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex items-center gap-4 relative overflow-hidden">
                                        <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 text-purple-500 z-10">
                                            <Trophy size={24} />
                                        </div>
                                        <div className="flex-1 z-10">
                                            <h4 className="font-bold text-white">{getLocalized(ach.title)}</h4>
                                            <p className="text-xs text-stone-400 mb-2">{getLocalized(ach.desc)}</p>
                                            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <div className="text-[10px] text-right mt-1 text-stone-500">{progress} / {ach.target}</div>
                                        </div>
                                        <div className="w-28 text-center z-10">
                                            <div className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-1 text-xs">
                                                <Star size={14} fill="currentColor" /> {ach.points} {t('mission.points_unit')}
                                            </div>
                                            <button
                                                onClick={() => handleClaimAchievement(ach.id)}
                                                disabled={!canClaim}
                                                className={`w-full py-1.5 rounded text-xs font-bold uppercase transition-all
                                            ${isClaimed ? 'bg-stone-800 text-stone-500 cursor-default' :
                                                        canClaim ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
                                        `}
                                            >
                                                {isClaimed ? t('mission.claimed') : t('mission.claim')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            {renderMasteryProgress()}

                            <div className="space-y-4">
                                {MINING_RANKS.map((rank) => {
                                    const isUnlocked = masteryPoints >= rank.points;
                                    const isClaimed = user.claimedRanks?.includes(rank.id);
                                    // If rank has a rewardId, it's claimable. If null, it's a passive buff.
                                    const isPassive = !rank.rewardId;

                                    let rankColor = 'text-stone-400';
                                    let iconColor = 'text-stone-600';
                                    let border = 'border-stone-800';
                                    if (rank.id === 'bronze') { rankColor = 'text-orange-300'; iconColor = 'text-orange-400'; border = 'border-orange-900/30'; }
                                    if (rank.id === 'silver') { rankColor = 'text-stone-300'; iconColor = 'text-stone-300'; border = 'border-stone-600/30'; }
                                    if (rank.id === 'gold') { rankColor = 'text-yellow-400'; iconColor = 'text-yellow-500'; border = 'border-yellow-700/30'; }
                                    if (rank.id === 'platinum') { rankColor = 'text-cyan-300'; iconColor = 'text-cyan-400'; border = 'border-cyan-900/30'; }
                                    if (rank.id === 'diamond') { rankColor = 'text-purple-300'; iconColor = 'text-purple-400'; border = 'border-purple-900/30'; }

                                    return (
                                        <div key={rank.id} className={`p-4 rounded-xl border ${isUnlocked ? `bg-stone-900 ${border}` : 'bg-stone-950 border-stone-800 opacity-60'} flex items-center gap-4 transition-all`}>
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 border-stone-800 bg-stone-950 shadow-lg ${isUnlocked ? iconColor : 'text-stone-700'}`}>
                                                <Medal size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-bold uppercase tracking-wider ${isUnlocked ? rankColor : 'text-stone-500'}`}>{getLocalized(rank.label)}</h4>
                                                    {isUnlocked && <span className="bg-stone-800 text-stone-400 text-[10px] px-2 py-0.5 rounded font-bold">{rank.points} Pts</span>}
                                                </div>
                                                <p className="text-xs text-stone-400 mt-1">{getLocalized(rank.desc)}</p>
                                                {!isUnlocked && <p className="text-[10px] text-red-400 mt-1">{t('mission.points_needed').replace('{points}', rank.points.toString())}</p>}
                                            </div>
                                            <div className="w-28 text-center">
                                                {isPassive ? (
                                                    <div className={`text-xs font-bold py-2 rounded border ${isUnlocked ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-stone-900 text-stone-600 border-stone-800'}`}>
                                                        {isUnlocked ? <><Check size={12} className="inline mr-1" /> {t('mission.active')}</> : <><Lock size={12} className="inline mr-1" /> {t('mission.locked')}</>}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleClaimRank(rank.id)}
                                                        disabled={!isUnlocked || isClaimed}
                                                        className={`w-full py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1
                                                    ${isClaimed ? 'bg-stone-800 text-stone-500 cursor-default' :
                                                                isUnlocked ? 'bg-yellow-600 text-white hover:bg-yellow-500 shadow-lg' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
                                                `}
                                                    >
                                                        {isClaimed ? t('mission.claimed') : t('mission.claim')}
                                                    </button>
                                                )}
                                                {rank.buff && isUnlocked && (
                                                    <div className="text-[9px] text-emerald-500 mt-1 font-bold animate-pulse">{t('mission.buff_active')}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
