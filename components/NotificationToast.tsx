import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X, Coins, Zap, Package } from 'lucide-react';

export interface ToastProps {
    id: string;
    title: string;
    message: string;
    type: 'SUCCESS' | 'ERROR' | 'INFO' | 'REWARD' | 'TRANSACTION';
    onClose: (id: string) => void;
    duration?: number;
}

export const NotificationToast: React.FC<ToastProps> = ({
    id,
    title,
    message,
    type,
    onClose,
    duration = 5000
}) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match animation duration
    };

    const getIcon = () => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="text-emerald-400" size={20} />;
            case 'ERROR': return <AlertCircle className="text-red-400" size={20} />;
            case 'REWARD': return <Sparkles className="text-yellow-400" size={20} />;
            case 'TRANSACTION': return <Coins className="text-blue-400" size={20} />;
            default: return <Info className="text-sky-400" size={20} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'SUCCESS': return 'border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10';
            case 'ERROR': return 'border-red-500/30 bg-red-500/5 shadow-red-500/10';
            case 'REWARD': return 'border-yellow-500/30 bg-yellow-500/5 shadow-yellow-500/10';
            case 'TRANSACTION': return 'border-blue-500/30 bg-blue-500/5 shadow-blue-500/10';
            default: return 'border-sky-500/30 bg-sky-500/5 shadow-sky-500/10';
        }
    };

    const getGlow = () => {
        switch (type) {
            case 'SUCCESS': return 'bg-emerald-500';
            case 'ERROR': return 'bg-red-500';
            case 'REWARD': return 'bg-yellow-500';
            case 'TRANSACTION': return 'bg-blue-500';
            default: return 'bg-sky-500';
        }
    };

    return (
        <div className={`relative group w-72 mb-3 pointer-events-auto ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}>
            {/* Glassmorphic Background */}
            <div className={`relative overflow-hidden backdrop-blur-xl border ${getColors()} rounded-2xl p-4 shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-opacity-50`}>

                {/* Accent Glow */}
                <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 ${getGlow()} rounded-full blur-[1px] opacity-80`} />

                {/* Dynamic Background Glow */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${getGlow()} opacity-[0.03] blur-3xl pointer-events-none`} />

                <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5 relative">
                        <div className={`absolute inset-0 blur-md opacity-20 ${getGlow()}`} />
                        {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5 truncate">
                            {title}
                        </h4>
                        <p className="text-[11px] text-stone-400 font-bold leading-tight line-clamp-2">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 p-1 text-stone-600 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full overflow-hidden rounded-b-2xl">
                    <div
                        className={`h-full ${getGlow()} opacity-30`}
                        style={{
                            animation: `toast-progress ${duration}ms linear forwards`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
