
import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, TrendingUp, Gift, Truck, FileText, Monitor, Key, Smartphone, Diamond, Glasses, Cpu, Footprints, Wrench, Hourglass } from 'lucide-react';
import { CURRENCY } from '../constants';
import { api } from '../services/api';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
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
                                        <Truck size={16} className="text-yellow-400" />
                                        <span className="text-sm">รถขุดไฟฟ้า <span className="text-yellow-500 font-bold">(Electric)</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-300">
                                        <FileText size={16} className="text-yellow-400" />
                                        <span className="text-sm">ใบประกันความเสี่ยง <span className="text-yellow-500 font-bold">x2</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 2 */}
                            <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10"><Medal size={64} className="text-stone-400" /></div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center border border-stone-600 text-stone-300 font-bold text-sm">
                                        2
                                    </div>
                                    <h3 className="text-base font-bold text-stone-200">อันดับ 2</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2 pl-12">
                                    <div className="flex items-center gap-3 text-xs text-stone-400">
                                        <Monitor size={14} className="text-indigo-400" />
                                        <span>พีซีสำนักงาน</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-stone-400">
                                        <FileText size={14} className="text-yellow-500" />
                                        <span>ใบประกันความเสี่ยง <span className="text-yellow-600 font-bold">x1</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-stone-400">
                                        <Key size={14} className="text-purple-400" />
                                        <span>กุญแจเข้าเหมืองสุ่ม <span className="text-purple-500 font-bold">x1</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 3 */}
                            <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5"><Medal size={64} className="text-orange-500" /></div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center border border-stone-600 text-orange-400 font-bold text-sm">
                                        3
                                    </div>
                                    <h3 className="text-base font-bold text-stone-200">อันดับ 3</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2 pl-12">
                                    <div className="flex items-center gap-3 text-xs text-stone-400">
                                        <Smartphone size={14} className="text-stone-300" />
                                        <span>มือถือรุ่นปุ่มกด</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-stone-400">
                                        <Key size={14} className="text-purple-400" />
                                        <span>กุญแจเข้าเหมืองสุ่ม <span className="text-purple-500 font-bold">x1</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-stone-400">
                                        <Diamond size={14} className="text-cyan-400" />
                                        <span>เพชร <span className="text-cyan-500 font-bold">x2</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 4-6 */}
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-800 rounded text-stone-500 border border-stone-700">4-6</span>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">รางวัลรองชนะเลิศ</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-6">
                                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                        <Glasses size={12} className="text-emerald-500" />
                                        <span>แว่นตานิรภัยใส</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                        <Key size={12} className="text-purple-500" />
                                        <span>กุญแจเข้าเหมืองสุ่ม x1</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                        <Cpu size={12} className="text-indigo-400" />
                                        <span>ชิปอัปเกรด x20</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rank 7-10 */}
                            <div className="bg-stone-900/30 border border-stone-800/50 p-3 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-800 rounded text-stone-600 border border-stone-800">7-10</span>
                                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">Miner Participation</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                                    <div className="flex items-center gap-2 text-[10px] text-stone-600">
                                        <Footprints size={12} className="text-stone-500" />
                                        <span>รองเท้าบูทกันน้ำ</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-stone-600">
                                        <Hourglass size={12} className="text-stone-500" />
                                        <span>นาฬิกาทราย x10</span>
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
