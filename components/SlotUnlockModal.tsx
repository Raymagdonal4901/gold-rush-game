
import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertTriangle, Coins, Key, Cpu } from 'lucide-react';
import { MATERIAL_CONFIG, SLOT_EXPANSION_CONFIG, CURRENCY } from '../constants';
import { User } from '../services/types';
import { MaterialIcon } from './MaterialIcon';
import { api } from '../services/api';

interface SlotUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetSlot: number;
    user: User;
    onSuccess: () => void;
}

export const SlotUnlockModal: React.FC<SlotUnlockModalProps> = ({ isOpen, onClose, targetSlot, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const config = SLOT_EXPANSION_CONFIG[targetSlot as keyof typeof SLOT_EXPANSION_CONFIG];
    if (!config) return null;

    const userMats = user.materials || {};
    const userInv = user.inventory || [];

    // Check Requirements
    let canUnlock = true;
    if (user.balance < config.cost) canUnlock = false;

    const matReqs = Object.entries(config.mats).map(([tierStr, amt]) => {
        const tier = Number(tierStr);
        const owned = userMats[tier] || 0;
        if (owned < amt) canUnlock = false;
        return { tier, amt, owned };
    });

    let itemReq = null;
    if (config.item) {
        const needed = config.itemCount || 1;
        const owned = userInv.filter(i => i.typeId === config.item).length;
        if (owned < needed) canUnlock = false;
        itemReq = { id: config.item, needed, owned };
    }

    const handleUnlock = async () => {
        setLoading(true);
        setError('');
        try {
            await api.user.unlockSlot(targetSlot);
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || 'Failed to unlock slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-stone-800 p-2 rounded text-stone-400">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">ปลดล็อกพื้นที่เพิ่ม</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">SLOT #{targetSlot}: {config.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    <div className="space-y-3">
                        <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">เงื่อนไขการปลดล็อก</div>

                        {/* Money */}
                        <div className="flex justify-between items-center bg-stone-900 p-3 rounded-lg border border-stone-800">
                            <div className="flex items-center gap-2">
                                <div className="bg-yellow-900/20 p-1.5 rounded"><Coins size={16} className="text-yellow-500" /></div>
                                <span className="text-sm font-bold text-stone-300">ค่าก่อสร้าง</span>
                            </div>
                            <div className={user.balance >= config.cost ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                {config.cost.toLocaleString()} {CURRENCY}
                            </div>
                        </div>

                        {/* Materials */}
                        {matReqs.map((req, i) => (
                            <div key={i} className="flex justify-between items-center bg-stone-900 p-3 rounded-lg border border-stone-800">
                                <div className="flex items-center gap-2">
                                    <MaterialIcon id={req.tier} size="w-8 h-8" iconSize={16} />
                                    <span className="text-sm font-bold text-stone-300">{MATERIAL_CONFIG.NAMES[req.tier as keyof typeof MATERIAL_CONFIG.NAMES]}</span>
                                </div>
                                <div className={req.owned >= req.amt ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                    {req.owned}/{req.amt}
                                </div>
                            </div>
                        ))}

                        {/* Items */}
                        {itemReq && (
                            <div className="flex justify-between items-center bg-stone-900 p-3 rounded-lg border border-stone-800">
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-900/20 p-1.5 rounded">
                                        {itemReq.id === 'chest_key' ? <Key size={16} className="text-purple-400" /> : <Cpu size={16} className="text-purple-400" />}
                                    </div>
                                    <span className="text-sm font-bold text-stone-300">
                                        {itemReq.id === 'chest_key' ? 'กุญแจเข้าเหมือง' : 'ชิปอัปเกรด'}
                                    </span>
                                </div>
                                <div className={itemReq.owned >= itemReq.needed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                    {itemReq.owned}/{itemReq.needed}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-900/20 p-3 rounded text-red-400 text-xs text-center flex items-center justify-center gap-2">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleUnlock}
                        disabled={!canUnlock || loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                    ${canUnlock ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-stone-900' : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'}
                `}
                    >
                        {loading ? 'กำลังก่อสร้าง...' : canUnlock ? 'ยืนยันการปลดล็อก' : 'ทรัพยากรไม่เพียงพอ'}
                    </button>

                </div>
            </div>
        </div>
    );
};
