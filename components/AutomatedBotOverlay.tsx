import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Pause, Play } from 'lucide-react';

interface AutomatedBotOverlayProps {
    status: 'WORKING' | 'COOLDOWN' | 'PAUSED';
    cooldown: number;
    workTimeLeft?: number;
    onTogglePause: () => void;
    isFixed?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const AutomatedBotOverlay: React.FC<AutomatedBotOverlayProps> = ({ status, cooldown, workTimeLeft, onTogglePause, isFixed = true, className = '', style = {} }) => {
    const { t, language } = useTranslation();

    const formatTime = (ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const positionClass = isFixed ? 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]' : 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[70%] z-[50]';

    return (
        <div className={`${positionClass} pointer-events-none select-none flex flex-col items-center gap-2 ai-robot-container ${className}`} style={style}>
            {/* Robot Body - Clickable */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onTogglePause();
                }}
                className={`relative w-16 h-12 lg:w-20 lg:h-16 bg-stone-900 border-2 ${status === 'PAUSED' ? 'border-stone-600 grayscale' : 'border-blue-500'} rounded-2xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] ai-robot-body backdrop-blur-md transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-110 active:scale-95`}
            >

                {/* Antenna */}
                <div className="absolute -top-3 w-1 h-3 bg-stone-700"></div>
                <div className={`absolute -top-4 w-2.5 h-2.5 ${status === 'PAUSED' ? 'bg-stone-500' : 'bg-blue-500'} rounded-full ai-robot-antenna-tip shadow-[0_0_8px_#3b82f6]`}></div>

                {/* Ears */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-stone-800 rounded-l-md border-y border-l border-blue-500/30"></div>
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-stone-800 rounded-r-md border-y border-r border-blue-500/30"></div>

                {/* Face/Screen */}
                <div className="w-11 h-7 lg:w-14 lg:h-9 bg-black/80 rounded-lg border border-blue-500/30 relative overflow-hidden flex items-center justify-center gap-1.5 lg:gap-2">
                    {/* Eyes */}
                    <div className={`w-2.5 h-2.5 lg:w-3 h-3 ${status === 'PAUSED' ? 'bg-stone-600' : 'bg-blue-400'} rounded-full ai-robot-eye ai-robot-pupil shadow-[0_0_5px_#60a5fa]`}></div>
                    <div className={`w-2.5 h-2.5 lg:w-3 h-3 ${status === 'PAUSED' ? 'bg-stone-600' : 'bg-blue-400'} rounded-full ai-robot-eye-left ai-robot-pupil shadow-[0_0_5px_#60a5fa]`}></div>

                    {/* Scan line effect */}
                    {status !== 'PAUSED' && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-[scan_2s_linear_infinite]"></div>
                    )}
                </div>

                {/* Mouth/Grill */}
                <div className="mt-1 flex gap-0.5 lg:gap-1">
                    <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                    <div className={`w-1 h-1 ${status === 'WORKING' ? 'bg-green-500 animate-pulse' : 'bg-stone-700'} rounded-full`}></div>
                    <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                </div>

                {/* Play/Pause Status Small Indicator */}
                <div className={`absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-5 h-5 lg:w-6 lg:h-6 ${status === 'PAUSED' ? 'bg-yellow-500 text-black' : 'bg-stone-800 text-white border border-stone-600'} rounded-full flex items-center justify-center shadow-lg z-20`}>
                    {status === 'PAUSED' ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />}
                </div>
            </div>

            {/* Status & Countdown (Below Robot) */}
            <div className="flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-sm">
                    <div className={`w-2 h-2 rounded-full ${status === 'WORKING' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : (status === 'PAUSED' ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 'bg-yellow-500 shadow-[0_0_5px_#eab308]')}`}></div>
                    <span className={`text-[10px] lg:text-xs font-black tracking-wider uppercase ${status === 'WORKING' ? 'text-green-400' : (status === 'PAUSED' ? 'text-red-400' : 'text-yellow-400')}`}>
                        {status === 'WORKING' && (language === 'th' ? 'หุ่นยนต์ AI ทำงานอยู่' : 'AI Bot Active')}
                        {status === 'PAUSED' && (language === 'th' ? 'หยุดทำงาน' : 'Paused')}
                        {status === 'COOLDOWN' && (language === 'th' ? 'พักเครื่อง' : 'Cooldown')}
                    </span>
                    {(status === 'WORKING' && workTimeLeft !== undefined) && (
                        <span className="text-[10px] lg:text-xs font-mono font-bold text-white/90">({formatTime(workTimeLeft)})</span>
                    )}
                    {(status === 'COOLDOWN' && cooldown > 0) && (
                        <span className="text-[10px] lg:text-xs font-mono font-bold text-white/90">({formatTime(cooldown)})</span>
                    )}
                </div>
            </div>
        </div>
    );

};
