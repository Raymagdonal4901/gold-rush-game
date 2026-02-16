import React, { useState, useEffect } from 'react';
import { X, Copy, Users, Gift, Crown, Share2, TrendingUp, Handshake } from 'lucide-react';
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
    const [referrals, setReferrals] = useState<{ username: string, joinedAt: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const referralCode = user.referralCode || user.username;
    // Base URL should ideally come from config, using window.location.origin as fallback
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
            setReferrals(data);
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

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#0f0f0f] border border-yellow-600/30 rounded-2xl w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden relative animate-in zoom-in-95 duration-500">
                {/* Visual Flair */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

                {/* Header */}
                <div className="bg-gradient-to-b from-stone-900 to-transparent p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <Handshake className="text-yellow-500" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Referral Empire</h2>
                            <p className="text-xs text-yellow-500 font-mono tracking-widest uppercase opacity-70">Expand Your Network</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-all hover:rotate-90 p-2 bg-stone-900 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                    {/* Share Section */}
                    <div className="bg-stone-900/40 p-6 rounded-2xl border border-stone-800 space-y-4">
                        <p className="text-stone-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Share2 size={16} className="text-yellow-500" />
                            {language === 'th' ? 'ลิงก์แนะนำของคุณ' : 'Your Referral Link'}
                        </p>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 bg-black/60 p-4 rounded-xl border border-stone-800 font-mono text-yellow-500/90 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                {referralLink}
                            </div>
                            <button
                                onClick={() => copyToClipboard(referralLink)}
                                className={`px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap ${copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-yellow-600 hover:bg-yellow-500 text-stone-950 shadow-[0_4px_15px_rgba(202,138,4,0.3)]'
                                    }`}
                            >
                                {copied ? <TrendingUp size={18} /> : <Copy size={18} />}
                                {copied
                                    ? (language === 'th' ? 'คัดลอกแล้ว!' : 'Copied!')
                                    : (language === 'th' ? 'คัดลอกลิงก์' : 'Copy Link')}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-stone-900 to-black p-6 rounded-2xl border border-stone-800 flex items-center gap-4 group">
                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                                <Users className="text-blue-400" size={28} />
                            </div>
                            <div>
                                <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'เพื่อนที่แนะนำ' : 'Total Invited'}</p>
                                <p className="text-3xl font-bold text-white leading-tight">
                                    {user.referralStats?.totalInvited || 0}
                                    <span className="text-stone-600 text-sm font-normal ml-2">{language === 'th' ? 'คน' : 'Miners'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-stone-900 to-black p-6 rounded-2xl border border-stone-800 flex items-center gap-4 group">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <TrendingUp className="text-emerald-400" size={28} />
                            </div>
                            <div>
                                <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'รายได้ทั้งหมด' : 'Total Earnings'}</p>
                                <p className="text-3xl font-bold text-emerald-400 leading-tight">
                                    {(user.referralStats?.totalEarned || 0).toLocaleString()}
                                    <span className="text-stone-600 text-sm font-normal ml-2">THB</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bonus Explanation */}
                    <div className="bg-yellow-600/5 p-6 rounded-2xl border border-yellow-600/10">
                        <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Crown size={16} />
                            {language === 'th' ? 'สิทธิประโยชน์ของคุณ' : 'Your Tier Benefits'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-4 p-4 bg-stone-900/50 rounded-xl border border-stone-800">
                                <div className="text-2xl font-bold text-yellow-500">3%</div>
                                <div>
                                    <p className="text-white font-bold">{language === 'th' ? 'โบนัสแนะนำซื้อ' : 'Active Bonus'}</p>
                                    <p className="text-stone-500 text-xs mt-1">{language === 'th' ? 'รับทันทีเมื่อเพื่อนซื้อเครื่องขุด' : 'Earn immediately when friends buy rigs'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-stone-900/50 rounded-xl border border-stone-800">
                                <div className="text-2xl font-bold text-emerald-500">1%</div>
                                <div>
                                    <p className="text-white font-bold">{language === 'th' ? 'รายได้จากการขุด' : 'Passive Income'}</p>
                                    <p className="text-stone-500 text-xs mt-1">{language === 'th' ? 'รายได้ Passive จากทุกยอดเคลมของเพื่อน' : 'Earn from every claim your friends make'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referrals List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center justify-between">
                            <span>{language === 'th' ? 'ขุมพลังของคุณ' : 'Your Network'}</span>
                            <span className="text-stone-600 font-mono text-xs">{referrals.length} active</span>
                        </h3>

                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : referrals.length > 0 ? (
                            <div className="bg-stone-900/20 rounded-2xl border border-stone-800 divide-y divide-stone-800">
                                {referrals.map((ref, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center group hover:bg-stone-900/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center font-bold text-stone-500 group-hover:text-yellow-500 transition-colors">
                                                {ref.username.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{ref.username}</p>
                                                <p className="text-[10px] text-stone-500 uppercase tracking-tight">Joined {new Date(ref.joinedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20">
                                            ACTIVE
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-stone-900/10 border-2 border-dashed border-stone-800 p-12 rounded-3xl text-center">
                                <Users size={48} className="mx-auto text-stone-800 mb-4" />
                                <p className="text-stone-600 font-medium">
                                    {language === 'th' ? 'ยังไม่มีผู้ได้รับการแนะนำ' : 'No miners referred yet.'}
                                </p>
                                <button
                                    onClick={() => copyToClipboard(referralLink)}
                                    className="mt-4 text-yellow-500 hover:text-yellow-400 font-bold text-sm tracking-widest uppercase py-2 px-4 hover:bg-yellow-500/5 rounded-lg transition-all"
                                >
                                    {language === 'th' ? 'เริ่มแนะนำเลย' : 'Start Inviting Now'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-stone-950 p-4 text-center border-t border-stone-900/50">
                    <p className="text-[10px] text-stone-600 uppercase tracking-widest">
                        Gold Rush Digital Referral Certificate Layer-1
                    </p>
                </div>
            </div>
        </div>
    );
};
