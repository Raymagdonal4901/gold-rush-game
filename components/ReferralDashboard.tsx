import React, { useState, useEffect } from 'react';
import { X, Copy, Users, Gift, Crown, Share2, TrendingUp, Handshake, Zap, Timer, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { User } from '../services/types';

interface ReferralDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ isOpen, onClose, user }) => {
    const { t, language } = useTranslation();
    const [referralData, setReferralData] = useState<{
        referrals: { username: string, joinedAt: string, level: number, userId: string, referrerId?: string }[],
        teamDailyIncome: number,
        stats: { l1Count: number, l2Count: number, l3Count: number, totalTeam: number }
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<number>(0); // 0: Overview, 1: L1, 2: L2, 3: L3

    const referralCode = user.referralCode || user.username;
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    useEffect(() => {
        if (isOpen) {
            fetchReferrals();
        }
    }, [isOpen]);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const data = await api.user.getReferrals();
            setReferralData(data);
        } catch (err) {
            console.error('Failed to fetch referrals:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const filteredReferrals = referralData?.referrals?.filter(ref =>
        activeTab === 0 ? true : ref.level === activeTab
    ) || [];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a]/90 border border-yellow-600/20 rounded-[2rem] w-full max-w-2xl shadow-[0_0_80px_-20px_rgba(234,179,8,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-500">
                {/* Premium Background Effects */}
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                {/* Header Section */}
                <div className="p-8 pb-4 relative flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 shadow-lg"
                            title={language === 'th' ? 'กลับ' : 'Back'}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Crown className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={24} />
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                                    Referral <span className="text-yellow-500">Empire</span>
                                </h2>
                            </div>
                            <p className="text-stone-500 text-xs font-bold tracking-[0.2em] uppercase opacity-60">
                                Build Your Kingdom • Command Your Wealth
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-stone-900/50 border border-white/5 text-stone-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6 max-h-[85vh] overflow-y-auto overflow-x-hidden custom-scrollbar relative">

                    {/* Share Section - High Contrast */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-stone-900 to-stone-950 p-6 rounded-3xl border border-yellow-500/20 flex flex-col items-center gap-4 text-center overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full"></div>

                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">{language === 'th' ? 'เชิญเพื่อนร่วมทีม' : 'Expand Your Network'}</h3>
                                <p className="text-stone-400 text-xs">{language === 'th' ? 'แชร์ลิงก์นี้เพื่อรับผลประโยชน์จากการขุดของลูกทีม' : 'Share this link to earn passive income from your team'}</p>
                            </div>

                            <div className="w-full flex bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 p-1">
                                <div className="flex-1 px-4 py-3 font-mono text-yellow-500/80 text-sm overflow-hidden text-ellipsis whitespace-nowrap opacity-60">
                                    {referralLink}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(referralLink)}
                                    className={`px-6 py-3 rounded-xl font-black text-sm uppercase transition-all flex items-center gap-2 ${copied
                                        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                        : 'bg-yellow-500 text-stone-950 hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                                        }`}
                                >
                                    {copied ? <TrendingUp size={16} /> : <Share2 size={16} />}
                                    {copied ? (language === 'th' ? 'สำเร็จ' : 'Done') : (language === 'th' ? 'คัดลอก' : 'Copy')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Glassmorphism */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 bg-gradient-to-r from-stone-900/40 to-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em]">{language === 'th' ? 'เครือข่ายทั้งหมด' : 'Global Network'}</p>
                                    <h4 className="text-3xl font-black text-white leading-none mt-1">
                                        {referralData?.stats?.totalTeam || 0}
                                        <span className="text-stone-500 text-sm font-bold ml-2 italic">MINERS</span>
                                    </h4>
                                </div>
                            </div>
                            <div className="flex gap-2 mr-2">
                                {[
                                    { label: 'L1', count: referralData?.stats?.l1Count || 0, color: 'text-yellow-500' },
                                    { label: 'L2', count: referralData?.stats?.l2Count || 0, color: 'text-blue-400' },
                                    { label: 'L3', count: referralData?.stats?.l3Count || 0, color: 'text-purple-400' }
                                ].map((l, i) => (
                                    <div key={i} className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-center min-w-[3rem]">
                                        <p className={`text-[9px] font-black ${l.color}`}>{l.label}</p>
                                        <p className="text-white text-xs font-bold">{l.count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-md p-6 rounded-3xl border border-emerald-500/20 group overflow-hidden relative">
                            <TrendingUp className="absolute -bottom-4 -right-4 w-20 h-20 text-emerald-500/5 rotate-12" />
                            <div className="relative z-10">
                                <p className="text-emerald-500/70 text-[10px] font-black uppercase tracking-[0.2em]">{language === 'th' ? 'ปันผลสะสม' : 'Net Accrual'}</p>
                                <h4 className="text-2xl font-black text-white mt-1">
                                    {(user.referralStats?.totalEarned || 0).toLocaleString()}
                                    <span className="text-stone-600 text-sm ml-1">฿</span>
                                </h4>
                                <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 w-fit px-2 py-1 rounded-lg">
                                    <TrendingUp size={10} />
                                    <span>Lifetime Growth</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent backdrop-blur-md p-6 rounded-3xl border border-yellow-500/20 group overflow-hidden relative">
                            <Gift className="absolute -bottom-4 -right-4 w-20 h-20 text-yellow-500/5 -rotate-12" />
                            <div className="relative z-10">
                                <p className="text-yellow-500/70 text-[10px] font-black uppercase tracking-[0.2em]">{language === 'th' ? 'ประมาณการรายวัน' : 'Team Daily Est.'}</p>
                                <h4 className="text-2xl font-black text-white mt-1">
                                    {(referralData?.teamDailyIncome || 0).toLocaleString()}
                                    <span className="text-stone-600 text-sm ml-1">฿</span>
                                </h4>
                                <div className="mt-4 flex items-center gap-2 text-[10px] text-yellow-400 font-bold bg-yellow-400/10 w-fit px-2 py-1 rounded-lg">
                                    <Zap size={10} />
                                    <span>Passive Flow</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Selector & List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">Empire Records</h3>
                            <div className="flex bg-stone-900/50 p-1 rounded-xl border border-white/5">
                                {[
                                    { id: 0, label: 'ALL' },
                                    { id: 1, label: 'L1' },
                                    { id: 2, label: 'L2' },
                                    { id: 3, label: 'L3' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === tab.id
                                            ? 'bg-yellow-500 text-stone-950 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                            : 'text-stone-500 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin shadow-[0_0_20px_rgba(234,179,8,0.1)]"></div>
                                <p className="text-stone-500 text-xs font-black uppercase tracking-widest animate-pulse">Syncing Network...</p>
                            </div>
                        ) : filteredReferrals.length > 0 ? (
                            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredReferrals.map((ref, idx) => (
                                    <div key={idx} className="bg-stone-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-yellow-500/30 transition-all group overflow-hidden relative">
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105 shadow-lg ${ref.level === 1 ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 text-yellow-500 border border-yellow-500/20' :
                                                    ref.level === 2 ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/30 text-blue-400 border border-blue-500/10' :
                                                        'bg-gradient-to-br from-purple-500/10 to-purple-600/30 text-purple-400 border border-purple-500/10'
                                                    }`}>
                                                    {ref.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-lg bg-stone-950 border border-white/10 text-[9px] font-black text-white shadow-xl">
                                                    L{ref.level}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-black tracking-tight">{ref.username}</p>
                                                    {ref.level === 1 && <Crown size={10} className="text-yellow-500" />}
                                                </div>
                                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5 opacity-60">
                                                    Enrolled {new Date(ref.joinedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 relative z-10">
                                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-500/20 tracking-[0.1em]">
                                                • ACTIVE
                                            </div>
                                            {ref.userId && (
                                                <p className="text-[9px] font-mono text-stone-700 uppercase tracking-tighter">UID: {ref.userId.substring(0, 8)}</p>
                                            )}
                                        </div>

                                        {/* Row Subtle Background Polish */}
                                        <div className={`absolute top-0 right-0 w-32 h-full opacity-5 pointer-events-none transition-opacity group-hover:opacity-10 ${ref.level === 1 ? 'bg-yellow-500' : ref.level === 2 ? 'bg-blue-500' : 'bg-purple-500'
                                            }`} style={{ borderRadius: '0 1rem 1rem 0' }}></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-stone-900/10 border-2 border-dashed border-stone-800/50 p-16 rounded-[2.5rem] text-center flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-stone-900/50 flex items-center justify-center mb-6 border border-white/5 opacity-50">
                                    <Users size={32} className="text-stone-400" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{language === 'th' ? 'อาณาจักรยังว่างเปล่า' : 'Empire Unclaimed'}</h3>
                                <p className="text-stone-500 text-sm max-w-[250px] mx-auto mb-8">
                                    {language === 'th' ? 'เริ่มแนะนำสมาชิกใหม่เพื่อปลดล็อกรายได้รายวันแบบ Passive' : 'Start recruiting new members to unlock your passive growth potential.'}
                                </p>
                                <button
                                    onClick={() => copyToClipboard(referralLink)}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs tracking-[0.2em] uppercase rounded-2xl border border-white/5 transition-all active:scale-95"
                                >
                                    {language === 'th' ? 'ริเริ่มการขยาย' : 'Initiate Expansion'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="px-8 py-4 bg-stone-950/80 border-t border-white/5 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-[9px] text-stone-500 font-black uppercase tracking-widest">Global Node Sync: Active</p>
                    </div>
                    <p className="text-[9px] text-stone-700 font-bold uppercase tracking-[0.2em]">Gold Rush Empire Protocol v2.5</p>
                </div>
            </div>
        </div>
    );
};
