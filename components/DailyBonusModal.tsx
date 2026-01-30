
import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, CheckCircle2, Gift, Sparkles, Diamond } from 'lucide-react';
import { DAILY_CHECKIN_REWARDS } from '../constants';
import { MockDB } from '../services/db';
import { User } from '../types';
import { MaterialIcon } from './MaterialIcon';

interface DailyBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRefresh: () => void;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ isOpen, onClose, user, onRefresh }) => {
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [todayStreak, setTodayStreak] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const last = user.lastCheckIn || 0;
      const now = Date.now();
      const lastDate = new Date(last).toDateString();
      const nowDate = new Date(now).toDateString();
      setCanCheckIn(lastDate !== nowDate);
      setTodayStreak(user.checkInStreak || 0);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCheckIn = () => {
      try {
          const res = MockDB.checkIn(user.id);
          if (res.success) {
              setCanCheckIn(false);
              setTodayStreak(res.streak);
              onRefresh();
          }
      } catch (e: any) {
          alert(e.message);
      }
  };

  const renderRewardIcon = (reward: any) => {
      if (reward.reward === 'grand_prize') return <Diamond size={28} className="text-cyan-400 drop-shadow-[0_0_10px_cyan] animate-pulse" />;
      if (reward.reward === 'money') return <span className="text-emerald-400 font-mono font-bold">{reward.amount}</span>;
      if (reward.reward === 'material') return <MaterialIcon id={reward.tier} size="w-8 h-8" iconSize={16} />;
      if (reward.reward === 'item') {
          if (reward.id === 'chest_key') return <span className="text-2xl">🗝️</span>;
          if (reward.id === 'hat') return <span className="text-2xl">⛑️</span>;
          if (reward.id === 'upgrade_chip') return <span className="text-2xl">💾</span>;
          if (reward.id === 'dungeon_ticket_magma') return <span className="text-2xl">🎟️</span>;
          if (reward.id === 'mixer') return <span className="text-2xl">⚗️</span>;
          return <Gift className="text-purple-400" size={24} />;
      }
      return null;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-stone-950 border border-stone-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-900/20 p-2 rounded text-emerald-500">
                    <CalendarCheck size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-white">ปฏิทินของรางวัล 30 วัน</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">เช็คอินทุกวันเพื่อรับวัตถุดิบและรางวัลใหญ่</p>
                </div>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
                {DAILY_CHECKIN_REWARDS.map((reward, idx) => {
                    const isCollected = (todayStreak >= reward.day && !canCheckIn) || (todayStreak > reward.day);
                    const isToday = (todayStreak + 1 === reward.day && canCheckIn) || (todayStreak === reward.day && !canCheckIn);
                    const isGrandPrize = reward.day === 30;
                    
                    return (
                        <div key={idx} className={`relative rounded-xl border p-2 flex flex-col items-center justify-center gap-1 min-h-[100px] transition-all overflow-hidden
                            ${isGrandPrize 
                                ? 'bg-gradient-to-br from-purple-900/40 to-stone-900 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                : reward.highlight 
                                ? 'bg-gradient-to-br from-yellow-900/20 to-stone-900 border-yellow-700/50' 
                                : 'bg-stone-900 border-stone-800'}
                            ${isCollected ? 'opacity-50 grayscale' : ''}
                            ${isToday ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 z-10' : ''}
                        `}>
                            {/* Day Number */}
                            <div className={`absolute top-1.5 left-2 text-[9px] font-bold ${isGrandPrize ? 'text-purple-300' : 'text-stone-600'}`}>Day {reward.day}</div>
                            
                            {/* Icon */}
                            <div className="flex-1 flex items-center justify-center mt-2">
                                {renderRewardIcon(reward)}
                            </div>
                            
                            {/* Label */}
                            <div className={`text-[9px] text-center w-full px-1 truncate font-medium ${isGrandPrize ? 'text-purple-200' : reward.highlight ? 'text-yellow-200' : 'text-stone-400'}`}>
                                {reward.label}
                            </div>
                            
                            {isCollected && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                                    <CheckCircle2 className="text-emerald-500" size={24} />
                                </div>
                            )}
                            
                            {isGrandPrize && !isCollected && (
                                <Sparkles className="absolute top-1 right-1 text-purple-400 animate-pulse" size={12} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="p-6 bg-stone-900 border-t border-stone-800 text-center shrink-0">
            <div className="flex flex-col items-center gap-3">
                <div className="text-sm text-stone-300">
                    เช็คอินต่อเนื่อง: <span className="text-emerald-400 font-bold font-mono text-lg">{todayStreak}</span> / 30 วัน
                </div>
                
                <button 
                    onClick={handleCheckIn}
                    disabled={!canCheckIn}
                    className={`w-full max-w-md py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                        ${canCheckIn 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-900/30' 
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'}
                    `}
                >
                    {canCheckIn ? 'ลงชื่อรับรางวัล' : 'รับรางวัลแล้ว'}
                </button>
                <p className="text-[10px] text-stone-500">
                    *หากไม่ล็อกอินต่อเนื่องเกิน 48 ชม. ระบบจะรีเซ็ตวันเป็นวันที่ 1 ใหม่
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};
