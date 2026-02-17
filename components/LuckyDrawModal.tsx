
import React, { useState, useEffect } from 'react';
import { X, Trophy, RefreshCw, Zap, Wallet, Box, Sparkles, Star, Pickaxe, Hammer } from 'lucide-react';
import { LUCKY_DRAW_CONFIG, CURRENCY, EXCHANGE_RATE_USD_THB } from '../constants';
import { api } from '../services/api';
import { User } from '../services/types';
import { useTranslation } from '../contexts/LanguageContext';

interface LuckyDrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onRefresh: () => void;
    addNotification?: (n: any) => void;
}

export const LuckyDrawModal: React.FC<LuckyDrawModalProps> = ({ isOpen, onClose, user, onRefresh, addNotification }) => {
    const { t, language, getLocalized, formatCurrency } = useTranslation();
    const [gameState, setGameState] = useState<'IDLE' | 'MINING' | 'REVEALED'>('IDLE');
    const [rocks, setRocks] = useState<number[]>([0, 1, 2, 3, 4]);
    const [selectedRock, setSelectedRock] = useState<number | null>(null);
    const [reward, setReward] = useState<{ label: any, type: string, amount?: number } | null>(null);
    const [canPlayFree, setCanPlayFree] = useState(false);
    const [wasFreePlay, setWasFreePlay] = useState(false);
    const [showResultPopup, setShowResultPopup] = useState(false);

    useEffect(() => {
        if (isOpen) {
            resetGame();
        }
    }, [isOpen]);

    useEffect(() => {
        const checkFree = () => {
            const now = Date.now();
            const last = user.lastLuckyDraw || 0;
            setCanPlayFree((now - last) > LUCKY_DRAW_CONFIG.FREE_COOLDOWN_MS);
        };
        checkFree();
        const timer = setInterval(checkFree, 60000); // Check every minute
        return () => clearInterval(timer);
    }, [user.lastLuckyDraw]);

    const resetGame = () => {
        setGameState('IDLE');
        setSelectedRock(null);
        setReward(null);
        setShowResultPopup(false);
        setRocks([0, 1, 2, 3, 4]);
    };

    const handleStart = () => {
        if (canPlayFree) {
            setWasFreePlay(true);
        } else {
            if (user.balance < LUCKY_DRAW_CONFIG.COST) {
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: user.id,
                    message: t('lucky_draw.insufficient_funds'),
                    type: 'ERROR',
                    read: false,
                    timestamp: Date.now()
                });
                return;
            }
            setWasFreePlay(false);
        }
        setGameState('MINING');
    };

    const handleMineRock = async (index: number) => {
        if (gameState !== 'MINING') return;

        setSelectedRock(index);

        try {
            const res = await api.playLuckyDraw();
            if (res.success) {
                // Delay to simulate mining action
                setTimeout(() => {
                    setReward({
                        label: res.label,
                        type: res.reward.type,
                        amount: res.reward.amount
                    });
                    onRefresh();
                    if (wasFreePlay) {
                        setCanPlayFree(false);
                    }
                    setGameState('REVEALED');

                    // Show result popup
                    setTimeout(() => {
                        setShowResultPopup(true);
                    }, 250);
                }, 500); // 0.5s mining animation
            }
        } catch (e: any) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
            resetGame();
        }
    };

    if (!isOpen) return null;

    const renderRewardIcon = (type: string, size: number = 40) => {
        switch (type) {
            case 'money': return <Wallet size={size} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />;
            case 'energy': return <Zap size={size} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
            case 'material': return <Box size={size} className="text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]" />;
            case 'item': return <Box size={size} className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />;
            case 'repair_kit': return <Hammer size={size} className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />;
            default: return <Sparkles size={size} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />;
        }
    };

    return (
        <>
            {/* Main Game Modal */}
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
                <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative ring-1 ring-white/10">

                    {/* Header with Premium Gradient */}
                    <div className="bg-gradient-to-r from-stone-900 via-yellow-900/10 to-stone-950 p-3 sm:p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-yellow-900/20 p-2 sm:p-2.5 rounded-xl border border-yellow-700/30 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                <Pickaxe size={20} className="sm:w-6 sm:h-6 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase tracking-widest leading-tight">
                                    {t('lucky_draw.title')}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">{t('lucky_draw.subtitle')}</span>
                                    <span className="bg-yellow-500/10 text-yellow-500 text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-500/20 font-black animate-pulse">
                                        WIN 500 ฿!
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-[10px] text-stone-500 uppercase font-black">{t('wallet.balance_label')}</span>
                                <span className="text-sm font-mono font-black text-emerald-400 leading-none">{formatCurrency(user.balance)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Area - Cave Background */}
                    <div className="flex-1 flex flex-col items-center justify-center relative p-3 sm:p-6 min-h-[400px] sm:min-h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black">

                        {/* Ambient Particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-500 rounded-full animate-ping"></div>
                            <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-yellow-600 rounded-full animate-ping delay-700"></div>
                            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
                        </div>

                        {/* Probabilities Table (Styled as Tablet/Hologram) */}
                        <div className="bg-stone-900/80 border border-stone-700 rounded-xl p-2 sm:p-3 shadow-2xl mb-4 sm:mb-8 transform hover:scale-105 transition-transform duration-300 w-full max-w-sm">
                            <h4 className="font-bold text-stone-300 text-[8px] sm:text-[10px] uppercase tracking-widest mb-1.5 sm:mb-2 border-b border-stone-700 pb-1 flex items-center gap-2">
                                <Sparkles size={8} className="sm:w-2.5 sm:h-2.5 text-yellow-500" />
                                {t('lucky_draw.chance_label')}
                            </h4>
                            <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1">
                                {LUCKY_DRAW_CONFIG.PROBABILITIES.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center text-[8px] sm:text-[10px] group">
                                        <span className="text-stone-400 group-hover:text-stone-200 transition-colors truncate mr-1.5 sm:mr-2">{getLocalized(p.label)}</span>
                                        <span className="font-mono text-yellow-500 font-bold shrink-0">{p.chance}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Geode Grid */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-3xl px-4 z-10">
                            {rocks.map((idx) => {
                                const isSelected = selectedRock === idx;
                                const isOther = selectedRock !== null && !isSelected;
                                const canMine = gameState === 'MINING';
                                const colors = [
                                    { fill: 'fill-stone-800', stroke: 'stroke-stone-600', glow: 'bg-yellow-500' },
                                    { fill: 'fill-rose-950', stroke: 'stroke-rose-800', glow: 'bg-rose-500' },
                                    { fill: 'fill-indigo-950', stroke: 'stroke-indigo-800', glow: 'bg-indigo-500' },
                                    { fill: 'fill-emerald-950', stroke: 'stroke-emerald-800', glow: 'bg-emerald-500' },
                                    { fill: 'fill-amber-950', stroke: 'stroke-amber-800', glow: 'bg-amber-500' }
                                ];
                                const color = colors[idx % colors.length];

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => canMine && handleMineRock(idx)}
                                        className={`
                                            relative w-20 h-20 sm:w-28 sm:h-28 transition-all duration-300
                                            ${canMine ? 'cursor-pointer hover:scale-110 active:scale-95 group' : 'cursor-default'}
                                            ${isSelected ? 'scale-110' : ''}
                                            ${isOther ? 'opacity-30 blur-sm scale-90 grayscale' : ''}
                                        `}
                                    >
                                        {/* Cursor for Mining */}
                                        {canMine && (
                                            <div className="absolute -top-6 -right-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none drop-shadow-lg transform group-hover:rotate-12">
                                                <Hammer size={48} className="fill-stone-300 text-stone-900" />
                                            </div>
                                        )}

                                        {/* Geode/Rock Graphic */}
                                        <div className={`
                                            w-full h-full relative flex items-center justify-center
                                            ${isSelected ? 'animate-rumble' : ''}
                                        `}>
                                            {!isSelected || !reward ? (
                                                /* Unbroken Geode */
                                                <div className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                                                    <svg viewBox="0 0 100 100" className={`w-full h-full ${color.fill} ${color.stroke} stroke-2 overflow-visible`}>
                                                        <path d="M50 5 L85 25 L95 65 L65 95 L35 95 L5 65 L15 25 Z" className={`${color.fill} ${color.stroke}`} />
                                                        <path d="M30 30 L70 30 L80 60 L60 85 L40 85 L20 60 Z" className="fill-stone-700/50 stroke-none" />
                                                        {/* Cracks appear on hover if actionable */}
                                                        {canMine && <path d="M40 40 L50 55 L60 45" className="stroke-white/30 fill-none stroke-[0.5] opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                    </svg>
                                                    {/* Glow effect behind */}
                                                    <div className={`absolute inset-0 ${color.glow}/0 group-hover:${color.glow}/10 rounded-full blur-2xl transition-all duration-300`}></div>
                                                </div>
                                            ) : (
                                                /* Broken Geode / Reward Placeholder - actually handled by popup, but we show empty shell here */
                                                <div className="w-full h-full opacity-50 scale-110 transition-all duration-500">
                                                    <svg viewBox="0 0 100 100" className={`w-full h-full ${color.fill} ${color.stroke} stroke-2`}>
                                                        <path d="M5 65 L35 95 L65 95 L95 65 L50 50 Z" /> {/* Bottom shards */}
                                                        <path d="M50 5 L15 25 L50 50 L85 25 Z" className="-translate-y-4 opacity-0" /> {/* Top shards (gone) */}
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="mt-8 h-24 flex items-center justify-center z-20">
                            {gameState === 'IDLE' && (
                                <button
                                    onClick={handleStart}
                                    disabled={!canPlayFree && user.balance < LUCKY_DRAW_CONFIG.COST}
                                    className={`
                                        relative overflow-hidden px-8 py-3.5 sm:px-12 sm:py-5 rounded-2xl font-black text-base sm:text-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-2
                                        ${canPlayFree
                                            ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-400 text-white hover:brightness-110 shadow-emerald-900/50'
                                            : user.balance < LUCKY_DRAW_CONFIG.COST
                                                ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                                                : 'bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-400 text-white hover:brightness-110 shadow-yellow-900/50'}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                    <div className="relative flex items-center gap-3">
                                        {canPlayFree ? (
                                            <>
                                                <Sparkles className="text-emerald-200 animate-pulse w-5 h-5 sm:w-6 sm:h-6" />
                                                <span>{t('lucky_draw.free_spin')}</span>
                                            </>
                                        ) : (
                                            <>
                                                {user.balance < LUCKY_DRAW_CONFIG.COST ? (
                                                    <span>{t('lucky_draw.insufficient_funds')}</span>
                                                ) : (
                                                    <>
                                                        <Wallet className="text-yellow-200 w-5 h-5 sm:w-6 sm:h-6" />
                                                        <span>Spin 10 ฿</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </button>
                            )}

                            {gameState === 'MINING' && (
                                <div className="flex flex-col items-center animate-bounce-slow">
                                    <div className="text-yellow-400 font-display text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                                        {t('lucky_draw.pick_card').replace('Card', 'Geode')}
                                    </div>
                                    <p className="text-stone-400 text-xs sm:text-sm mt-1 font-bold bg-black/50 px-4 py-1 rounded-full border border-stone-700">Select a rock to crack open!</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Result Popup Overlay - Premium Reveal */}
            {showResultPopup && reward && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md p-10 text-center flex flex-col items-center animate-in zoom-in-50 duration-500">

                        {/* Background Burst FX */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.yellow.600),transparent_70%)] opacity-20 blur-3xl animate-pulse pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,theme(colors.yellow.500)_20deg,transparent_40deg,theme(colors.yellow.500)_60deg,transparent_80deg)] opacity-10 animate-[spin_8s_linear_infinite] rounded-full pointer-events-none"></div>

                        {/* Orb Container */}
                        <div className="relative mb-8 scale-150">
                            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 rounded-full animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-stone-800 to-black p-6 rounded-full border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] ring-4 ring-yellow-500/20">
                                {renderRewardIcon(reward.type, 64)}
                            </div>
                        </div>

                        <h2 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] mb-4 uppercase tracking-tighter">
                            {reward.type === 'money' ? t('lucky_draw.win_money') : t('lucky_draw.win_reward')}
                        </h2>

                        <div className="text-3xl font-black text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                            {getLocalized(reward.label)}
                        </div>

                        {reward.amount && (
                            <div className="text-stone-400 font-bold uppercase tracking-widest text-sm mb-10 border-t border-stone-800 pt-2 mt-2 w-full max-w-[200px]">
                                {t('common.received')}
                            </div>
                        )}

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={resetGame}
                                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-black rounded-xl border-t border-yellow-400 shadow-lg transform hover:-translate-y-1 transition-all"
                            >
                                {t('lucky_draw.play_again')}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-stone-500 hover:text-white font-bold rounded-xl hover:bg-white/5 transition-all"
                            >
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes rumble {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(-2px, 2px) rotate(-1deg); }
                    50% { transform: translate(2px, -2px) rotate(1deg); }
                    75% { transform: translate(-2px, -2px) rotate(-1deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                .animate-rumble { animation: rumble 0.3s linear infinite; }
            `}</style>
        </>
    );
};
