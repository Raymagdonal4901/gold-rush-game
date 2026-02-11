
import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, CheckCircle2, Gift, Sparkles, Key, Cpu, Factory, RotateCw } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../services/types';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from './LanguageContext';
import { DAILY_CHECKIN_REWARDS } from '../constants';

interface DailyBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onRefresh: () => void;
    addNotification?: (n: any) => void;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ isOpen, onClose, user, onRefresh, addNotification }) => {
    const { t, getLocalized } = useTranslation();
    const [canCheckIn, setCanCheckIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getResetDayIdentifier = (timestamp: number) => {
        if (timestamp === 0) return 'never';
        const date = new Date(timestamp - (7 * 60 * 60 * 1000));
        return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    };

    useEffect(() => {
        if (isOpen) {
            let lastTime = 0;
            if (user.lastCheckIn) {
                const d = new Date(user.lastCheckIn);
                if (!isNaN(d.getTime())) {
                    lastTime = d.getTime();
                }
            }

            const nowTime = Date.now();
            const lastResetId = getResetDayIdentifier(lastTime);
            const nowResetId = getResetDayIdentifier(nowTime);

            setCanCheckIn(lastTime === 0 || lastResetId !== nowResetId);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleCheckIn = async () => {
        if (!canCheckIn || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await api.user.checkIn();
            if (res.success) {
                onRefresh();
                setCanCheckIn(false);
                if (addNotification) addNotification({
                    id: Date.now().toString(),
                    userId: user.id,
                    message: t('daily_checkin.checkin_success'),
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentStreak = user.checkInStreak || 0;

    const renderRewardIcon = (reward: any) => {
        switch (reward.reward) {
            case 'money':
                return (
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-emerald-400">{reward.amountTHB || (reward.amount * 35)}</span>
                        <span className="text-[10px] text-stone-500 font-bold">฿</span>
                    </div>
                );
            case 'material':
                return <MaterialIcon id={reward.tier} size="w-10 h-10" iconSize={24} />;
            case 'item':
                const Icon = reward.id === 'chest_key' ? Key : reward.id === 'upgrade_chip' ? Cpu : reward.id === 'mixer' ? Factory : Gift;
                return <Icon size={24} className="text-stone-400" />;
            case 'grand_prize':
                return (
                    <div className="relative">
                        <Gift size={32} className="text-yellow-500 animate-pulse" />
                        <Sparkles size={16} className="absolute -top-1 -right-1 text-white animate-bounce" />
                    </div>
                );
            default:
                return <Gift size={24} className="text-stone-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-900/20 p-2 rounded text-emerald-500">
                            <CalendarCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('daily_checkin.calendar_title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{t('daily_checkin.calendar_subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-950/50">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {DAILY_CHECKIN_REWARDS.map((reward) => {
                            const isClaimed = reward.day <= currentStreak;
                            const isCurrent = reward.day === currentStreak + 1 && canCheckIn;
                            const isLocked = reward.day > currentStreak + 1 || (reward.day === currentStreak + 1 && !canCheckIn);

                            return (
                                <div
                                    key={reward.day}
                                    className={`relative group rounded-xl border flex flex-col items-center justify-between p-3 transition-all duration-300 min-h-[110px]
                                        ${isClaimed ? 'bg-stone-900/40 border-stone-800/50 opacity-50' : ''}
                                        ${isCurrent ? 'bg-emerald-950/20 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-105 z-10' : ''}
                                        ${isLocked && !isClaimed ? 'bg-stone-900/60 border-stone-800' : ''}
                                        ${reward.highlight && !isClaimed ? 'ring-1 ring-orange-500/30 border-orange-500/50' : ''}
                                    `}
                                >
                                    <div className="flex justify-between w-full mb-1">
                                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${isCurrent ? 'text-emerald-400' : 'text-stone-500'}`}>
                                            Day {reward.day}
                                        </span>
                                        {isClaimed && <CheckCircle2 size={12} className="text-emerald-500" />}
                                    </div>

                                    <div className="flex-1 flex items-center justify-center py-1">
                                        {renderRewardIcon(reward)}
                                    </div>

                                    <div className="text-center w-full mt-1">
                                        <p className={`text-[10px] font-medium leading-tight line-clamp-2 ${reward.highlight ? 'text-orange-400' : 'text-stone-400'}`}>
                                            {getLocalized(reward.label)}
                                        </p>
                                    </div>

                                    {isCurrent && (
                                        <div className="absolute inset-0 bg-emerald-500/5 rounded-xl border-2 border-emerald-500/50 animate-pulse pointer-events-none" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-stone-900 border-t border-stone-800 flex flex-col items-center shrink-0">
                    <div className="mb-4 flex items-center gap-4">
                        <p className="text-sm font-medium text-stone-400">
                            {t('daily_checkin.streak_label')} <span className="text-emerald-400 font-bold">{currentStreak} / 30 วัน</span>
                        </p>
                    </div>

                    <button
                        onClick={handleCheckIn}
                        disabled={!canCheckIn || isSubmitting}
                        className={`w-full max-w-sm py-4 rounded-xl font-bold text-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2
                            ${canCheckIn && !isSubmitting
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-900/40'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'}
                        `}
                    >
                        {isSubmitting ? (
                            <RotateCw size={24} className="animate-spin" />
                        ) : canCheckIn ? (
                            t('daily_checkin.checkin_button_ready')
                        ) : (
                            t('daily_checkin.checkin_button_claimed')
                        )}
                    </button>

                    <p className="mt-4 text-[10px] text-stone-500 text-center italic">
                        {t('daily_checkin.streak_reset_warning')}
                    </p>
                </div>
            </div>
        </div>
    );
};
