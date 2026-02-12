
import React from 'react';
import { X, Crown, Star, Check } from 'lucide-react';
import { VIP_TIERS, CURRENCY } from '../constants';
import { User } from '../services/types';

import { useTranslation } from '../contexts/LanguageContext';

interface VIPModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export const VIPModal: React.FC<VIPModalProps> = ({ isOpen, onClose, user }) => {
    const { t, getLocalized } = useTranslation();
    if (!isOpen) return null;

    const currentExp = user.vipExp || 0;
    const currentTier = VIP_TIERS.slice().reverse().find(t => currentExp >= t.minExp) || VIP_TIERS[0];
    const nextTier = VIP_TIERS.find(t => t.level === currentTier.level + 1);

    const progress = nextTier
        ? Math.min(100, ((currentExp - currentTier.minExp) / (nextTier.minExp - currentTier.minExp)) * 100)
        : 100;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-950 border border-yellow-600/30 w-[95%] sm:w-full sm:max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-900/40 to-stone-900 p-6 border-b border-yellow-900/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-yellow-500 bg-yellow-900/20 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                            <Crown size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-widest">{t('vip.title')}</h2>
                            <p className="text-sm text-yellow-500">{t('vip.current_level')}: LV. {currentTier.level}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Section */}
                <div className="p-6 bg-stone-900 border-b border-stone-800">
                    <div className="flex justify-between text-sm mb-2 text-stone-300">
                        <span>{t('vip.total_exp')}: {currentExp.toLocaleString()} {CURRENCY}</span>
                        {nextTier && <span>{t('vip.next_level')}: {nextTier.minExp.toLocaleString()} {CURRENCY}</span>}
                    </div>
                    <div className="w-full h-4 bg-stone-950 rounded-full border border-stone-700 overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-yellow-700 to-yellow-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-stone-500 mt-2 text-center">{t('vip.level_up_desc')}</p>
                </div>

                {/* Tiers List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-950/80 space-y-4">
                    {VIP_TIERS.map((tier) => {
                        const isCurrent = tier.level === currentTier.level;
                        const isUnlocked = currentTier.level >= tier.level;

                        return (
                            <div key={tier.level} className={`relative p-4 rounded-xl border flex items-center gap-4 transition-all
                        ${isCurrent ? 'bg-yellow-900/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
                                    isUnlocked ? 'bg-stone-900 border-stone-700 opacity-70' : 'bg-stone-950 border-stone-800 opacity-40 grayscale'}
                    `}>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl border 
                            ${isCurrent ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-stone-800 text-stone-500 border-stone-700'}
                        `}>
                                    {tier.level}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${isCurrent ? 'text-yellow-400' : 'text-stone-300'}`}>VIP {tier.level}</h4>
                                    <p className="text-xs text-stone-500">{t('vip.min_exp')} {tier.minExp.toLocaleString()}+</p>
                                </div>
                                <div className="flex-1 text-sm text-stone-300 font-medium">
                                    {getLocalized(tier.perk)}
                                </div>
                                {isUnlocked && (
                                    <div className="bg-emerald-900/20 p-1 rounded-full border border-emerald-500/50">
                                        <Check size={16} className="text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
