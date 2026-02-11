import React from 'react';
import { X, Gift, Users, ArrowRight, Star, Key } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ReferralAnnouncementProps {
    onClose: () => void;
}

export const ReferralAnnouncement: React.FC<ReferralAnnouncementProps> = ({ onClose }) => {
    const { language } = useTranslation();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] border-2 border-yellow-600/50 w-full max-w-xl rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">

                {/* Header with high-impact visuals */}
                <div className="bg-gradient-to-r from-yellow-900/60 via-yellow-800/40 to-yellow-900/60 p-8 text-center border-b border-yellow-600/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                    {/* Animated Glow Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full animate-pulse"></div>

                    <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center justify-center p-3 bg-yellow-500/20 rounded-2xl border border-yellow-500/50 shadow-xl mb-2">
                            <Users size={40} className="text-yellow-400" />
                        </div>
                        <h2 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 uppercase tracking-tighter italic">
                            {language === 'th' ? 'ระบบชวนเพื่อนมาแล้ว!' : 'Referral System is LIVE!'}
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                            <Star size={14} className="text-yellow-500 fill-yellow-500 animate-spin-slow" />
                            <p className="text-yellow-500/90 text-sm font-bold tracking-widest uppercase">
                                {language === 'th' ? 'ชวนเพื่อนวันนี้ รับรางวัลมหาศาล' : 'Invite Friends & Earn Epic Rewards'}
                            </p>
                            <Star size={14} className="text-yellow-500 fill-yellow-500 animate-spin-slow" />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar bg-stone-950/20">

                    {/* Reward Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Referrer Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-yellow-500 text-xs font-black uppercase tracking-widest pl-1">
                                <div className="w-4 h-[1px] bg-yellow-500/50"></div>
                                {language === 'th' ? 'สำหรับคุณ (ผู้ชวน)' : 'For You (Referrer)'}
                            </div>
                            <div className="bg-stone-900/80 p-5 rounded-2xl border border-yellow-600/20 shadow-lg relative group transition-all hover:bg-stone-900">
                                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Key size={40} className="text-yellow-500" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30">
                                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                            <Key className="text-stone-950" size={32} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg">1 Mine Key</p>
                                        <p className="text-stone-500 text-xs leading-tight">
                                            {language === 'th' ? 'ได้รับเมื่อเพื่อนเติมเงินครั้งแรก' : 'Earned after friend’s first deposit'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Referee Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest pl-1">
                                <div className="w-4 h-[1px] bg-emerald-500/50"></div>
                                {language === 'th' ? 'สำหรับเพื่อน (ผู้ร่วมทาง)' : 'For Friend (Referee)'}
                            </div>
                            <div className="bg-stone-900/80 p-5 rounded-2xl border border-emerald-600/20 shadow-lg group hover:bg-stone-900 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                        <img src="/assets/items/hat.png" alt="Hat" className="w-10 h-10 object-contain drop-shadow-lg" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg">
                                            {language === 'th' ? 'หมวกนิรภัยมาตรฐาน' : 'Standard Helmet'}
                                        </p>
                                        <p className="text-stone-500 text-xs leading-tight">
                                            {language === 'th' ? 'รับฟรีทันที! (กดรับได้ในกล่องจดหมาย)' : 'Get Free! (Claim in Mailbox)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to use */}
                    <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                            <ArrowRight size={16} className="text-yellow-500" />
                            {language === 'th' ? 'วิธีการใช้งาน' : 'How to Participate'}
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start gap-4 p-3 bg-stone-950/50 rounded-xl border border-stone-800">
                                <div className="bg-yellow-500 text-stone-950 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</div>
                                <p className="text-stone-300 text-sm">
                                    {language === 'th' ? 'ส่งต่อชื่อของคุณ หรือรหัสแนะนำให้เพื่อน' : 'Send your username or referral code to your friends'}
                                </p>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-stone-950/50 rounded-xl border border-stone-800">
                                <div className="bg-yellow-500 text-stone-950 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</div>
                                <p className="text-stone-300 text-sm">
                                    {language === 'th' ? 'ให้เพื่อนใส่รหัสในช่อง "รหัสแนะนำ" ตอนลงทะเบียน' : 'Have them enter it in the "Referral Code" field during registration'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 bg-stone-900 border-t border-stone-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-stone-950 font-black py-4 rounded-xl shadow-[0_4px_15px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                    >
                        <span>{language === 'th' ? 'เข้าสู่เกมและเริ่มขุด!' : 'START MINING NOW!'}</span>
                        <ArrowRight size={22} />
                    </button>
                    <p className="text-center text-stone-500 text-[10px] uppercase mt-3 tracking-widest">
                        Gold Rush Mining - Building the Future together
                    </p>
                </div>

            </div>
        </div>
    );
};
