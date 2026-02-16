import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-xl shadow-lg hover:border-stone-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} bg-stone-800`}>
                    <Icon className={`${color}`} size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>

            {/* Subtle bottom accent */}
            <div className={`h-1 w-0 group-hover:w-full transition-all duration-300 rounded-full mt-4 ${color.replace('text-', 'bg-')}`} />
        </div>
    );
};
