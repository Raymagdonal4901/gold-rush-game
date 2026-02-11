import React from 'react';
import { X, Copy, Share2, Users, Gift, Crown, Key } from 'lucide-react';
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

                    {/* Rewards Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Referrer Reward */}
                        <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-800 hover:border-yellow-900/50 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-yellow-500 font-bold text-sm uppercase">
                                <Crown size={16} />
                                {language === 'th' ? 'คุณจะได้รับ' : 'You Get'}
                            </div>
                            <div className="flex items-center gap-3 bg-stone-950 p-3 rounded border border-stone-800">
                                <div className="w-10 h-10 bg-yellow-900/20 rounded flex items-center justify-center border border-yellow-500/30">
                                    <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                                        <Key className="text-stone-900" size={20} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">1 Mine Key</div>
                                    <div className="text-xs text-stone-500">{language === 'th' ? 'เมื่อเพื่อนเติมเงินครั้งแรก' : 'When friend deposits'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Referee Reward */}
                        <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-800 hover:border-emerald-900/50 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-sm uppercase">
                                <Gift size={16} />
                                {language === 'th' ? 'เพื่อนได้รับ' : 'Friend Gets'}
                            </div>
                            <div className="flex items-center gap-3 bg-stone-950 p-3 rounded border border-stone-800">
                                <div className="w-10 h-10 bg-emerald-900/20 rounded flex items-center justify-center border border-emerald-500/30">
                                    <img src="/assets/items/hat.png" alt="Hat" className="w-6 h-6 object-contain" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">
                                        {language === 'th' ? 'หมวกนิรภัยมาตรฐาน' : 'Standard Helmet'}
                                    </div>
                                    <div className="text-xs text-stone-500">
                                        {language === 'th' ? 'กดยืนยันรับจากกล่องจดหมาย' : 'Claim in your mailbox'}
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
