
import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, TrendingUp, Gift, Bot, Key, Wrench, Hourglass } from 'lucide-react';
import { MockDB } from '../services/db';
import { CURRENCY } from '../constants';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
    const [leaders, setLeaders] = useState<{ id: string, username: string, dailyIncome: number, rank: number }[]>([]);
    const [activeTab, setActiveTab] = useState<'RANKING' | 'REWARDS'>('RANKING');

    useEffect(() => {
        if (isOpen) {
            const data = MockDB.getLeaderboard();
            setLeaders(data);
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] landscape:max-h-[65vh]">

                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-900/20 p-2 rounded text-yellow-500">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">อันดับเศรษฐี</h2>
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
                        กระดานอันดับ
                    </button>
                    <button
                        onClick={() => setActiveTab('REWARDS')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'REWARDS' ? 'bg-stone-800 text-white border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}
                    >
                        <Gift size={14} className="inline mr-1 mb-0.5" />
                        รางวัลประจำสัปดาห์
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'RANKING' ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] space-y-2">
                        {leaders.length === 0 ? (
                            <div className="text-center py-10 text-stone-500">ไม่มีข้อมูล</div>
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
                                        <div className="text-[10px] text-stone-500">{CURRENCY}/วัน</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-stone-950/50">
                        <div className="space-y-4">
                            <div className="p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg text-center">
                                <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">ตัดรอบทุกวันอาทิตย์ 23:59 น.</p>
                                <p className="text-[10px] text-stone-500">รางวัลจะส่งเข้ากล่องของขวัญโดยอัตโนมัติ</p>
                            </div>

                            {/* Rank 1 */}
                            <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-yellow-700/30 p-4 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={64} /></div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500 text-yellow-500 shadow-lg">
                                        <Crown size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">อันดับ 1</h3>
                                </div>
                                <div className="space-y-2 pl-12">
                                    <div className="flex items-center gap-3 text-stone-300">
                                        <Bot size={16} className="text-blue-400" />
                                        <span className="text-sm">หุ่นยนต์ AI <span className="text-yellow-500 font-bold">(7 วัน)</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-300">
                                        <Key size={16} className="text-purple-400" />
                                        <span className="text-sm">กุญแจ <span className="text-emerald-400 font-bold">x3</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 2-3 */}
                            <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5"><Medal size={64} /></div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center border border-stone-600 text-stone-400">
                                        <span className="font-bold">2-3</span>
                                    </div>
                                    <h3 className="text-base font-bold text-stone-200">อันดับ 2 - 3</h3>
                                </div>
                                <div className="space-y-2 pl-12">
                                    <div className="flex items-center gap-3 text-stone-400">
                                        <Bot size={16} className="text-blue-400/70" />
                                        <span className="text-xs">หุ่นยนต์ AI <span className="text-stone-300 font-bold">(3 วัน)</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-400">
                                        <Key size={16} className="text-purple-400/70" />
                                        <span className="text-xs">กุญแจ <span className="text-emerald-400/70 font-bold">x1</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 4-10 */}
                            <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl relative overflow-hidden opacity-80">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center border border-stone-700 text-stone-500">
                                        <span className="font-bold text-xs">4-10</span>
                                    </div>
                                    <h3 className="text-base font-bold text-stone-400">อันดับ 4 - 10</h3>
                                </div>
                                <div className="space-y-2 pl-12">
                                    <div className="flex items-center gap-3 text-stone-500">
                                        <Wrench size={16} className="text-stone-400" />
                                        <span className="text-xs">ชุดซ่อมแซมเต็มสูบ <span className="text-stone-300 font-bold">x5</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-500">
                                        <Hourglass size={16} className="text-stone-400" />
                                        <span className="text-xs">นาฬิกาทราย (เล็ก) <span className="text-stone-300 font-bold">x2</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'RANKING' && (
                    <div className="p-4 bg-stone-900/80 border-t border-stone-800 text-center text-[10px] text-stone-500">
                        จัดอันดับจากรายได้รวมต่อวันของเหมืองทั้งหมด
                    </div>
                )}

            </div>
        </div>
    );
};
