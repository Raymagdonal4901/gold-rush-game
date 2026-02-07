
import React, { useState } from 'react';
import { X, Users, Copy, Check, Coins, Gift } from 'lucide-react';
import { User } from '../services/types';
import { CURRENCY } from '../constants';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, user }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        if (user.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-900/20 p-2 rounded text-blue-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">ชวนเพื่อน</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">Referral Program</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center justify-center">
                            <span className="text-stone-500 text-xs uppercase tracking-widest mb-1">รายได้สะสม</span>
                            <div className="text-2xl font-mono font-bold text-emerald-400">
                                {user.referralEarnings?.toLocaleString() || 0} <span className="text-xs text-stone-500">{CURRENCY}</span>
                            </div>
                        </div>
                        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center justify-center">
                            <span className="text-stone-500 text-xs uppercase tracking-widest mb-1">รหัสแนะนำ</span>
                            <div className="text-xl font-mono font-bold text-white tracking-widest">
                                {user.referralCode || '-'}
                            </div>
                        </div>
                    </div>

                    {/* Copy Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-400">ลิงก์/รหัสแนะนำของคุณ</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-white font-mono text-sm truncate flex items-center">
                                {user.referralCode}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                            </button>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800 space-y-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Gift size={16} className="text-yellow-500" /> สิทธิประโยชน์
                        </h4>
                        <ul className="text-xs text-stone-400 space-y-2">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-stone-600 mt-1.5"></div>
                                <span>รับทันที <strong>2%</strong> จากยอดซื้อเครื่องจักรของเพื่อน</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-stone-600 mt-1.5"></div>
                                <span>รับทันที <strong>5%</strong> จากยอดซื้ออุปกรณ์ในร้านค้า</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-stone-600 mt-1.5"></div>
                                <span>เพื่อนที่สมัครผ่านคุณจะได้รับโบนัสเริ่มต้นพิเศษ (หากมีกิจกรรม)</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};
