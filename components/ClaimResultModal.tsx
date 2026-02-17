import React from 'react';
import { X, Sparkles, Coins } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ClaimResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
}

export const ClaimResultModal: React.FC<ClaimResultModalProps> = ({ isOpen, onClose, amount }) => {
    const { t, language, formatCurrency } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-600/20 rounded-full blur-[60px] pointer-events-none" />

                {/* Success Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-5 rounded-full shadow-lg shadow-yellow-900/40">
                        <Sparkles size={40} className="text-stone-900 animate-pulse" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">
                        {language === 'th' ? 'เก็บผลผลิตสำเร็จ!' : 'Claim Successful!'}
                    </h3>
                    <p className="text-stone-400 text-sm font-bold">
                        {language === 'th' ? 'คุณได้รับรายได้ทั้งหมด:' : 'You have received total income:'}
                    </p>
                </div>

                {/* Amount Display */}
                <div className="bg-stone-800/50 border border-stone-700/50 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-inner">
                    <Coins className="text-yellow-500" size={24} />
                    <span className="text-3xl font-black text-white">
                        {formatCurrency(amount)}
                    </span>
                </div>

                {/* Collect Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg shadow-yellow-900/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {language === 'th' ? 'ตกลง' : 'Great!'}
                </button>

                {/* Close Button Top-Right (Optional) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-stone-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
