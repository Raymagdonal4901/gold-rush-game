
import React, { useState, useEffect } from 'react';
import { X, Bomb, Gem, Coins, Trophy, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../services/types';
import { useTranslation } from '../contexts/LanguageContext';

interface MinesGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onRefresh: () => void;
}

interface GameState {
    _id: string;
    betAmount: number;
    minesCount: number;
    status: 'ACTIVE' | 'CASHED_OUT' | 'EXPLODED';
    revealed: number[];
    currentMultiplier: number;
    potentialWin: number;
}

export const MinesGameModal: React.FC<MinesGameModalProps> = ({ isOpen, onClose, user, onRefresh }) => {
    const { t, formatCurrency, language } = useTranslation();
    const [betAmount, setBetAmount] = useState<number>(10);
    const [minesCount, setMinesCount] = useState<number>(3);
    const [game, setGame] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(false);
    const [revealingIndex, setRevealingIndex] = useState<number | null>(null);
    const [explodingIndex, setExplodingIndex] = useState<number | null>(null);
    const [allMines, setAllMines] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            checkActiveGame();
        }
    }, [isOpen]);

    const checkActiveGame = async () => {
        try {
            const res = await api.getActiveMinesGame();
            if (res.data) {
                setGame(res.data);
                setBetAmount(res.data.betAmount);
                setMinesCount(res.data.minesCount);
            }
        } catch (err) {
            console.error('Failed to fetch active mines game', err);
        }
    };

    const handleStartGame = async () => {
        if (user.balance < betAmount) {
            alert(t('mines.insufficient_funds'));
            return;
        }

        setLoading(true);
        try {
            const res = await api.startMinesGame(betAmount, minesCount);
            // initialState from refined backend
            setGame(res.data.initialState);
            setAllMines([]);
            setExplodingIndex(null);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to start game');
        } finally {
            setLoading(false);
        }
    };

    const handleTileClick = async (index: number) => {
        if (!game || game.status !== 'ACTIVE' || game.revealed.includes(index) || revealingIndex !== null) return;

        setRevealingIndex(index);
        try {
            const res = await api.revealMinesTile(index, game._id); // Pass gameId
            if (res.data.status === 'GAME_OVER') {
                setExplodingIndex(index);
                setAllMines(res.data.mines);
                setGame({ ...game, status: 'EXPLODED', potentialWin: 0 });
            } else {
                setGame({
                    ...game,
                    revealed: res.data.revealed,
                    currentMultiplier: res.data.multiplier,
                    potentialWin: res.data.payout
                });
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reveal tile');
        } finally {
            setRevealingIndex(null);
        }
    };

    const handleCashOut = async () => {
        if (!game || game.status !== 'ACTIVE' || game.revealed.length === 0 || loading) return;

        setLoading(true);
        try {
            const res = await api.cashOutMines(game._id); // Pass gameId
            setGame({ ...game, status: 'CASHED_OUT', potentialWin: res.data.finalPayout });
            setAllMines(res.data.mines);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cash out');
        } finally {
            setLoading(false);
        }
    };

    const resetGame = () => {
        setGame(null);
        setAllMines([]);
        setExplodingIndex(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-[360px] md:max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col-reverse md:flex-row h-auto md:h-[650px] relative">

                {/* Back Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-10 flex items-center gap-1 text-stone-500 hover:text-white transition-colors group"
                >
                    <RefreshCw size={16} className="rotate-[-90deg] group-hover:rotate-[-180deg] transition-transform duration-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{language === 'th' ? 'กลับ' : 'Back'}</span>
                </button>

                {/* Close Button - Hidden on mobile, use Back button instead */}
                <button onClick={onClose} className="hidden md:block absolute top-4 right-4 z-10 text-stone-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                {/* Left Panel: Controls */}
                <div className="w-full md:w-80 bg-stone-900/50 border-t md:border-t-0 md:border-r border-stone-800 p-4 sm:p-6 flex flex-col justify-between shrink-0">
                    <div>
                        {/* User Balance Display */}
                        <div className="mb-3 p-2.5 bg-stone-950/50 rounded-xl border border-stone-800/50 flex flex-col gap-0.5 shadow-inner">
                            <span className="text-[7px] uppercase tracking-widest text-stone-500 font-bold leading-none opacity-70">{t('common.balance')}</span>
                            <div className="text-base font-mono font-black text-emerald-400 leading-none">{formatCurrency(user.balance)}</div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 text-yellow-500">
                                <Bomb size={16} />
                                <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">{t('mines.title')}</h2>
                            </div>

                            {/* Action Button in Header */}
                            <div className="shrink-0">
                                {game?.status === 'ACTIVE' ? (
                                    <button
                                        onClick={handleCashOut}
                                        disabled={game.revealed.length === 0 || loading}
                                        className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border
                                            ${game.revealed.length === 0 || loading
                                                ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
                                    >
                                        {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Trophy size={16} />}
                                        {t('mines.cash_out')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={game?.status ? resetGame : handleStartGame}
                                        disabled={loading}
                                        className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-yellow-500 shadow-[0_0_20px_rgba(202,138,4,0.4)]"
                                    >
                                        {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck size={16} />}
                                        {game?.status ? t('mines.play_again_short') : t('mines.start_game')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-6">
                            {/* Bet Amount */}
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-stone-500 font-bold mb-1">{t('mines.bet_amount')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">฿</span>
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                                        disabled={game?.status === 'ACTIVE'}
                                        className="w-full bg-stone-950 border border-stone-700 rounded-lg py-2 pl-8 pr-4 text-white font-mono text-sm focus:border-yellow-500 outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {[10, 50, 100].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setBetAmount(amt)}
                                            disabled={game?.status === 'ACTIVE'}
                                            className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] font-bold rounded border border-stone-700 transition-colors"
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mines Count */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1.5">{t('mines.mines_count')}</label>
                                <select
                                    value={minesCount}
                                    onChange={(e) => setMinesCount(Number(e.target.value))}
                                    disabled={game?.status === 'ACTIVE'}
                                    className="w-full bg-stone-950 border border-stone-700 rounded-lg py-1.5 px-4 text-white font-mono text-xs focus:border-yellow-500 outline-none transition-colors appearance-none cursor-pointer"
                                >
                                    {[1, 3, 5, 10, 24].map(num => (
                                        <option key={num} value={num}>{num} {t('mines.mines_label')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 md:mt-8">
                        <p className="text-[8px] text-stone-600 text-center uppercase tracking-tighter opacity-50">{t('mines.secure_logic')}</p>
                    </div>
                </div>

                {/* Right Panel: Grid Area */}
                <div className="flex-1 bg-stone-950 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">

                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05),transparent_70%)] pointer-events-none"></div>

                    {/* Potential Win Info */}
                    <div className="mb-2 md:mb-6 text-center animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                        <div className="text-stone-500 text-[6px] md:text-[10px] uppercase tracking-widest font-bold mb-0.5">{t('mines.potential_win')}</div>
                        <div className="text-lg md:text-3xl font-display font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] leading-none mb-1">
                            {formatCurrency(game?.potentialWin || 0)}
                        </div>
                        {game && (
                            <div className="text-stone-400 text-sm font-mono mt-1 bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800">
                                {t('mines.multiplier')}: <span className="text-white font-bold">{game.currentMultiplier.toFixed(2)}x</span>
                            </div>
                        )}
                    </div>

                    {/* 5x5 Grid */}
                    <div className="grid grid-cols-5 gap-0.5 md:gap-3 w-full max-w-[220px] md:max-w-[400px] aspect-square">
                        {Array.from({ length: 25 }).map((_, i) => {
                            const isRevealed = game?.revealed.includes(i);
                            const isMine = allMines.includes(i) || (explodingIndex === i);
                            const isExploded = explodingIndex === i;
                            const isClickable = game?.status === 'ACTIVE' && !isRevealed && revealingIndex === null;

                            return (
                                <div
                                    key={i}
                                    onClick={() => handleTileClick(i)}
                                    className={`
                                        relative rounded-md md:rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer
                                        ${isRevealed && !isMine ? 'bg-emerald-900/40 border-[1.5px] border-emerald-500/50 scale-[0.98]' : 'bg-stone-900 border border-stone-800'}
                                        ${isMine ? 'bg-red-900/40 border-[1.5px] border-red-500/50 scale-[1.05]' : ''}
                                        ${isExploded ? 'animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.5)]' : ''}
                                        ${isClickable ? 'hover:bg-stone-800 hover:border-stone-600 hover:scale-[1.02] shadow-xl' : ''}
                                        ${!game ? 'opacity-50 grayscale' : ''}
                                    `}
                                >
                                    {isRevealed && !isMine && <Gem className="text-emerald-400 animate-in zoom-in spin-in-12 duration-500" size={18} />}
                                    {isMine && <Bomb className={`text-red-500 animate-in zoom-in duration-300 ${isExploded ? 'animate-pulse' : ''}`} size={18} />}
                                    {revealingIndex === i && <RefreshCw className="animate-spin text-stone-500" size={14} />}

                                    {!isRevealed && !isMine && revealingIndex !== i && (
                                        <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Game Over / Win Info Overlay */}
                    {game?.status === 'EXPLODED' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-950/20 backdrop-blur-sm pointer-events-none">
                            <div className="bg-red-600 text-white px-8 py-4 rounded-xl font-black text-2xl animate-in zoom-in-50 duration-300 shadow-2xl flex items-center gap-3">
                                <AlertTriangle fill="white" /> {t('mines.boom')}
                            </div>
                        </div>
                    )}
                    {game?.status === 'CASHED_OUT' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-950/20 backdrop-blur-sm pointer-events-none">
                            <div className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-3xl animate-in zoom-in-50 duration-300 shadow-2xl flex flex-col items-center">
                                <div className="text-sm font-bold uppercase tracking-widest opacity-80">{t('mines.win')}</div>
                                <div className="flex items-center gap-2">
                                    <Coins className="text-yellow-300" /> {formatCurrency(game.potentialWin)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: scale(1.05); }
                    50% { transform: scale(1.15); }
                }
                .animate-bounce { animation: bounce 0.5s infinite; }
            `}</style>
        </div>
    );
};
