import React from 'react';

interface PixelProgressBarProps {
    current: number;
    max: number;
    showValue?: boolean;
    label?: string;
    icon?: React.ReactNode;
    color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'cyan' | 'orange';
    className?: string;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
    current,
    max,
    showValue = true,
    label,
    icon,
    color,
    className = ''
}) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    // Determine color based on percentage if not specified
    let barColorClass = 'bg-emerald-500';
    let borderColorClass = 'border-emerald-700';

    if (color) {
        switch (color) {
            case 'green': barColorClass = 'bg-emerald-500'; borderColorClass = 'border-emerald-700'; break;
            case 'yellow': barColorClass = 'bg-yellow-500'; borderColorClass = 'border-yellow-700'; break;
            case 'red': barColorClass = 'bg-red-500'; borderColorClass = 'border-red-700'; break;
            case 'blue': barColorClass = 'bg-blue-500'; borderColorClass = 'border-blue-700'; break;
            case 'purple': barColorClass = 'bg-purple-500'; borderColorClass = 'border-purple-700'; break;
            case 'cyan': barColorClass = 'bg-cyan-500'; borderColorClass = 'border-cyan-700'; break;
            case 'orange': barColorClass = 'bg-orange-500'; borderColorClass = 'border-orange-700'; break;
        }
    } else {
        // Auto color based on health
        if (percentage <= 20) {
            barColorClass = 'bg-red-500';
            borderColorClass = 'border-red-700';
        } else if (percentage <= 50) {
            barColorClass = 'bg-yellow-500';
            borderColorClass = 'border-yellow-700';
        }
    }

    // Create segments (10 segments for 100%)
    const totalSegments = 8;
    const filledSegments = Math.ceil((percentage / 100) * totalSegments);

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {(label || showValue) && (
                <div className="flex justify-between items-end text-[10px] font-bold px-0.5">
                    {label && <span className="text-stone-400 uppercase tracking-wider">{label}</span>}
                    {showValue && <span className="text-white font-mono">{current.toLocaleString()} <span className="text-stone-500">/ {max.toLocaleString()}</span></span>}
                </div>
            )}

            <div className="flex items-center gap-2">
                {icon && <div className="shrink-0">{icon}</div>}

                <div className="flex-1 h-3 sm:h-4 bg-stone-900 border-2 border-stone-700 rounded-sm relative flex gap-[1px] p-[1px]">
                    {/* Render segments */}
                    {Array.from({ length: totalSegments }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-[1px] transition-all duration-300 ${i < filledSegments
                                    ? `${barColorClass} shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]`
                                    : 'bg-stone-800/50'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
