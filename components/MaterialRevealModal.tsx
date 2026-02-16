import React, { useEffect, useState } from 'react';
import { X, Sparkles, Package } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { MATERIAL_CONFIG } from '../constants';
import { MaterialIcon } from './MaterialIcon';

interface MaterialRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    materialName: string | { th: string; en: string };
    materialTier: number;
    amount: number;
}

export const MaterialRevealModal: React.FC<MaterialRevealModalProps> = ({
    isOpen,
    onClose,
    materialName,
    materialTier,
    amount
}) => {
    const { t, getLocalized } = useTranslation();
    const [stage, setStage] = useState<'opening' | 'reveal' | 'done'>('opening');

    useEffect(() => {
        if (isOpen) {
            setStage('opening');
            // Opening animation
            setTimeout(() => setStage('reveal'), 400);
            setTimeout(() => setStage('done'), 800);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getTierColor = (tier: number) => {
        const colors = MATERIAL_CONFIG.COLORS;
        return colors[tier as keyof typeof colors] || 'text-white';
    };

    const getTierGlow = (tier: number) => {
        switch (tier) {
            case 5: return 'shadow-[0_0_60px_rgba(234,179,8,0.8)]'; // Diamond/Gold
            case 4: return 'shadow-[0_0_40px_rgba(168,85,247,0.6)]';
            case 3: return 'shadow-[0_0_30px_rgba(59,130,246,0.6)]';
            default: return 'shadow-[0_0_20px_rgba(255,255,255,0.4)]';
        }
    };

    const isOpening = stage === 'opening';
    const isReveal = stage === 'reveal' || stage === 'done';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm flex flex-col items-center">

                {/* Close Button (Only show when done) */}
                {stage === 'done' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors animate-in fade-in duration-500"
                    >
                        <X size={24} />
                    </button>
                )}

                {/* Title */}
                <h2 className={`text-2xl font-bold text-white mb-8 transition-all duration-1000 ${isOpening ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    {t('loot.reward_received')}
                </h2>

                {/* Main Content */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">

                    {/* Opening Stage: Bouncing Box */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isOpening ? 'scale-100 opacity-100' : 'scale-150 opacity-0 pointer-events-none'}`}>
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce">
                            <Package size={64} className="text-yellow-100" />
                        </div>
                    </div>

                    {/* Reveal Stage: Material Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 delay-300 ${isReveal ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                        <div className={`w-40 h-40 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center relative ${getTierGlow(materialTier)}`}>
                            <Sparkles className="absolute top-2 right-4 text-yellow-400 animate-spin-slow" size={24} />

                            <MaterialIcon id={materialTier} size="w-24 h-24" />

                            <div className="absolute -bottom-3 bg-stone-950 px-4 py-1 rounded-full border border-stone-700 shadow-xl">
                                <span className="text-white font-mono font-bold text-lg">x{amount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Name & Tier */}
                <div className={`text-center space-y-2 transition-all duration-1000 delay-500 ${isReveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className={`text-xl font-bold ${getTierColor(materialTier)}`}>
                        {getLocalized(materialName)}
                    </div>
                    <div className="text-sm text-stone-500 font-mono tracking-widest uppercase">
                        TIER {materialTier} MATERIAL
                    </div>
                </div>

                {/* Action Button */}
                {stage === 'done' && (
                    <button
                        onClick={onClose}
                        className="mt-12 bg-white text-black font-bold py-3 px-12 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        {t('common.continue')}
                    </button>
                )}

            </div>
        </div>
    );
};
