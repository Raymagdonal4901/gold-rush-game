import React from 'react';
import { X, Timer, ZapOff, Pickaxe, Drill } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ClaimCooldownModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    remainingMs?: number;
}

export const ClaimCooldownModal: React.FC<ClaimCooldownModalProps> = ({
    isOpen,
    onClose,
    message,
    remainingMs
}) => {
    const { t, language } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none opacity-50" />

                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 opacity-10 rotate-12">
                    <Pickaxe size={120} className="text-stone-400" />
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-10 -rotate-12">
                    <Drill size={120} className="text-stone-400" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-stone-500 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Mining Icon Header */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-stone-950 border-2 border-stone-800 flex items-center justify-center shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                        <div className="relative flex flex-col items-center">
                            <ZapOff size={32} className="text-orange-400 mb-1" />
                            <Timer size={24} className="text-orange-500/60 animate-spin-slow" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3 mb-8 relative z-10">
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-none italic">
                        {language === 'th' ? 'ระบบกำลังพักเครื่อง' : 'System Cooling'}
                    </h3>
                    <div className="bg-stone-950/50 border border-stone-800 rounded-2xl p-4 mt-4">
                        <p className="text-orange-400 font-mono font-bold text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Info Text */}
                <p className="text-stone-500 text-[10px] uppercase font-black tracking-widest mb-6">
                    {language === 'th' ? 'กรุณาตรวจสอบเวลาในหน้าจัดการเครื่องขุด' : 'Check status in your rig controls'}
                </p>

                {/* Main Action Button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-stone-950 font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {language === 'th' ? 'รับทราบ' : 'UNDERSTOOD'}
                </button>

            </div>
        </div>
    );
};
