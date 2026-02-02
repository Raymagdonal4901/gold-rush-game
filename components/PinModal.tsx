import React, { useState, useEffect } from 'react';
import { X, Delete, ShieldCheck, Lock } from 'lucide-react';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
    title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    title = "กรอกรหัส PIN"
}) => {
    const [pin, setPin] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleKeyPress = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError(null);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (pin.length >= 4) {
            onSuccess(pin);
        } else {
            setError('กรุณากรอกรหัส PIN ให้ครบถ้วน');
        }
    };

    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <ShieldCheck size={20} className="text-emerald-500" />
                        <span>{title}</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    {/* PIN Display */}
                    <div className="flex gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${i < pin.length
                                        ? 'bg-emerald-500 border-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                        : 'border-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs mb-4 font-medium animate-bounce">
                            {error}
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                        {numbers.map((key, i) => {
                            if (key === '') return <div key={i} />;

                            if (key === 'delete') {
                                return (
                                    <button
                                        key={i}
                                        onClick={handleBackspace}
                                        className="aspect-square rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all"
                                    >
                                        <Delete size={24} />
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleKeyPress(key)}
                                    className="aspect-square rounded-2xl bg-slate-800 text-2xl font-bold text-white flex items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all border border-slate-700/50 shadow-lg"
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={pin.length < 4}
                        className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${pin.length >= 4
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-emerald-500/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Lock size={18} /> ยืนยันรหัส PIN
                    </button>
                </div>
            </div>
        </div>
    );
};
