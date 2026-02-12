
import React, { useState, useEffect } from 'react';
import { X, Dices, RefreshCw, Zap, Wallet, Box, Sparkles, Star } from 'lucide-react';
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
    const [gameState, setGameState] = useState<'IDLE' | 'SHUFFLING' | 'PICKING' | 'REVEALED'>('IDLE');
    const [cards, setCards] = useState<number[]>([0, 1, 2, 3, 4]);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [reward, setReward] = useState<{ label: any, type: string, amount?: number } | null>(null);
    const [canPlayFree, setCanPlayFree] = useState(false);
    const [showResultPopup, setShowResultPopup] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const now = Date.now();
            const last = user.lastLuckyDraw || 0;
            setCanPlayFree((now - last) > LUCKY_DRAW_CONFIG.FREE_COOLDOWN_MS);
            resetGame();
        }
    }, [isOpen, user]);

    const resetGame = () => {
        setGameState('IDLE');
        setSelectedCard(null);
        setReward(null);
        setShowResultPopup(false);
        setCards([0, 1, 2, 3, 4]);
    };

    const handleStart = () => {
        if (!canPlayFree && user.balance < LUCKY_DRAW_CONFIG.COST) {
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
        setGameState('SHUFFLING');
        setTimeout(() => {
            setGameState('PICKING');
        }, 1500); // Shuffling animation time
    };

    const handlePickCard = async (index: number) => {
        if (gameState !== 'PICKING') return;

        setSelectedCard(index);

        try {
            const res = await api.playLuckyDraw();
            if (res.success) {
                setReward({
                    label: res.label,
                    type: res.reward.type,
                    amount: res.reward.amount
                });
                onRefresh();
                setCanPlayFree(false);
                setGameState('REVEALED');

                // Show the big popup slightly after card flips
                setTimeout(() => {
                    setShowResultPopup(true);
                }, 600);
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
            case 'money': return <Wallet size={size} className="text-emerald-400" />;
            case 'energy': return <Zap size={size} className="text-yellow-400" />;
            case 'material': return <Box size={size} className="text-orange-400" />;
            case 'item': return <Box size={size} className="text-blue-400" />;
            case 'robot': return <BotIcon size={size} className="text-purple-400" />;
            default: return <Sparkles size={size} className="text-white" />;
        }
    };

    return (
        <>
            {/* Main Game Modal */}
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
                <div className="bg-stone-950 border border-stone-800 w-[95%] sm:w-full sm:max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">

                    {/* Header */}
                    <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-900/20 p-2 rounded text-purple-500">
                                <Dices size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-white">{t('lucky_draw.title')}</h2>
                                <p className="text-xs text-stone-500 uppercase tracking-wider">{t('lucky_draw.subtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Game Area */}
                    <div className="flex-1 flex flex-col items-center justify-center relative p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                        {/* Probabilities Table (Absolute Positioned) */}
                        <div className="absolute top-6 left-6 bg-black/40 border border-stone-800 rounded-lg p-3 backdrop-blur-sm hidden sm:block">
                            <h4 className="font-bold text-stone-300 text-xs mb-2 border-b border-stone-700 pb-1">{t('lucky_draw.chance_label')}</h4>
                            <ul className="space-y-1.5 w-40">
                                {LUCKY_DRAW_CONFIG.PROBABILITIES.map((p, i) => (
                                    <li key={i} className="flex justify-between text-[10px]">
                                        <span className="text-stone-400">{getLocalized(p.label)}</span>
                                        <span className="font-mono text-yellow-500 font-bold">{p.chance}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Cards Container */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 perspective-1000 w-full max-w-4xl px-4">
                            {cards.map((idx) => {
                                const isSelected = selectedCard === idx;
                                const isOther = selectedCard !== null && !isSelected;
                                const isShuffling = gameState === 'SHUFFLING';
                                const canPick = gameState === 'PICKING';

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => canPick && handlePickCard(idx)}
                                        className={`
                                relative w-24 h-40 sm:w-32 sm:h-48 transition-all duration-500 transform-style-3d 
                                ${canPick ? 'cursor-pointer hover:-translate-y-4 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'cursor-default'}
                                ${isShuffling ? 'animate-shuffle' : ''}
                                ${isSelected ? 'rotate-y-180 z-20' : ''}
                                ${isOther ? 'opacity-30 scale-95 grayscale' : ''}
                            `}
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        {/* FRONT (Card Back Design) */}
                                        <div className="absolute inset-0 bg-stone-900 border-2 border-stone-700 rounded-xl flex flex-col items-center justify-center backface-hidden shadow-2xl">
                                            <div className="absolute inset-2 border border-stone-800 border-dashed rounded-lg opacity-50"></div>
                                            <div className="text-stone-600">
                                                <Sparkles size={32} strokeWidth={1} />
                                            </div>
                                            <div className="absolute bottom-3 right-3 text-stone-800">
                                                <Star size={12} fill="#292524" />
                                            </div>
                                        </div>

                                        {/* BACK (Result Reveal - Only shown when flipped) */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 to-yellow-900 border-2 border-yellow-500 rounded-xl flex flex-col items-center justify-center rotate-y-180 backface-hidden shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                                            {reward ? (
                                                <div className="animate-in zoom-in duration-300">
                                                    <div className="text-white drop-shadow-md flex justify-center mb-2">
                                                        {renderRewardIcon(reward.type, 32)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <RefreshCw className="animate-spin text-white" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="mt-12 h-20 flex items-center justify-center">
                            {gameState === 'IDLE' && (
                                <button
                                    onClick={handleStart}
                                    disabled={!canPlayFree && user.balance < LUCKY_DRAW_CONFIG.COST}
                                    className={`
                                        px-10 py-4 rounded-xl font-bold text-xl shadow-lg flex items-center gap-3 transition-all active:scale-95 border
                                        ${canPlayFree
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-900/50'
                                            : user.balance < LUCKY_DRAW_CONFIG.COST
                                                ? 'bg-stone-800 text-stone-500 cursor-not-allowed border-stone-700'
                                                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600 hover:border-stone-500'}
                                    `}
                                >
                                    {canPlayFree ? (
                                        <>
                                            <Sparkles className="text-yellow-300 animate-pulse" /> {t('lucky_draw.free_spin')}
                                        </>
                                    ) : (
                                        <>
                                            {user.balance < LUCKY_DRAW_CONFIG.COST ? t('lucky_draw.insufficient_funds') : <span>{t('lucky_draw.pay_spin').replace('{cost}', formatCurrency(LUCKY_DRAW_CONFIG.COST))}</span>}
                                        </>
                                    )}
                                </button>
                            )}

                            {gameState === 'SHUFFLING' && (
                                <div className="text-yellow-500 font-display text-2xl animate-pulse tracking-widest">
                                    {t('lucky_draw.shuffling')}
                                </div>
                            )}

                            {gameState === 'PICKING' && (
                                <div className="text-white font-bold text-lg animate-bounce bg-stone-900/80 px-6 py-2 rounded-full border border-stone-700">
                                    {t('lucky_draw.pick_card')}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Result Popup Overlay */}
            {showResultPopup && reward && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm p-8 text-center flex flex-col items-center animate-in zoom-in-50 duration-500">

                        {/* Background Burst */}
                        <div className="absolute inset-0 bg-gradient-radial from-yellow-500/20 to-transparent opacity-50 blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.1)_30deg,transparent_60deg,rgba(255,255,255,0.1)_90deg,transparent_120deg,rgba(255,255,255,0.1)_150deg,transparent_180deg,rgba(255,255,255,0.1)_210deg,transparent_240deg,rgba(255,255,255,0.1)_270deg,transparent_300deg,rgba(255,255,255,0.1)_330deg,transparent_360deg)] animate-[spin_10s_linear_infinite] rounded-full pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                                {renderRewardIcon(reward.type, 100)}
                            </div>

                            <h2 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] mb-2 uppercase tracking-widest">
                                {reward.type === 'money' ? t('lucky_draw.win_money') : t('lucky_draw.win_reward')}
                            </h2>

                            <div className="text-2xl font-bold text-yellow-400 mb-8 drop-shadow-md">
                                {getLocalized(reward.label)}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={resetGame}
                                    className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl border border-stone-600 transition-all hover:scale-105"
                                >
                                    {t('lucky_draw.play_again')}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-stone-200 transition-all hover:scale-105"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        
        @keyframes shuffle {
            0% { transform: translateX(0); }
            25% { transform: translateX(120%) scale(0.9); z-index: 10; }
            50% { transform: translateX(-120%) scale(0.9); z-index: 10; }
            100% { transform: translateX(0); }
        }
        .animate-shuffle { animation: shuffle 0.5s ease-in-out infinite alternate; }
    `}</style>
        </>
    );
};

const BotIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" x2="8" y1="16" y2="16" /><line x1="16" x2="16" y1="16" y2="16" /></svg>
);
