import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export const AutomatedBotOverlay: React.FC = () => {
    const { t, language } = useTranslation();

    return (
        <div className="fixed bottom-24 left-6 z-[90] pointer-events-none select-none flex flex-col items-center gap-2 ai-robot-container">
            {/* Robot Body */}
            <div className="relative w-16 h-14 bg-stone-900 border-2 border-blue-500 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] ai-robot-body backdrop-blur-md">

                {/* Antenna */}
                <div className="absolute -top-3 w-1 h-3 bg-stone-700"></div>
                <div className="absolute -top-4 w-2 h-2 bg-blue-500 rounded-full ai-robot-antenna-tip shadow-[0_0_8px_#3b82f6]"></div>

                {/* Ears */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-stone-800 rounded-l-md border-y border-l border-blue-500/50"></div>
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-stone-800 rounded-r-md border-y border-r border-blue-500/50"></div>

                {/* Face/Screen */}
                <div className="w-12 h-8 bg-black/80 rounded-lg border border-blue-500/30 relative overflow-hidden flex items-center justify-center gap-2">
                    {/* Eyes */}
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full ai-robot-eye ai-robot-pupil shadow-[0_0_5px_#60a5fa]"></div>
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full ai-robot-eye-left ai-robot-pupil shadow-[0_0_5px_#60a5fa]"></div>

                    {/* Scan line effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-[scan_2s_linear_infinite]"></div>
                </div>

                {/* Mouth/Grill */}
                <div className="mt-1 flex gap-0.5">
                    <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                </div>
            </div>

            {/* Status Text */}
            <div className="bg-stone-900/90 border border-blue-500/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-blue-200 tracking-wide whitespace-nowrap">
                    {language === 'th' ? 'หุ่นยนต์ AI ทำงานอยู่' : 'AI Robot is working'}
                </span>
            </div>
        </div>
    );
};
