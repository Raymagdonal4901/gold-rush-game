

import React, { useState, useEffect } from 'react';
import { X, Skull, Flame, Rocket, Clock, Coins, Key, ArrowRight, Timer, CheckCircle2, AlertCircle, Sparkles, Pickaxe, Hammer, Info, Hourglass } from 'lucide-react';
import { DUNGEON_CONFIG, CURRENCY, MATERIAL_CONFIG, SHOP_ITEMS } from '../constants';
import { MockDB } from '../services/db';
import { User, Expedition, OilRig, AccessoryItem } from '../services/types';
import { api } from '../services/api';

interface DungeonModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onRefresh: () => void;
    addNotification?: (n: any) => void;
}

export const DungeonModal: React.FC<DungeonModalProps> = ({ isOpen, onClose, user, onRefresh, addNotification }) => {
    const [activeExpedition, setActiveExpedition] = useState<Expedition | null>(null);
    const [selectedDungeonId, setSelectedDungeonId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [claimResult, setClaimResult] = useState<{ success: boolean, reward: string, type: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Selection State
    const [userRigs, setUserRigs] = useState<OilRig[]>([]);
    const [selectedRigId, setSelectedRigId] = useState<string | null>(null);

    // Time Skip State
    const [hourglasses, setHourglasses] = useState<{ small: number, medium: number, large: number }>({ small: 0, medium: 0, large: 0 });

    // Init Logic
    useEffect(() => {
        if (isOpen) {
            // Only sync active expedition if we aren't currently showing a result
            if (!claimResult) {
                setActiveExpedition(user.activeExpedition || null);
            }

            const rigs = MockDB.getMyRigs(user.id).filter(r => {
                const baseDurationMs = r.durationMonths * 30 * 24 * 60 * 60 * 1000;
                const expiryTime = r.purchasedAt + baseDurationMs;
                return Date.now() < expiryTime;
            });
            setUserRigs(rigs);

            const inv = user.inventory || [];
            setHourglasses({
                small: inv.filter(i => i.typeId === 'hourglass_small').length,
                medium: inv.filter(i => i.typeId === 'hourglass_medium').length,
                large: inv.filter(i => i.typeId === 'hourglass_large').length,
            });
        }
    }, [isOpen, user, claimResult]);

    // Reset claim result when modal is opened (not on every user update)
    useEffect(() => {
        if (isOpen) {
            setClaimResult(null);
        }
    }, [isOpen]);

    // Timer Effect
    useEffect(() => {
        if (!activeExpedition) return;

        const updateTimer = () => {
            const now = Date.now();
            const endTime = new Date(activeExpedition.endTime).getTime(); // Handle potential string from backend
            const ms = endTime - now;

            if (ms <= 0) {
                setTimeLeft('พร้อมรับรางวัล');
            } else {
                const h = Math.floor(ms / (1000 * 60 * 60));
                const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((ms % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        };

        // Call immediately to avoid 1s initial empty state
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [activeExpedition]);

    if (!isOpen) return null;

    const handleStart = async (dungeonId: number, useKey: boolean = false) => {
        if (!selectedRigId) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: "กรุณาเลือกเครื่องขุดที่จะส่งไปสำรวจ",
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
            return;
        }
        setIsProcessing(true);
        try {
            if (user.isDemo) {
                MockDB.startExpedition(user.id, dungeonId, useKey, selectedRigId);
                // Sync stats to Backend (Mock)
                api.user.incrementStats({ weeklyStats: { dungeonsEntered: 1 } }).catch(console.error);
            } else {
                await api.dungeon.start(dungeonId, selectedRigId, useKey);
            }

            onRefresh();
            setActiveExpedition(user.activeExpedition || null);
            setSelectedDungeonId(null);
            setSelectedRigId(null);
        } catch (e: any) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClaim = async () => {
        setIsProcessing(true);
        try {
            let res;
            if (user.isDemo) {
                res = MockDB.claimExpedition(user.id);
            } else {
                res = await api.dungeon.claim();
            }
            // IMPORTANT: Update local state BEFORE triggering refresh
            setActiveExpedition(null);
            setClaimResult(res);
            // Now refresh parent data
            onRefresh();
        } catch (e: any) {
            console.error("Claim Expedition Error:", e);
            // Clear stale state if backend says no expedition exists
            const errorMsg = e.response?.data?.message || e.message || "";
            if (errorMsg.includes('ไม่มีการสำรวจ') || errorMsg.includes('No active expedition')) {
                setActiveExpedition(null);
                onRefresh(); // Sync with backend
            }
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: errorMsg || "Failed to claim reward",
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUseTimeSkip = async (itemId: string) => {
        try {
            if (user.isDemo) {
                MockDB.skipExpeditionTime(user.id, itemId);
            } else {
                await api.dungeon.skip(itemId);
            }
            onRefresh(); // Refresh user data to update inventory and expedition time

            // Re-fetch local state for animation smoothness
            // For real users, onRefresh() updates the 'user' prop after a bit, 
            // but we can optimistically set it or wait for next render.
            // For now, let's just let onRefresh do its job.
            if (user.isDemo) {
                const updatedUser = MockDB.getAllUsers().find(u => u.id === user.id);
                if (updatedUser) {
                    setActiveExpedition(updatedUser.activeExpedition || null);
                    const inv = updatedUser.inventory || [];
                    setHourglasses({
                        small: inv.filter(i => i.typeId === 'hourglass_small').length,
                        medium: inv.filter(i => i.typeId === 'hourglass_medium').length,
                        large: inv.filter(i => i.typeId === 'hourglass_large').length,
                    });
                }
            }
        } catch (e: any) {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: e.response?.data?.message || e.message,
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }
    };

    const getDungeonIcon = (id: number) => {
        switch (id) {
            case 1: return <Skull className="text-stone-400" size={32} />;
            case 2: return <Flame className="text-orange-500" size={32} />;
            case 3: return <Rocket className="text-purple-500" size={32} />;
            default: return <Skull size={32} />;
        }
    };

    const getRigLuckBonus = (rig: OilRig) => {
        const tier = rig.investment >= 3000 ? 5 : rig.investment >= 2500 ? 4 : rig.investment >= 2000 ? 3 : rig.investment >= 1500 ? 2 : 1;
        return (tier * 5); // 5% per tier
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-900/20 p-2 rounded text-purple-500">
                            <Skull size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">
                                {activeExpedition
                                    ? DUNGEON_CONFIG.find(d => d.id === activeExpedition.dungeonId)?.name
                                    : selectedDungeonId
                                        ? DUNGEON_CONFIG.find(d => d.id === selectedDungeonId)?.name
                                        : 'เลือกแหล่งสำรวจ (Select Exploration Site)'}
                            </h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">ส่งเครื่องขุดไปสำรวจเพื่อรับรางวัล</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                    {/* Active Expedition View */}
                    {activeExpedition ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                                {getDungeonIcon(activeExpedition.dungeonId)}
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">กำลังสำรวจแหล่งแร่...</h3>
                                <div className="text-4xl font-mono font-bold text-purple-400 mb-4">{timeLeft}</div>
                                <p className="text-stone-500 text-sm bg-stone-900/50 px-4 py-2 rounded-full border border-stone-800 inline-block">
                                    {DUNGEON_CONFIG.find(d => d.id === activeExpedition.dungeonId)?.name}
                                </p>
                                <div className="mt-2 text-xs text-stone-500">
                                    เครื่องขุดที่ส่งไปจะงดจ่ายรายได้ในช่วงเวลานี้
                                </div>
                            </div>

                            {Date.now() >= activeExpedition.endTime ? (
                                <button
                                    onClick={handleClaim}
                                    disabled={isProcessing}
                                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-[0_0_20px_purple] animate-bounce flex items-center gap-2"
                                >
                                    <Sparkles /> รับรางวัล <Sparkles />
                                </button>
                            ) : (
                                // Time Skip Options
                                <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-xl w-full max-w-lg">
                                    <div className="text-xs text-stone-400 uppercase font-bold mb-3 flex items-center gap-2">
                                        <Hourglass size={12} className="text-yellow-500" /> เร่งเวลา (Time Skip)
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleUseTimeSkip('hourglass_small')}
                                            disabled={hourglasses.small === 0}
                                            className={`flex flex-col items-center p-3 rounded border transition-all ${hourglasses.small > 0 ? 'bg-stone-800 border-stone-600 hover:bg-stone-700 hover:border-yellow-500' : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                                        >
                                            <span className="text-xs font-bold text-white">-30 นาที</span>
                                            <span className="text-[10px] text-stone-500 mt-1">มี: {hourglasses.small}</span>
                                        </button>
                                        <button
                                            onClick={() => handleUseTimeSkip('hourglass_medium')}
                                            disabled={hourglasses.medium === 0}
                                            className={`flex flex-col items-center p-3 rounded border transition-all ${hourglasses.medium > 0 ? 'bg-stone-800 border-stone-600 hover:bg-stone-700 hover:border-yellow-500' : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                                        >
                                            <span className="text-xs font-bold text-white">-2 ชม.</span>
                                            <span className="text-[10px] text-stone-500 mt-1">มี: {hourglasses.medium}</span>
                                        </button>
                                        <button
                                            onClick={() => handleUseTimeSkip('hourglass_large')}
                                            disabled={hourglasses.large === 0}
                                            className={`flex flex-col items-center p-3 rounded border transition-all ${hourglasses.large > 0 ? 'bg-stone-800 border-stone-600 hover:bg-stone-700 hover:border-yellow-500' : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                                        >
                                            <span className="text-xs font-bold text-white">-6 ชม.</span>
                                            <span className="text-[10px] text-stone-500 mt-1">มี: {hourglasses.large}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : claimResult ? (
                        // Claim Result View
                        // Claim Result View (Compact Edition)
                        <div className="flex flex-col items-center justify-center h-full relative overflow-hidden animate-in zoom-in duration-300 p-4">
                            {/* Ambient Background Effects */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>

                            {/* Main Icon with Glow - Reduced Size */}
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-40 animate-pulse rounded-full"></div>
                                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-[0_0_20px_rgba(234,179,8,0.3)] z-10 bg-stone-900 ${claimResult.type === 'rare' ? 'border-yellow-400' : 'border-stone-500'}`}>
                                    {claimResult.type === 'rare' ? (
                                        <Sparkles size={40} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-[spin_4s_linear_infinite]" />
                                    ) : claimResult.type === 'salt' ? (
                                        <AlertCircle size={40} className="text-stone-500" />
                                    ) : (
                                        <CheckCircle2 size={40} className="text-emerald-500" />
                                    )}
                                </div>
                            </div>

                            {/* Text Content - Compact */}
                            <div className="z-10 text-center space-y-3 px-4 w-full max-w-lg">
                                <h3 className="text-xl md:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 animate-pulse tracking-wider shadow-sm">
                                    CONGRATULATIONS!
                                </h3>

                                <div className="bg-stone-900/80 backdrop-blur-sm border border-yellow-500/30 p-4 rounded-xl shadow-lg transform transition-all duration-300">
                                    <div className="text-xs text-yellow-500/80 uppercase font-bold tracking-widest mb-1">Rewards Obtained</div>
                                    <div className="font-bold text-white leading-relaxed drop-shadow-md whitespace-pre-line">
                                        {(claimResult.reward || 'Unknown Reward').split('+').map((part, idx) => (
                                            <div key={idx} className={(part || '').includes('JACKPOT') ? 'text-yellow-400 font-extrabold text-lg md:text-xl mt-1 animate-pulse' : 'text-base md:text-lg text-white'}>
                                                {(part || '').trim() || 'N/A'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setClaimResult(null)}
                                className="mt-6 px-8 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-full font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105 z-20 flex items-center gap-2 text-sm"
                            >
                                <ArrowRight size={16} /> ไปต่อ (Continue)
                            </button>
                        </div>
                    ) : selectedDungeonId ? (
                        // Step 2: Select Rig View
                        <div className="flex flex-col h-full animate-in slide-in-from-right">
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setSelectedDungeonId(null)} className="text-stone-500 hover:text-white"><ArrowRight className="rotate-180" /></button>
                                <h3 className="text-lg font-bold text-white">เลือกเครื่องขุดเพื่อส่งไปพื้นที่สำรวจ</h3>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg mb-4 text-xs text-blue-300 flex items-start gap-2">
                                <Info className="shrink-0 mt-0.5" size={14} />
                                <div>
                                    <strong>คำเตือน:</strong> เครื่องขุดที่ถูกส่งไปสำรวจจะ <u>หยุดผลิตเงินรายวัน</u> ชั่วคราว <br />
                                    ยิ่งเครื่องขุดระดับสูง ยิ่งมีโอกาสพบไอเทมหายากมากขึ้น
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pb-20">
                                {userRigs.length === 0 && <div className="col-span-full text-center text-stone-500 py-10">คุณไม่มีเครื่องขุดที่พร้อมใช้งาน</div>}
                                {userRigs.map(rig => {
                                    const luckBonus = getRigLuckBonus(rig);
                                    return (
                                        <div
                                            key={rig.id}
                                            onClick={() => setSelectedRigId(rig.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative
                                        ${selectedRigId === rig.id ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_purple]' : 'bg-stone-900 border-stone-800 hover:bg-stone-800'}
                                    `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-white text-sm">{rig.name}</div>
                                                {selectedRigId === rig.id && <CheckCircle2 className="text-purple-500" size={18} />}
                                            </div>
                                            {/* Removed Income Text as requested */}
                                            <div className="mt-2 text-xs font-bold text-yellow-500 flex items-center gap-1 bg-yellow-900/20 px-2 py-1 rounded w-fit">
                                                <Sparkles size={12} /> Luck +{luckBonus}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-auto pt-4 border-t border-stone-800">
                                {(() => {
                                    const dungeon = DUNGEON_CONFIG.find(d => d.id === selectedDungeonId);
                                    if (!dungeon) return null;

                                    const hasKeyCost = (dungeon.keyCost || 0) > 0;

                                    if (hasKeyCost) {
                                        return (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleStart(dungeon.id, false)}
                                                    disabled={!selectedRigId}
                                                    className="py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold border border-stone-600 text-[10px] md:text-sm"
                                                >
                                                    จ่าย {dungeon.cost.toLocaleString()} {CURRENCY}
                                                </button>
                                                <button
                                                    onClick={() => handleStart(dungeon.id, true)}
                                                    disabled={!selectedRigId}
                                                    className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg text-[10px] md:text-sm"
                                                >
                                                    <Key size={14} /> ใช้กุญแจเข้าเหมือง {dungeon.keyCost} ดอก
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <button
                                                onClick={() => handleStart(dungeon.id, false)}
                                                disabled={!selectedRigId || user.balance < dungeon.cost}
                                                className="w-full py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold border border-stone-600"
                                            >
                                                {!selectedRigId ? 'กรุณาเลือกเครื่องขุด' :
                                                    user.balance < dungeon.cost ? 'ยอดเงินไม่เพียงพอ' :
                                                        `เริ่มสำรวจ (จ่าย ${dungeon.cost.toLocaleString()} ${CURRENCY})`}
                                            </button>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    ) : (
                        // Step 1: Dungeon Selection View
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {DUNGEON_CONFIG.map(dungeon => (
                                <div key={dungeon.id} className="relative bg-stone-900 border border-stone-800 rounded-xl hover:border-purple-500/50 transition-all group flex flex-col">

                                    {/* HOVER TOOLTIP OVERLAY */}
                                    <div className="absolute inset-x-0 top-0 bottom-[50px] bg-stone-950/95 backdrop-blur-sm z-20 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-xl overflow-hidden p-4">
                                        <div className="text-center font-bold text-white mb-2 border-b border-stone-800 pb-2 text-sm shrink-0">
                                            {dungeon.id === 1 ? 'รางวัล (สุ่มได้รับ)' : 'รางวัล (ทั่วไป + Jackpot)'}
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                            {/* Jackpot */}
                                            {dungeon.id !== 1 && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Sparkles size={10} /> Jackpot (100%)</div>
                                                    <ul className="text-[10px] text-yellow-100 space-y-1">
                                                        {dungeon.rewards.rare.map((r, i) => {
                                                            if (r.tier !== undefined) {
                                                                const name = MATERIAL_CONFIG.NAMES[r.tier as keyof typeof MATERIAL_CONFIG.NAMES];
                                                                return <li key={i} className="flex justify-between"><span>• {name}</span> <span>x{r.amount}</span></li>
                                                            } else {
                                                                const item = SHOP_ITEMS.find(s => s.id === r.itemId);
                                                                return <li key={i} className="flex justify-between"><span>• {item?.name || r.itemId}</span> <span>x{r.amount}</span></li>
                                                            }
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                            {/* Common */}
                                            <div>
                                                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">ทั่วไป (80%)</div>
                                                <ul className="text-[10px] text-stone-300 space-y-1">
                                                    {dungeon.rewards.common.map((r, i) => (
                                                        <li key={i} className="flex justify-between"><span>• {MATERIAL_CONFIG.NAMES[r.tier as keyof typeof MATERIAL_CONFIG.NAMES]}</span> <span>x{r.amount}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {/* Salt */}
                                            <div>
                                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">เกลือ (20%)</div>
                                                <ul className="text-[10px] text-stone-500 space-y-1">
                                                    {dungeon.rewards.salt.map((r, i) => (
                                                        <li key={i} className="flex justify-between"><span>• {MATERIAL_CONFIG.NAMES[r.tier as keyof typeof MATERIAL_CONFIG.NAMES]}</span> <span>x{r.amount}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`h-24 flex items-center justify-center rounded-t-xl bg-gradient-to-b ${dungeon.id === 1 ? 'from-stone-800 to-stone-900' : dungeon.id === 2 ? 'from-orange-900/50 to-stone-900' : 'from-purple-900/50 to-stone-900'}`}>
                                        {getDungeonIcon(dungeon.id)}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-white text-lg mb-1">{dungeon.name}</h3>
                                        <p className="text-xs text-stone-500 mb-4">{dungeon.description}</p>

                                        <div className="space-y-2 mb-4 text-xs text-stone-300 flex-1">
                                            <div className="flex justify-between border-b border-stone-800 pb-1">
                                                <span>เวลา</span>
                                                <span className="font-mono text-white">{dungeon.durationHours} ชม.</span>
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                <div className="text-[10px] text-stone-500 uppercase font-bold">โอกาสได้รับ</div>
                                                <div className="flex justify-between"><span>ทั่วไป</span><span className="text-emerald-400">80%</span></div>
                                                <div className="flex justify-between"><span>เกลือ</span><span className="text-stone-500">20%</span></div>
                                                {dungeon.id !== 1 && (
                                                    <div className="flex justify-between"><span>Jackpot</span><span className="text-yellow-500">100%</span></div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedDungeonId(dungeon.id)}
                                            className="w-full bg-stone-800 hover:bg-stone-700 text-white py-2 rounded text-xs font-bold border border-stone-600 mt-auto flex items-center justify-center gap-2 group-hover:bg-purple-900/20 group-hover:text-purple-300 group-hover:border-purple-500/50 transition-all z-30 relative"
                                        >
                                            เลือกด่านนี้ <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const InfoIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
);