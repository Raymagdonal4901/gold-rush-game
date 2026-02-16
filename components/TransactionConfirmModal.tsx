import React from 'react';
import { X, Zap, AlertCircle } from 'lucide-react';

interface TransactionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'furnace' | 'default';
}

export const TransactionConfirmModal: React.FC<TransactionConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    type = 'furnace'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with extreme blur and dark tint */}
            <div
                className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className={`
                relative w-full max-w-md bg-stone-900 border-2 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200
                ${type === 'furnace' ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-stone-700'}
            `}>
                {/* Visual Flair (Glowing Background) */}
                {type === 'furnace' && (
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-[80px]"></div>
                )}

                {/* Header */}
                <div className="relative p-6 flex items-center justify-between border-b border-stone-800 bg-stone-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${type === 'furnace' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-stone-800 text-stone-400'}`}>
                            {type === 'furnace' ? <Zap size={24} className="animate-pulse" /> : <AlertCircle size={24} />}
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-stone-100 italic">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-stone-800 text-stone-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <p className="text-xl font-bold text-stone-300 leading-relaxed text-center">
                        {message}
                    </p>

                    {type === 'furnace' && (
                        <div className="mt-6 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-500/70">
                                High-Performance Overclock
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 bg-stone-950/50 border-t border-stone-800 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 px-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-400 font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`
                            flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg
                            ${type === 'furnace'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-900/20 animate-pulse'
                                : 'bg-emerald-600 text-white shadow-emerald-900/20'
                            }
                        `}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
