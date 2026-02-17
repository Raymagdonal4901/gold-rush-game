import React, { useState, useEffect } from 'react';
import {
    X, Hammer, Cpu, AlertTriangle, ArrowRight,
    Zap, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AccessoryIcon } from './AccessoryIcon';
import { MaterialIcon } from './MaterialIcon';
import {
    ENHANCE_RULES,
    EQUIPMENT_PRIMARY_MATERIALS,
    MATERIAL_CONFIG,
    RARITY_SETTINGS,
    SHOP_ITEMS
} from '../constants';
import { useTranslation } from '../contexts/LanguageContext';
import axios from 'axios';

interface EnhanceModalProps {
    item: any;
    materials: Record<string, number>;
    inventory: any[];
    language: string;
    onClose: () => void;
    onSuccess: (updatedItem: any) => void;
}

export const EnhanceModal: React.FC<EnhanceModalProps> = ({
    item, materials, inventory, language, onClose, onSuccess
}) => {
    const { t, getLocalized } = useTranslation();
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [animationStep, setAnimationStep] = useState<'IDLE' | 'PROCESS' | 'RESULT'>('IDLE');
    const [result, setResult] = useState<{ success: boolean; status: string; newLevel: number } | null>(null);

    const currentLevel = item.level || 0;
    const nextLevel = currentLevel + 1;
    const rules = ENHANCE_RULES[nextLevel];

    // Determine materials
    const genericType = Object.keys(EQUIPMENT_PRIMARY_MATERIALS).find(type => item.typeId.startsWith(type));
    const matTier = genericType ? EQUIPMENT_PRIMARY_MATERIALS[genericType] : 1;
    const matAmount = rules?.matAmount || 0;
    const chipAmount = rules?.chipAmount || 0;

    const userMatCount = materials[matTier.toString()] || 0;
    const userChipCount = inventory.filter(i => i.typeId === 'upgrade_chip').length;

    const hasMat = userMatCount >= matAmount;
    const hasChips = userChipCount >= chipAmount;
    const canEnhance = hasMat && hasChips && !isEnhancing && currentLevel < 5;

    const handleEnhance = async () => {
        if (!canEnhance) return;

        setIsEnhancing(true);
        setAnimationStep('PROCESS');

        // Play animation for 2 seconds
        setTimeout(async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/accessories/enhance`, {
                    itemId: item.id
                }, { withCredentials: true });

                const data = response.data;
                setResult({
                    success: data.success,
                    status: data.status,
                    newLevel: data.newLevel
                });
                setAnimationStep('RESULT');


                onSuccess(data.item);
            } catch (error: any) {


                setIsEnhancing(false);
                setAnimationStep('IDLE');
            }
        }, 2500);
    };

    const nextBonus = rules ? (item.baseBonus || item.dailyBonus) * (1 + rules.statBonus) : item.dailyBonus;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-stone-900/50 p-4 border-b border-stone-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-900/20 p-2 rounded text-purple-400">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                {language === 'th' ? 'ตีบวกอุปกรณ์' : 'Enhance Equipment'}
                            </h2>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest">Equipment Refining Station</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                    {/* Item Comparison */}
                    <div className="flex items-center justify-between bg-stone-900/30 p-4 rounded-xl border border-stone-800/50">
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-16 h-16 rounded-lg border-2 ${(RARITY_SETTINGS[item.rarity] || RARITY_SETTINGS.COMMON).border} bg-stone-900 flex items-center justify-center p-2 relative`}>
                                <AccessoryIcon item={item} size={40} />
                                <div className="absolute -top-2 -right-2 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 text-[10px] font-bold text-white">
                                    +{currentLevel}
                                </div>
                            </div>
                            <span className="text-[10px] text-stone-500 font-bold uppercase">{language === 'th' ? 'ปัจจุบัน' : 'Current'}</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <ArrowRight className="text-stone-700" size={24} />
                            <span className="text-[10px] text-stone-600 font-black mt-2">{(rules?.chance || 0) * 100}% {language === 'th' ? 'โอกาส' : 'CHANCE'}</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-16 h-16 rounded-lg border-2 ${(RARITY_SETTINGS[item.rarity] || RARITY_SETTINGS.COMMON).border} border-dashed opacity-50 bg-stone-950 flex items-center justify-center p-2 relative`}>
                                <AccessoryIcon item={item} size={40} />
                                <div className="absolute -top-2 -right-2 bg-purple-600 px-1.5 py-0.5 rounded border border-purple-400 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                                    +{nextLevel}
                                </div>
                            </div>
                            <span className="text-[10px] text-purple-400 font-bold uppercase">{language === 'th' ? 'ระดับถัดไป' : 'Next Level'}</span>
                        </div>
                    </div>

                    {/* Stats Diff */}
                    <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 space-y-3">
                        <h3 className="text-[10px] text-stone-500 font-black uppercase tracking-widest border-b border-stone-800 pb-2">
                            {language === 'th' ? 'ผลลัพธ์ที่จะได้รับ' : 'Expected Bonus'}
                        </h3>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-stone-400">{language === 'th' ? 'รายได้ต่อวัน (ฐาน)' : 'Base Daily Bonus'}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-stone-300">{item.dailyBonus.toFixed(2)}</span>
                                <ChevronRight size={12} className="text-stone-700" />
                                <span className="text-sm font-mono text-emerald-400 font-bold">
                                    {currentLevel < 5 ? nextBonus.toFixed(2) : item.dailyBonus.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-stone-500">{language === 'th' ? 'โบนัสรวม' : 'Total Bonus'}</span>
                            <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800/50">
                                +{((rules?.statBonus || 0) * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Materials */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] text-stone-500 font-black uppercase tracking-widest pl-1">
                            {language === 'th' ? 'ความต้องการสำรับการตีบวก' : 'Enhancement Requirements'}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-xl border transition-colors ${hasChips ? 'bg-stone-900/50 border-stone-800' : 'bg-red-900/10 border-red-900/30'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${hasChips ? 'bg-purple-900/30 text-purple-400' : 'bg-red-900/30 text-red-500'}`}>
                                        <Cpu size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-stone-500 uppercase font-bold">{language === 'th' ? 'ชิปอัปเกรด' : 'Upgrade Chip'}</p>
                                        <p className={`text-sm font-black ${hasChips ? 'text-white' : 'text-red-400'}`}>
                                            {userChipCount} / {chipAmount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl border transition-colors ${hasMat ? 'bg-stone-900/50 border-stone-800' : 'bg-red-900/10 border-red-900/30'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${hasMat ? 'bg-stone-800 text-stone-400' : 'bg-red-900/30 text-red-500'}`}>
                                        <MaterialIcon id={matTier} size="w-5 h-5" iconSize={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-stone-500 uppercase font-bold">{getLocalized(MATERIAL_CONFIG.NAMES[matTier])}</p>
                                        <p className={`text-sm font-black ${hasMat ? 'text-white' : 'text-red-400'}`}>
                                            {userMatCount.toLocaleString()} / {matAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success Rate Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] text-stone-500 font-bold uppercase">{language === 'th' ? 'โอกาสสำเร็จ' : 'Success Rate'}</span>
                            <span className={`text-sm font-black ${rules?.chance >= 0.8 ? 'text-emerald-400' : rules?.chance >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {(rules?.chance || 0) * 100}%
                            </span>
                        </div>
                        <div className="h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${rules?.chance >= 0.8 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                    rules?.chance >= 0.5 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                                        'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                    }`}
                                style={{ width: `${(rules?.chance || 0) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Risk Warning */}
                    {nextLevel >= 4 && (
                        <div className="bg-orange-950/20 border border-orange-900/50 p-3 rounded-xl flex gap-3 items-center">
                            <div className="text-orange-500 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-tighter">
                                    {language === 'th' ? 'คำเตือน: ความเสี่ยงสูง!' : 'Warning: High Risk!'}
                                </h4>
                                <p className="text-[10px] text-orange-200/60 leading-tight">
                                    {nextLevel === 4
                                        ? (language === 'th' ? 'หากล้มเหลว ระดับจะลดลง 1 ระดับ' : 'Failure will result in a 1-level downgrade.')
                                        : (language === 'th' ? 'มีโอกาสสูงที่จะล้มเหลว และจะรีเซ็ตเหลือ +0 ทันที!' : 'High failure rate! Failure resets level to +0.')
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Action */}
                <div className="p-6 bg-stone-900 border-t border-stone-800">
                    <button
                        onClick={handleEnhance}
                        disabled={!canEnhance || currentLevel >= 5}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed ${currentLevel >= 5
                            ? 'bg-stone-800 text-stone-500'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 active:scale-95'
                            }`}
                    >
                        {currentLevel >= 5 ? (
                            <>
                                <CheckCircle2 size={18} />
                                {language === 'th' ? 'ระดับสูงสุดแล้ว' : 'Max Level Reached'}
                            </>
                        ) : (
                            <>
                                <Hammer size={18} className="group-hover:animate-bounce" />
                                {language === 'th' ? 'เริ่มการตีบวก' : 'Begin Enhancement'}
                            </>
                        )}
                    </button>
                </div>

                {/* Animation Overlay */}
                {animationStep === 'PROCESS' && (
                    <div className="absolute inset-0 z-50 bg-stone-950/95 flex flex-col items-center justify-center gap-8 backdrop-blur-sm">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-[60px] animate-pulse"></div>
                            <div className="w-32 h-32 border-4 border-stone-800 rounded-2xl flex items-center justify-center relative bg-stone-900 shadow-inner overflow-hidden">
                                <AccessoryIcon item={item} size={64} className="relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                            </div>

                            {/* Anvil */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-stone-800 border-t-4 border-stone-700 rounded-t-lg"></div>

                            {/* Hammer Animation */}
                            <div className="absolute -top-16 -right-12 animate-[hammer-hit_0.5s_infinite]">
                                <Hammer size={48} className="text-stone-300" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] animate-pulse">
                                {language === 'th' ? 'กำลังตีบวก...' : 'REFINING...'}
                            </h3>
                            <div className="flex gap-1 justify-center">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>

                        <style jsx>{`
                            @keyframes hammer-hit {
                                0% { transform: rotate(45deg) translate(0, 0); }
                                50% { transform: rotate(-15deg) translate(-20px, 30px); }
                                100% { transform: rotate(45deg) translate(0, 0); }
                            }
                        `}</style>
                    </div>
                )}

                {/* Result Overlay */}
                {animationStep === 'RESULT' && result && (
                    <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                        {result.success ? (
                            <>
                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                    <Zap size={48} className="text-emerald-400 animate-pulse" />
                                </div>
                                <h3 className="text-3xl font-black text-emerald-400 uppercase tracking-widest mb-2">SUCCESS!</h3>
                                <p className="text-stone-400 mb-8 text-center">{language === 'th' ? 'ไอเทมของคุณได้รับการอัปเกรดแล้ว' : 'Your item has been successfully refined.'}</p>

                                <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl w-full flex items-center justify-center gap-8 mb-8">
                                    <div className="text-center">
                                        <p className="text-[10px] text-stone-500 font-bold uppercase mb-1">Old</p>
                                        <p className="text-2xl font-black text-stone-600">+{currentLevel}</p>
                                    </div>
                                    <ArrowRight className="text-stone-700" size={24} />
                                    <div className="text-center">
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">New</p>
                                        <p className="text-3xl font-black text-emerald-400">+{result.newLevel}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-red-500/20 rounded-full border-4 border-red-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                                    <AlertCircle size={48} className="text-red-400" />
                                </div>
                                <h3 className="text-3xl font-black text-red-400 uppercase tracking-widest mb-2">FAILED</h3>
                                <p className="text-stone-400 mb-8 text-center">
                                    {result.status === 'DOWNGRADE'
                                        ? (language === 'th' ? 'ระดับอุปกรณ์ลดลง 1 ระดับ' : 'Refinement failed and level decreased.')
                                        : result.status === 'RESET'
                                            ? (language === 'th' ? 'อุปกรณของคุณถูกรีเซ็ต เหลือ +0!' : 'Critical failure! Item reset to +0.')
                                            : (language === 'th' ? 'การตีบวกไม่สำเร็จ' : 'Refinement attempt failed.')
                                    }
                                </p>

                                <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl w-full flex items-center justify-center gap-8 mb-8">
                                    <div className="text-center">
                                        <p className="text-[10px] text-stone-500 font-bold uppercase mb-1">Before</p>
                                        <p className="text-2xl font-black text-stone-400">+{currentLevel}</p>
                                    </div>
                                    <ArrowRight className="text-stone-700" size={24} />
                                    <div className="text-center">
                                        <p className="text-[10px] text-red-500 font-bold uppercase mb-1">After</p>
                                        <p className="text-3xl font-black text-red-500">+{result.newLevel}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-xl"
                        >
                            {language === 'th' ? 'กลับไปยังคลัง' : 'Return to Inventory'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
