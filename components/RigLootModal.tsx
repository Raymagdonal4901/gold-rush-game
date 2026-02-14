import React from 'react';
import { X, PackageOpen, Gift } from 'lucide-react';
import { RIG_LOOT_TABLES, MATERIAL_CONFIG, CURRENCY, RIG_PRESETS } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';

interface RigLootModalProps {
    isOpen: boolean;
    onClose: () => void;
    rig: any;
}

export const RigLootModal: React.FC<RigLootModalProps> = ({ isOpen, onClose, rig }) => {
    const { t, language } = useTranslation();

    if (!isOpen || !rig) return null;

    // Find preset to get the loot table ID
    const nameStr = typeof rig.name === 'string' ? rig.name : (rig.name?.en || rig.name?.th || '');
    const preset = RIG_PRESETS.find(p => p.name.en === nameStr || p.name.th === nameStr) || RIG_PRESETS.find(p => p.price === rig.investment);

    const presetId = preset?.id || 1;
    const lootTable = RIG_LOOT_TABLES[presetId] || [];

    const isThai = language === 'th';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex flex-col items-center pt-8 pb-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-stone-600 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 mb-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Gift size={32} className="text-yellow-500" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">
                        {isThai ? 'ของรางวัลที่เป็นไปได้' : 'Possible Rewards'}
                    </h2>
                    <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">
                        {getLocalized(preset?.name, language)}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    {lootTable.length === 0 ? (
                        <div className="text-center text-stone-500 py-8">
                            {isThai ? 'ไม่มีข้อมูลของรางวัล' : 'No reward data available'}
                        </div>
                    ) : (
                        lootTable.map((entry: any, index: number) => {
                            const matName = MATERIAL_CONFIG.NAMES[entry.matTier];
                            const matColor = MATERIAL_CONFIG.COLORS[entry.matTier] || 'text-white';

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-xl border border-stone-800 bg-stone-900/50 hover:bg-stone-900 hover:border-stone-700 transition-all group"
                                >
                                    <div className="flex flex-col">
                                        <span className={`font-bold text-sm ${matColor} group-hover:brightness-125 transition-all`}>
                                            {getLocalized(matName, language)}
                                        </span>
                                        <span className="text-xs text-stone-500 font-mono mt-0.5">
                                            AMOUNT x{entry.minAmount}{entry.maxAmount !== entry.minAmount ? `-${entry.maxAmount}` : ''}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">
                                            {isThai ? 'อัตราได้รับ' : 'Chance'}
                                        </span>
                                        <span className="text-lg font-black text-white">
                                            {entry.chance}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Tip */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-[10px] text-stone-600">
                        {isThai
                            ? '* ของรางวัลจะถูกสุ่มตามอัตราที่กำหนดเมื่อกดรับผลผลิต'
                            : '* Rewards are randomized based on rates when claimed.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Helper for localization
const getLocalized = (obj: any, lang: string) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return lang === 'th' ? (obj.th || obj.en) : (obj.en || obj.th);
};
