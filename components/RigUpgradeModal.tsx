import React, { useState } from 'react';
import { X, ArrowUp, Zap, ShoppingCart, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { MATERIAL_CONFIG, RIG_UPGRADE_RULES, RIG_STATS_CONFIG, MAX_RIG_LEVEL, RIG_LEVEL_STYLES } from '../constants';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { MaterialIcon } from './MaterialIcon';

interface RigUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    rig: any;
    user: any;
    onSuccess: () => void;
    inventory: any[];
}

export const RigUpgradeModal: React.FC<RigUpgradeModalProps> = ({ isOpen, onClose, rig, user, onSuccess, inventory }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);

    if (!isOpen || !rig) return null;

    const currentLevel = rig.level || 1;
    const nextLevel = currentLevel + 1;
    const tierId = rig.tierId || 1;
    const rule = RIG_UPGRADE_RULES[tierId];

    const calculateCost = (lvl: number) => rule ? Math.floor(rule.baseCost * Math.pow(rule.costMultiplier, lvl - 1)) : 0;
    const calculateEnergy = (lvl: number) => (RIG_STATS_CONFIG.baseEnergy || 100) + (lvl - 1) * RIG_STATS_CONFIG.energyStep;
    const calculateEfficiency = (lvl: number) => rule ? (Math.pow(rule.statGrowth, lvl - 1) - 1) * 100 : 0;

    const upgradeCost = calculateCost(currentLevel);
    const matTier = rule?.materialTier || 0;
    const userMaterials = user?.materials?.[matTier.toString()] || 0;
    const canAfford = userMaterials >= upgradeCost;
    const matName = MATERIAL_CONFIG.NAMES[matTier as keyof typeof MATERIAL_CONFIG.NAMES] || { th: 'แร่', en: 'Ore' };

    const handleUpgrade = async () => {
        if (!canAfford || loading || currentLevel >= MAX_RIG_LEVEL) return;
        setLoading(true);
        try {
            const res = await api.upgradeRig(rig.id);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                alert(res.message);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Error upgrading rig');
        } finally {
            setLoading(false);
        }
    };

    const levels = Array.from({ length: MAX_RIG_LEVEL }, (_, i) => i + 1);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-stone-900 border border-blue-600/30 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950 shrink-0">
                    <div className="flex items-center gap-2">
                        <ArrowUp className="text-blue-500" size={20} />
                        <h2 className="text-lg font-black text-white uppercase tracking-widest">
                            {language === 'th' ? `อัปเกรดเครื่องขุด` : `Upgrade Mining Rig`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Level Display */}
                    <div className="flex items-center justify-center gap-8 py-2">
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full bg-stone-800 border-2 border-stone-700 flex items-center justify-center text-xl font-black text-stone-400`}>
                                {currentLevel}
                            </div>
                            <span className="text-[10px] font-bold text-stone-500 mt-2 uppercase tracking-widest">
                                {language === 'th' ? 'ระดับปัจจุบัน' : 'Current Level'}
                            </span>
                        </div>
                        <ArrowUp className="text-blue-500/50 rotate-90" size={24} />
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center text-xl font-black text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]`}>
                                {nextLevel}
                            </div>
                            <span className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest">
                                {language === 'th' ? 'ระดับถัดไป' : 'Next Level'}
                            </span>
                        </div>
                    </div>

                    {/* Next Level Benefits */}
                    <div className="bg-stone-950/50 rounded-xl p-4 border border-stone-800">
                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Info size={14} className="text-blue-400" />
                            {language === 'th' ? 'สิ่งที่จะได้รับจากการเลื่อนระดับ' : 'Next Level Benefits'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                                <span className="text-[10px] font-bold text-stone-500 block mb-1 uppercase tracking-tighter">
                                    {language === 'th' ? 'ประสิทธิภาพการขุด' : 'Mining Efficiency'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-stone-500">+{calculateEfficiency(currentLevel).toFixed(0)}%</span>
                                    <ArrowUp size={10} className="text-emerald-500" />
                                    <span className="font-black text-emerald-400">+{calculateEfficiency(nextLevel).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                                <span className="text-[10px] font-bold text-stone-500 block mb-1 uppercase tracking-tighter">
                                    {language === 'th' ? 'เพิ่มพลังงาน' : 'Max Energy'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-stone-500 line-through text-stone-500">{calculateEnergy(currentLevel)}</span>
                                    <ArrowUp size={10} className="text-emerald-500" />
                                    <span className="font-black text-emerald-400">{calculateEnergy(nextLevel)}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-4 text-center italic">
                            {language === 'th'
                                ? `* การอัปเกรดจะเพิ่มพลังการขุดขึ้นอย่างถาวรตามสายการผลิต`
                                : `* Upgrading increases mining power permanently according to production line`}
                        </p>
                    </div>

                    {/* Cost Card */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                                {language === 'th' ? 'ต้นทุนการเลื่อนระดับ' : 'Upgrade Cost'}
                            </span>
                            <span className={`text-[10px] font-black ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                                {language === 'th' ? 'คุณมี:' : 'Owned:'} {userMaterials.toLocaleString()}
                            </span>
                        </div>
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${canAfford ? 'bg-stone-800/50 border-stone-700' : 'bg-red-900/10 border-red-900/20'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center border border-stone-700 shadow-inner">
                                    <MaterialIcon id={matTier} size="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white">{language === 'th' ? matName.th : matName.en}</span>
                                    <span className="text-[10px] font-bold text-stone-500 tracking-tighter">Material Tier {matTier}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black ${canAfford ? 'text-white' : 'text-red-400'} drop-shadow-sm`}>
                                    {upgradeCost.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Table Schedule Toggle */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className="flex items-center justify-between py-2 text-stone-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
                        >
                            <span>{language === 'th' ? 'ตารางรางวัลแต่ละระดับ' : 'Level Stats Schedule'}</span>
                            {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showTable && (
                            <div className="mt-2 bg-stone-950/80 rounded-xl border border-stone-800 overflow-hidden">
                                <div className="grid grid-cols-3 gap-2 p-3 bg-stone-900 text-[10px] font-black text-stone-500 uppercase tracking-tighter text-center">
                                    <span>LV.</span>
                                    <span className="flex items-center justify-center gap-1"><Zap size={12} className="text-orange-400" /> Max Energy</span>
                                    <span className="flex items-center justify-center gap-1"><Sparkles size={12} className="text-blue-400" /> Efficiency</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {levels.map(lvl => (
                                        <div key={lvl} className={`grid grid-cols-3 gap-2 p-3 border-t border-stone-800/30 text-[10px] text-center transition-colors ${lvl === currentLevel ? 'bg-blue-500/10 text-blue-400' : 'text-stone-400'}`}>
                                            <span className="font-bold text-xs">{lvl}</span>
                                            <span>{calculateEnergy(lvl)}</span>
                                            <span className="text-emerald-400">+{calculateEfficiency(lvl).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 shrink-0">
                    <button
                        disabled={!canAfford || loading || currentLevel >= MAX_RIG_LEVEL}
                        onClick={handleUpgrade}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg ${canAfford && !loading && currentLevel < MAX_RIG_LEVEL
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-[0.98]'
                            : 'bg-stone-800 text-stone-600 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {loading
                            ? (language === 'th' ? 'กำลังดำเนินการ...' : 'Processing...')
                            : currentLevel >= MAX_RIG_LEVEL
                                ? (language === 'th' ? 'ระดับสูงสุดแล้ว' : 'Max Level Reached')
                                : (language === 'th' ? 'อัปเกรดเครื่องขุด' : 'Upgrade Rig Now')}
                    </button>
                    {!canAfford && currentLevel < MAX_RIG_LEVEL && (
                        <p className="text-center text-red-500 text-[10px] font-bold uppercase tracking-wider mt-3 animate-pulse">
                            {language === 'th' ? `${matName.th} ไม่เพียงพอสำหรับการอัปเกรด` : `Insufficient ${matName.en} to upgrade`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
