import React from 'react';
import { X, CheckCircle2, Sparkles, Key, Battery } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'SUCCESS' | 'KEY' | 'BATTERY';
    actionLabel?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'SUCCESS',
    actionLabel
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'KEY':
                return <Key className="text-yellow-400" size={48} />;
            case 'BATTERY':
                return <Battery className="text-emerald-400" size={48} />;
            default:
                return <CheckCircle2 className="text-emerald-400" size={48} />;
        }
    };

    const getThemeColor = () => {
        switch (type) {
            case 'KEY': return 'from-yellow-400 to-yellow-600';
            case 'BATTERY': return 'from-emerald-400 to-emerald-600';
            default: return 'from-emerald-400 to-emerald-600';
        }
    };

    const getGlowColor = () => {
        switch (type) {
            case 'KEY': return 'bg-yellow-500/20';
            case 'BATTERY': return 'bg-emerald-500/20';
            default: return 'bg-emerald-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content Card */}
            <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Background Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${getGlowColor()} rounded-full blur-[80px] pointer-events-none opacity-50`} />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-stone-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Animated Icon Header */}
                <div className="relative mb-8">
                    <div className={`absolute inset-0 blur-2xl opacity-30 animate-pulse ${getGlowColor().replace('/20', '/100')}`} />
                    <div className={`relative w-24 h-24 rounded-full bg-stone-950 border-2 border-stone-800 flex items-center justify-center shadow-2xl`}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        {getIcon()}

                        {/* Smaller floating sparkles */}
                        <div className="absolute -top-2 -right-2 animate-bounce">
                            <Sparkles className="text-yellow-400/80" size={16} />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3 mb-8 relative z-10">
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-none">
                        {title}
                    </h3>
                    <p className="text-stone-400 font-bold leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={onClose}
                    className={`w-full py-4 rounded-2xl bg-gradient-to-r ${getThemeColor()} text-stone-950 font-black uppercase tracking-widest text-sm shadow-xl shadow-yellow-900/10 hover:scale-[1.02] active:scale-95 transition-all group`}
                >
                    <span className="flex items-center justify-center gap-2">
                        {actionLabel || t('common.continue') || 'GREAT!'}
                        <CheckCircle2 size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </span>
                </button>

            </div>
        </div>
    );
};
