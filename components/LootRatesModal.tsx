
import React from 'react';
import { X, PackageOpen } from 'lucide-react';
import { RARITY_SETTINGS, CURRENCY } from '../constants';
import { InfinityGlove } from './InfinityGlove';

interface LootRatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LootRatesModal: React.FC<LootRatesModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const rates = [
        { key: 'COMMON', chance: '80%', name: 'พนักงานทั่วไป (Staff)', ...RARITY_SETTINGS.COMMON },
        { key: 'RARE', chance: '11%', name: 'หัวหน้างาน (Supervisor)', ...RARITY_SETTINGS.RARE },
        { key: 'SUPER_RARE', chance: '5%', name: 'ผู้จัดการหอพัก (Manager)', ...RARITY_SETTINGS.SUPER_RARE },
        { key: 'EPIC', chance: '3%', name: 'ผู้บริหารอาคาร (Executive)', ...RARITY_SETTINGS.EPIC },
        { key: 'LEGENDARY', chance: '1%', name: 'หุ้นส่วนใหญ่ (Partner)', ...RARITY_SETTINGS.LEGENDARY },
    ];

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
                            <h2 className="text-xl font-display font-bold text-white">อัตราการจ้างผู้จัดการ</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">โอกาสได้รับผู้เชี่ยวชาญ</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-stone-400 text-sm mb-6 font-light">
                        การเปิดห้องพักใหม่ทุกครั้งจะมาพร้อมกับโอกาสจ้าง
                        <span className="text-yellow-500 font-bold"> ผู้จัดการส่วนตัว </span>
                        โดยจะช่วยเพิ่มรายได้รายวันให้กับห้องพักของคุณอย่างถาวร
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
                                        <p className="text-xs text-stone-500">ระดับ {tier.label}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-bold text-stone-300">{tier.chance}</div>
                                    <div className="text-xs font-mono text-green-400">+{tier.bonus} {CURRENCY}/วัน</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-900/50 border-t border-stone-800 text-center">
                    <button onClick={onClose} className="text-sm text-stone-500 hover:text-stone-300 uppercase tracking-widest font-bold">
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
};
