import React from 'react';
import { X, Hammer, Trash2, Sparkles, Package } from 'lucide-react';
import { MATERIAL_CONFIG, SHOP_ITEMS } from '../constants';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface SalvageResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        rewards: { tier: number; amount: number; name: string }[];
        items: { id: string; name: string }[];
        rigName: string;
    } | null;
}

export const SalvageResultModal: React.FC<SalvageResultModalProps> = ({ isOpen, onClose, data }) => {
    const { t, language } = useTranslation();

    if (!isOpen || !data) return null;

    const isThai = language === 'th';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content Card */}
            <div className="relative w-full max-w-sm bg-stone-950 border border-stone-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-stone-500 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center pt-10 pb-6 relative z-10">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                        <div className="relative w-20 h-20 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center rotate-3 shadow-2xl">
                            <Trash2 className="text-red-500" size={32} />

                            {/* Floating Sparkles */}
                            <div className="absolute -top-2 -right-2 animate-bounce">
                                <Sparkles className="text-yellow-400" size={20} />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight text-center px-4 leading-none mb-2">
                        {isThai ? 'หลอมเครื่องจักรสำเร็จ!' : 'Salvage Complete!'}
                    </h3>
                    <p className="text-stone-500 font-bold text-xs uppercase tracking-widest">
                        {data.rigName}
                    </p>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8 space-y-4 relative z-10">

                    {/* Materials Section */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.2em] px-1">
                            {isThai ? 'ทรัพยากรที่ได้รับ' : 'Recovered Materials'}
                        </p>

                        <div className="grid grid-cols-1 gap-2">
                            {data.rewards.map((reward, idx) => {
                                const matColor = MATERIAL_CONFIG.COLORS[reward.tier as keyof typeof MATERIAL_CONFIG.COLORS] || 'text-white';
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-900/50 border border-stone-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center">
                                                <MaterialIcon id={reward.tier} size="w-8 h-8" iconSize={16} />
                                            </div>
                                            <span className={`font-bold text-sm ${matColor}`}>
                                                {reward.name}
                                            </span>
                                        </div>
                                        <span className="text-lg font-black text-white px-2">
                                            +{reward.amount}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Items Section (Only if items exist) */}
                    {data.items.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.2em] px-1">
                                {isThai ? 'ไอเทมโบนัส' : 'Bonus Items'}
                            </p>

                            <div className="grid grid-cols-1 gap-2">
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-stone-950 border border-red-500/20 flex items-center justify-center">
                                                <Package className="text-red-400" size={16} />
                                            </div>
                                            <span className="font-bold text-sm text-red-100 italic">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-xs font-black text-red-400 bg-red-400/10 px-3 py-1 rounded-full uppercase">
                                            Found!
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State Fallback (Shouldn't happen with current logic) */}
                    {data.rewards.length === 0 && data.items.length === 0 && (
                        <div className="py-8 text-center bg-stone-900/30 rounded-3xl border border-dashed border-stone-800">
                            <p className="text-stone-600 text-xs italic">
                                {isThai ? 'ไม่พบวัสดุที่ยังใช้งานได้' : 'No usable parts recovered'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="p-8 pt-0 relative z-10">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-white text-stone-950 font-black uppercase tracking-widest text-xs shadow-xl hover:bg-stone-200 transition-all active:scale-95"
                    >
                        {isThai ? 'ตกลง' : 'CONTINUE'}
                    </button>

                    <p className="text-center mt-4 text-[10px] text-stone-700 font-medium">
                        {isThai ? '* ไอเทมถูกจัดส่งเข้าโกดังแล้ว' : '* Items have been sent to warehouse'}
                    </p>
                </div>

            </div>
        </div>
    );
};
