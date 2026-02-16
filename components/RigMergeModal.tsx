import React, { useState, useEffect } from 'react';
import { X, ArrowRight, AlertTriangle, Check, Hammer, Star, Zap, Coins } from 'lucide-react';
import { OilRig } from '../services/types';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { MINING_VOLATILITY_CONFIG, RIG_PRESETS } from '../constants';

interface RigMergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseRig: OilRig;
    availableRigs: OilRig[];
    onMergeSuccess: (newRig: OilRig) => void;
}

export const RigMergeModal: React.FC<RigMergeModalProps> = ({ isOpen, onClose, baseRig, availableRigs, onMergeSuccess }) => {
    const { t, getLocalized, formatCurrency } = useTranslation();
    const [selectedRigId, setSelectedRigId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter compatible rigs:
    // 1. Same ID (Preset or Name check)
    // 2. Same Star Level
    // 3. Not the base rig itself
    // 4. Not broken/dead
    const compatibleRigs = availableRigs.filter(r => {
        if (r.id === baseRig.id) return false;
        if (r.isDead || r.status === 'BROKEN') return false;
        if ((r.starLevel || 0) !== (baseRig.starLevel || 0)) return false;

        const name1 = typeof baseRig.name === 'object' ? baseRig.name.en : baseRig.name;
        const name2 = typeof r.name === 'object' ? r.name.en : r.name;
        return name1 === name2;
    });

    // Reset selection when modal opens or baseRig changes
    useEffect(() => {
        setSelectedRigId(null);
        setError(null);
    }, [isOpen, baseRig.id]);

    if (!isOpen) return null;

    const selectedRig = compatibleRigs.find(r => r.id === selectedRigId);

    // Predicted Stats
    const currentStars = baseRig.starLevel || 0;
    const nextStars = currentStars + 1;
    const combinedHashrate = selectedRig ? (baseRig.dailyProfit + selectedRig.dailyProfit) * 1.10 : baseRig.dailyProfit * 2.10; // Approx preview
    const MERGE_FEE = 100;

    const handleMerge = async () => {
        if (!selectedRig) return;
        setIsProcessing(true);
        setError(null);
        try {
            const result = await api.mergeRigs(baseRig.id, selectedRig.id);
            if (result.success && result.rig) {
                onMergeSuccess(result.rig);
                onClose();
            } else {
                setError(result.message || 'Merge failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Merge failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                    <div className="flex items-center gap-2">
                        <Hammer className="text-yellow-500" size={20} />
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider">{t('rig.merge_system') || 'RIG MERGE SYSTEM'}</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-8">
                        {/* Base Rig */}
                        <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 flex flex-col items-center gap-2">
                            <div className="text-xs text-stone-500 uppercase font-bold">Base Rig</div>
                            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center border border-stone-700">
                                <Hammer className="text-stone-400" />
                            </div>
                            <div className="font-bold text-stone-300 text-center">{getLocalized(baseRig.name)}</div>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <Star size={12} fill="currentColor" /> <span>{currentStars}</span>
                            </div>
                            <div className="text-xs text-stone-500 font-mono">{formatCurrency(baseRig.dailyProfit, { hideSymbol: true })} / day</div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center justify-center gap-2">
                            <ArrowRight className="text-yellow-500 animate-pulse" size={32} />
                            <div className="px-3 py-1 bg-yellow-900/20 border border-yellow-700/50 rounded text-yellow-500 text-xs font-bold">
                                +10% BONUS
                            </div>
                        </div>

                        {/* Target/Result Rig */}
                        <div className={`bg-stone-950 p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${selectedRig ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-stone-800 border-dashed opacity-50'}`}>
                            <div className="text-xs text-stone-500 uppercase font-bold">Result</div>
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-900/50 to-stone-900 rounded-full flex items-center justify-center border border-yellow-700/50">
                                <Star className="text-yellow-400" size={32} fill="currentColor" />
                            </div>
                            <div className="font-bold text-yellow-400 text-center">{getLocalized(baseRig.name)}</div>
                            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-900/30 px-2 py-0.5 rounded-full border border-yellow-700/50">
                                <Star size={12} fill="currentColor" /> <span>{nextStars}</span>
                            </div>
                            <div className="text-xs text-emerald-400 font-mono font-bold">
                                {selectedRig ? formatCurrency(combinedHashrate, { hideSymbol: true }) : '???'} / day
                            </div>
                        </div>
                    </div>

                    {/* Selection Area */}
                    <h3 className="text-stone-400 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                        <Check size={16} /> Select Material Rig
                    </h3>

                    {compatibleRigs.length === 0 ? (
                        <div className="p-8 text-center border border-stone-800 border-dashed rounded-lg bg-stone-900/50">
                            <AlertTriangle className="mx-auto text-yellow-500 mb-2" size={24} />
                            <p className="text-stone-400 text-sm">No compatible rigs found.</p>
                            <p className="text-stone-600 text-xs mt-1">Need identical rig with same Star Level.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {compatibleRigs.map(rig => (
                                <div
                                    key={rig.id}
                                    onClick={() => setSelectedRigId(rig.id)}
                                    className={`p-3 rounded border cursor-pointer transition-all flex flex-col gap-1 relative ${selectedRigId === rig.id ? 'bg-yellow-900/20 border-yellow-500' : 'bg-stone-950 border-stone-800 hover:border-stone-600'}`}
                                >
                                    <div className="text-xs font-bold text-stone-300 truncate">{getLocalized(rig.name)}</div>
                                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                                        <span>Durability: {Math.floor((rig.currentDurability || 3000) / 30)}%</span>
                                        <div className="flex items-center gap-0.5 text-yellow-600"><Star size={8} fill="currentColor" /> {rig.starLevel || 0}</div>
                                    </div>
                                    {selectedRigId === rig.id && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_5px_rgba(234,179,8,1)]"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-stone-500 text-xs">Merge Fee</span>
                        <span className={`font-mono font-bold text-lg flex items-center gap-1 ${MERGE_FEE > 0 ? 'text-red-400' : 'text-stone-300'}`}>
                            {formatCurrency(MERGE_FEE)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {error && <span className="text-red-500 text-xs font-bold animate-pulse">{error}</span>}
                        <button
                            onClick={handleMerge}
                            disabled={!selectedRig || isProcessing}
                            className={`px-6 py-3 rounded-lg font-bold uppercase flex items-center gap-2 ${!selectedRig || isProcessing ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-yellow-600 text-white hover:bg-yellow-500 shadow-lg shadow-yellow-900/20'}`}
                        >
                            {isProcessing ? (
                                <><Hammer className="animate-spin" size={18} /> Merging...</>
                            ) : (
                                <><Zap size={18} /> Confirm Merge</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
