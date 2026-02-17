import React, { useState, useEffect } from 'react';
import { Zap, Clock, PlusCircle, AlertCircle } from 'lucide-react';
import { ENERGY_CONFIG } from '../constants';

interface OverclockCardProps {
    user: any;
    language: 'th' | 'en';
    onActivate: () => void;
    formatCountdown: (ms: number | null) => string;
    formatCurrency: (amount: number, options?: any) => string;
}

export const OverclockCard: React.FC<OverclockCardProps> = ({ user, language, onActivate, formatCountdown, formatCurrency }) => {
    const [remainingMs, setRemainingMs] = useState<number | null>(null);

    useEffect(() => {
        const calculateRemaining = () => {
            if (!user?.overclockExpiresAt) return null;
            const expiry = new Date(user.overclockExpiresAt).getTime();
            const now = Date.now();
            return Math.max(0, expiry - now);
        };

        setRemainingMs(calculateRemaining());

        const interval = setInterval(() => {
            const rem = calculateRemaining();
            setRemainingMs(rem);
        }, 1000);

        return () => clearInterval(interval);
    }, [user?.overclockExpiresAt]);

    const isActive = remainingMs !== null && remainingMs > 0;
    const progress = isActive ? (remainingMs / (ENERGY_CONFIG.OVERCLOCK_DURATION_HOURS * 3600000)) * 100 : 0;

    return (
        <div
            onClick={onActivate}
            className={`col-span-1 lg:col-span-1 rounded-2xl p-3 lg:p-5 relative cursor-pointer overflow-hidden border-2 transition-all duration-500 min-h-[180px] lg:min-h-[220px] flex flex-col ${isActive
                ? 'lightning-bolt-card shadow-[0_0_30px_rgba(34,211,238,0.4)] border-cyan-400/50'
                : 'bg-stone-900 border-stone-800 shadow-lg shadow-black/40 hover:border-stone-700'
                }`}
        >
            {/* Background Visual Effects */}
            {isActive && (
                <>
                    <div className="lightning-flash-overlay"></div>
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                        <div className="electric-spark" style={{ top: '15%', left: '25%', animationDelay: '0.1s' }}></div>
                        <div className="electric-spark" style={{ top: '45%', left: '75%', animationDelay: '0.5s' }}></div>
                        <div className="electric-spark" style={{ top: '75%', left: '35%', animationDelay: '0.3s' }}></div>
                        <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-cyan-400/20 blur-[1px] animate-[pulse_0.1s_infinite]"></div>
                    </div>
                </>
            )}

            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-white text-[10px] lg:text-xs font-black uppercase tracking-widest">
                            {language === 'th' ? 'ระบบเร่งขุด (Overclock)' : 'Overclock System'}
                        </span>
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black mt-1 inline-block ${isActive ? 'bg-cyan-500 text-stone-900 animate-pulse' : 'bg-stone-800 text-stone-500'}`}>
                            {isActive ? (language === 'th' ? 'กำลังเร่งขุด 1.5x' : 'BOLT ACTIVE 1.5x') : (language === 'th' ? 'หยุดทำงาน (STBY)' : 'STANDBY')}
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-110'
                        : 'bg-stone-800 border-stone-700 text-stone-500'
                        }`}>
                        <Zap size={22} strokeWidth={isActive ? 3 : 2} className={isActive ? 'animate-pulse' : ''} />
                    </div>
                </div>

                <div className="mt-auto">
                    {isActive ? (
                        <div className="space-y-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <Clock size={14} />
                                    <span className="text-sm lg:text-lg font-mono font-bold tracking-tighter">
                                        {formatCountdown(remainingMs)}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden border border-cyan-900/30">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (remainingMs / (24 * 3600000)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-500/60 uppercase italic">
                                <AlertCircle size={10} />
                                {language === 'th' ? 'รายได้ 1.5x | พลังงานลดเร็ว x1.5' : '1.5x Yield | 1.5x Durability Loss'}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 text-stone-500 text-[10px] lg:text-xs font-bold leading-tight">
                            {language === 'th'
                                ? 'เร่งประสิทธิภาพการขุดขั้นสุดยอด เพิ่มรายได้ทันทีเป็นเวลา 24 ชั่วโมง'
                                : 'Extreme mining optimization! Boost yield for 24 hours.'}
                        </div>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onActivate();
                        }}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${isActive
                            ? 'bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 shadow-cyan-950/20'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/20'
                            }`}
                    >
                        {isActive ? (
                            <>
                                <PlusCircle size={14} />
                                {language === 'th' ? 'ต่อเวลา (+24 ชม.)' : 'EXTEND (+24h)'}
                            </>
                        ) : (
                            <>
                                {language === 'th' ? `เปิด Overclock (${formatCurrency(50)})` : `ACTIVATE (${formatCurrency(50)})`}
                            </>
                        )}
                    </button>
                    {!isActive && (
                        <div className="mt-2 text-[8px] text-center font-bold text-stone-600 uppercase tracking-tighter">
                            {language === 'th' ? `ราคา ${formatCurrency(50)} ต่อ 24 ชั่วโมง` : `Cost ${formatCurrency(50)} per 24 Hours`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
