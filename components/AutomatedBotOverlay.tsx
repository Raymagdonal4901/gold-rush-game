import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Pause, Play } from 'lucide-react';

interface AutomatedBotOverlayProps {
    status: 'WORKING' | 'COOLDOWN' | 'PAUSED';
    cooldown: number;
    workTimeLeft?: number;
    expirationTimeLeft?: number; // Time left before soonest rig expires
    onTogglePause: () => void;
    onClose?: () => void;
    isFixed?: boolean;
    className?: string;
    style?: React.CSSProperties;
    customStatusText?: string;
    customTimeLabel?: string;
}

export const AutomatedBotOverlay: React.FC<AutomatedBotOverlayProps> = ({
    status,
    cooldown,
    workTimeLeft,
    expirationTimeLeft,
    onTogglePause,
    onClose,
    isFixed = true,
    className = '',
    style = {},
    customStatusText,
    customTimeLabel
}) => {
    const { t, language } = useTranslation();

    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const positionClass = isFixed ? 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]' : 'relative z-[50]';

    return (
        <div className={`${positionClass} pointer-events-none select-none flex flex-col items-center gap-2 ai-robot-container ${className}`} style={style}>
            {/* Robot Body - Clickable wrapper */}
            <div className="pointer-events-auto relative">
                {/* Close Button - Only visible if onClose is provided */}
                {onClose && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute -top-6 -right-6 w-8 h-8 rounded-full bg-stone-900 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 transition-colors flex items-center justify-center z-[210] shadow-xl"
                    >
                        <Pause size={14} className="rotate-45" /> {/* Using Pause rotated as an X fallback or I can import X */}
                    </button>
                )}

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePause();
                    }}
                    className={`relative w-24 h-18 lg:w-32 lg:h-24 bg-stone-900 border-2 ${status === 'PAUSED' ? 'border-stone-600 grayscale ai-robot-sleeping' : 'border-blue-500'} rounded-2xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] ai-robot-body backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95`}
                >
                    {/* Antenna */}
                    <div className="absolute -top-4 w-1 h-4 bg-stone-700"></div>
                    <div className={`absolute -top-6 w-3 h-3 ${status === 'PAUSED' ? 'bg-stone-500' : 'bg-blue-500'} rounded-full ai-robot-antenna-tip shadow-[0_0_12px_#3b82f6]`}></div>

                    {/* Ears */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-10 bg-stone-800 rounded-l-md border-y border-l border-blue-500/30"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-10 bg-stone-800 rounded-r-md border-y border-r border-blue-500/30"></div>

                    {/* Face/Screen */}
                    <div className="w-16 h-10 lg:w-24 lg:h-14 bg-black/80 rounded-lg border border-blue-500/30 relative overflow-hidden flex items-center justify-center gap-2 lg:gap-3">
                        {/* Eyes */}
                        {status === 'PAUSED' ? (
                            <>
                                <div className="w-3.5 h-1 lg:w-5 lg:h-1.5 bg-stone-500 rounded-full ai-robot-eyes-closed shadow-[0_0_4px_rgba(255,255,255,0.2)]"></div>
                                <div className="w-3.5 h-1 lg:w-5 lg:h-1.5 bg-stone-500 rounded-full ai-robot-eyes-closed shadow-[0_0_4px_rgba(255,255,255,0.2)]"></div>
                            </>
                        ) : (
                            <>
                                <div className={`w-3.5 h-3.5 lg:w-5 h-5 ${status === 'PAUSED' ? 'bg-stone-600' : 'bg-blue-400'} rounded-full ai-robot-eye ai-robot-pupil shadow-[0_0_8px_#60a5fa]`}></div>
                                <div className={`w-3.5 h-3.5 lg:w-5 h-5 ${status === 'PAUSED' ? 'bg-stone-600' : 'bg-blue-400'} rounded-full ai-robot-eye-left ai-robot-pupil shadow-[0_0_8px_#60a5fa]`}></div>
                            </>
                        )}

                        {/* Scan line effect */}
                        {status !== 'PAUSED' && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-[scan_2s_linear_infinite]"></div>
                        )}
                    </div>

                    {/* Mouth/Grill */}
                    <div className="mt-2 flex gap-1 lg:gap-1.5">
                        <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
                        <div className={`w-1.5 h-1.5 ${status === 'WORKING' ? 'bg-green-500 animate-pulse' : 'bg-stone-700'} rounded-full`}></div>
                        <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
                    </div>

                    {/* Play/Pause Status Small Indicator */}
                    <div className={`absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 w-7 h-7 lg:w-9 lg:h-9 ${status === 'PAUSED' ? 'bg-yellow-500 text-black' : 'bg-stone-800 text-white border border-stone-600'} rounded-full flex items-center justify-center shadow-xl z-20 transition-all`}>
                        {status === 'PAUSED' ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                    </div>
                </div>
            </div>

            {/* Status Text (Below Robot) */}
            <div className="flex flex-col items-center gap-2 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-2">
                <span className={`text-xs lg:text-sm font-black tracking-[0.2em] uppercase ${status === 'WORKING' ? 'text-blue-400' : (status === 'PAUSED' ? 'text-red-400' : 'text-yellow-400')} animate-pulse`}>
                    {customStatusText || (status === 'WORKING' && (language === 'th' ? 'หุ่นยนต์ AI ทำงานอยู่' : 'AI Bot Active'))}
                    {!customStatusText && status === 'PAUSED' && (language === 'th' ? 'หยุดทำงาน' : 'Paused')}
                    {!customStatusText && status === 'COOLDOWN' && (language === 'th' ? 'พักเครื่อง' : 'Cooldown')}
                </span>

                <div className="flex flex-col gap-1.5 pointer-events-auto items-center">
                    {/* Collection Timer Pill */}
                    {(status === 'WORKING' && workTimeLeft !== undefined) && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-green-500/50 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                            <span className="text-xs lg:text-sm font-mono font-bold text-white tracking-widest">
                                {customTimeLabel && <span className="text-green-400 mr-1">{customTimeLabel}</span>}
                                {formatTime(workTimeLeft)}
                            </span>
                        </div>
                    )}

                    {/* Expiration Timer Pill */}
                    {expirationTimeLeft !== undefined && expirationTimeLeft > 0 && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-red-500/50 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <div className={`w-2 h-2 rounded-full ${expirationTimeLeft < 3600000 ? 'bg-red-500 animate-ping' : 'bg-red-500'} shadow-[0_0_8px_#ef4444]`}></div>
                            <span className="text-[10px] lg:text-xs font-mono font-bold text-white tracking-widest">
                                <span className="text-red-400 mr-1">{language === 'th' ? 'จะหมดอายุใน: ' : 'Expires in: '}</span>
                                {formatTime(expirationTimeLeft)}
                            </span>
                        </div>
                    )}

                    {(status === 'COOLDOWN' && cooldown > 0) && (
                        <div className="px-4 py-1 rounded-full bg-black/60 border border-yellow-500/30 text-xs font-mono font-bold text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            ({formatTime(cooldown)})
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
};
