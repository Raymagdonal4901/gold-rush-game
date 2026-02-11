import React, { useEffect, useState } from 'react';
import { X, Sparkles, Gift } from 'lucide-react';
import { InfinityGlove } from './InfinityGlove';
import { useTranslation } from '../contexts/LanguageContext';
import { CURRENCY } from '../constants';

interface GloveRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    gloveName: string | { th: string; en: string };
    gloveRarity: string;
    gloveBonus: number;
}

export const GloveRevealModal: React.FC<GloveRevealModalProps> = ({
    isOpen,
    onClose,
    gloveName,
    gloveRarity,
    gloveBonus
}) => {
    const { t, getLocalized } = useTranslation();
    const [stage, setStage] = useState<'opening' | 'reveal' | 'done'>('opening');

    useEffect(() => {
        if (isOpen) {
            setStage('opening');
            // Opening animation
            setTimeout(() => setStage('reveal'), 1500);
            setTimeout(() => setStage('done'), 2500);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'text-stone-400';
            case 'UNCOMMON': return 'text-green-400';
            case 'RARE': return 'text-blue-400';
            case 'EPIC': return 'text-purple-400';
            case 'LEGENDARY': return 'text-yellow-400';
            default: return 'text-white';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'LEGENDARY': return 'shadow-[0_0_60px_rgba(234,179,8,0.8)]';
            case 'EPIC': return 'shadow-[0_0_40px_rgba(168,85,247,0.6)]';
            case 'RARE': return 'shadow-[0_0_30px_rgba(59,130,246,0.5)]';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
            <div className="relative">
                {/* Close button */}
                {stage === 'done' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-800/50 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                {/* Opening Animation */}
                {stage === 'opening' && (
                    <div className="flex flex-col items-center gap-6 animate-pulse">
                        <Gift size={100} className="text-yellow-500 animate-bounce" />
                        <div className="text-2xl font-bold text-yellow-400">{t('glove_reveal.randomizing')}</div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}

                {/* Reveal Animation */}
                {(stage === 'reveal' || stage === 'done') && (
                    <div className={`flex flex-col items-center gap-6 transition-all duration-500 ${stage === 'reveal' ? 'scale-110' : 'scale-100'}`}>
                        {/* Sparkles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <Sparkles
                                    key={i}
                                    size={Math.random() * 20 + 10}
                                    className="absolute text-yellow-400 animate-ping"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${Math.random() * 2 + 1}s`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Glove Icon */}
                        <div className={`relative bg-stone-900/80 rounded-full p-8 ${getRarityGlow(gloveRarity)} transition-all duration-500`}>
                            <InfinityGlove rarity={gloveRarity} className="w-32 h-32" />
                        </div>

                        {/* Info */}
                        <div className="text-center">
                            <div className="text-sm text-stone-500 mb-1">{t('glove_reveal.received')}</div>
                            <div className={`text-2xl font-bold ${getRarityColor(gloveRarity)}`}>
                                {getLocalized(gloveName)}
                            </div>
                            <div className={`text-xl font-mono mt-2 ${getRarityColor(gloveRarity)}`}>
                                +{gloveBonus.toFixed(2)} {CURRENCY}{t('common.per_day')}
                            </div>
                            <div className="text-stone-500 text-sm mt-4">
                                {t('glove_reveal.auto_equip')}
                            </div>
                        </div>

                        {/* Close button */}
                        {stage === 'done' && (
                            <button
                                onClick={onClose}
                                className="mt-4 px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold rounded-lg transition-all"
                            >
                                {t('glove_reveal.claim')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
