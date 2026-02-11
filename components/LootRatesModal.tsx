
import React from 'react';
import { X, PackageOpen } from 'lucide-react';
import { RARITY_SETTINGS, CURRENCY } from '../constants';
import { InfinityGlove } from './InfinityGlove';
import { useTranslation } from '../contexts/LanguageContext';

interface LootRatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LootRatesModal: React.FC<LootRatesModalProps> = ({ isOpen, onClose }) => {
    const { t, formatCurrency, language } = useTranslation();
    if (!isOpen) return null;

    const rates = [
        { key: 'COMMON', chance: '80%', name: t('loot_rates.staff'), ...RARITY_SETTINGS.COMMON },
        { key: 'RARE', chance: '11%', name: t('loot_rates.supervisor'), ...RARITY_SETTINGS.RARE },
        { key: 'SUPER_RARE', chance: '5%', name: t('loot_rates.manager'), ...RARITY_SETTINGS.SUPER_RARE },
        { key: 'EPIC', chance: '3%', name: t('loot_rates.executive'), ...RARITY_SETTINGS.EPIC },
        { key: 'LEGENDARY', chance: '1%', name: t('loot_rates.partner'), ...RARITY_SETTINGS.LEGENDARY },
    ];

    const isThai = language === 'th';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-900/20 p-2 rounded text-yellow-500">
                            <PackageOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('loot_rates.title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{t('loot_rates.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-stone-400 text-sm mb-6 font-light">
                        {t('loot_rates.description_pre')}
                        <span className="text-yellow-500 font-bold"> {t('loot_rates.manager_highlight')} </span>
                        {t('loot_rates.description_post')}
                    </p>

                    <div className="space-y-3">
                        {rates.map((tier) => (
                            <div
                                key={tier.key}
                                className={`flex items-center justify-between p-4 rounded-lg border bg-stone-900/50 ${tier.border} border-opacity-30 hover:bg-stone-900 transition-colors`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-lg bg-stone-950 flex items-center justify-center border ${tier.border} shadow-lg relative overflow-hidden group`}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} opacity-20`}></div>
                                        <InfinityGlove rarity={tier.key as any} size={40} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold font-display uppercase tracking-wide text-sm ${tier.color}`}>
                                            {tier.name}
                                        </h3>
                                        <p className="text-xs text-stone-500">{t('loot_rates.level_label')} {tier.label}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-bold text-stone-300">{tier.chance}</div>
                                    <div className="text-xs font-mono text-green-400">+{formatCurrency(tier.bonus, { forceUSD: true, hideSymbol: isThai })}{t('common.per_day')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-900/50 border-t border-stone-800 text-center">
                    <button onClick={onClose} className="text-sm text-stone-500 hover:text-stone-300 uppercase tracking-widest font-bold">
                        {t('loot_rates.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};
