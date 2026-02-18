import React from 'react';
import { X, Copy, Share2, Users, Gift, Crown, Key, TrendingUp } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    referralCode: string;
    referralCount: number;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, referralCode, referralCount }) => {
    const { t, language } = useTranslation();

    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        alert(language === 'th' ? 'คัดลอกรหัสแนะนำแล้ว!' : 'Referral code copied!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-yellow-600/50 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-900/80 to-[#1a1a1a] p-4 flex justify-between items-center border-b border-yellow-600/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                            <Users className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">{t('referral.title') || (language === 'th' ? 'ระบบแนะนำเพื่อน' : 'Referral System')}</h2>
                            <p className="text-xs text-yellow-500 font-mono tracking-wider">{t('referral.subnet') || 'BUILD YOUR EMPIRE'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Your Code Section */}
                    <div className="bg-gradient-to-br from-stone-900 to-stone-950 p-6 rounded-xl border border-stone-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Share2 size={80} className="text-white" />
                        </div>

                        <div className="text-center space-y-4 relative z-10">
                            <p className="text-stone-400 text-sm uppercase tracking-widest font-bold">{t('referral.your_code') || (language === 'th' ? 'รหัสแนะนำของคุณ' : 'YOUR REFERRAL CODE')}</p>

                            <div className="flex items-center justify-center gap-3 bg-black/40 p-4 rounded-lg border border-yellow-900/30 backdrop-blur-sm">
                                <span className="text-3xl font-mono font-bold text-yellow-400 tracking-wider drop-shadow-lg">{referralCode}</span>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-yellow-500/20 rounded-full transition-all text-yellow-500 hover:text-yellow-300 active:scale-95"
                                    title="Copy Code"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                                <Users size={14} />
                                <span>{language === 'th' ? `เพื่อนที่แนะนำ: ${referralCount} คน` : `Friends Referred: ${referralCount}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Your Benefits Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] pl-1">
                            <Crown size={14} className="drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                            {t('referral.benefits') || 'YOUR BENEFITS'}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {/* Card 1: Purchase Bonus */}
                            <div className="bg-stone-900/80 p-4 rounded-2xl border border-yellow-600/20 shadow-lg relative overflow-hidden group hover:border-yellow-600/40 transition-all">
                                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                                    <Gift size={40} className="text-yellow-500" />
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30">
                                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                            <span className="text-stone-950 font-black text-xs">5/2/1%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-sm uppercase tracking-tight">
                                            {t('referral.purchase_bonus') || 'Purchase Referral Bonus'}
                                        </h4>
                                        <p className="text-stone-500 text-[10px] font-bold">
                                            {language === 'th' ? 'รับปันผล 3 ระดับ เมื่อเพื่อนซื้อเครื่องขุด' : '3-level bonus when friend buys a rig'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Mining Bonus */}
                            <div className="bg-stone-900/80 p-4 rounded-2xl border border-emerald-600/20 shadow-lg relative overflow-hidden group hover:border-emerald-600/40 transition-all">
                                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 -rotate-12">
                                    <TrendingUp size={40} className="text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                        <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                            <span className="text-stone-950 font-black text-xs">1/0.5%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-sm uppercase tracking-tight">
                                            {t('referral.mining_bonus') || 'Mining Income'}
                                        </h4>
                                        <p className="text-stone-500 text-[10px] font-bold">
                                            {language === 'th' ? 'ปันผลจากการขุด 3 ระดับแบบ Passive' : 'Passive income from 3-level mining'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded text-xs text-blue-300 text-center">
                        {language === 'th'
                            ? 'Tip: ยิ่งชวนเพื่อนมาก ยิ่งมีโอกาสได้กุญแจเปิดหาแร่มหาศาล!'
                            : 'Tip: Invite more friends to get more keys for rare minerals!'}
                    </div>
                </div>
            </div>
        </div>
    );
};
