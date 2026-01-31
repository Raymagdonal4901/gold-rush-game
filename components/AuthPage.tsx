
import React, { useState } from 'react';
import { Pickaxe, Lock, User as UserIcon, ShieldAlert, Mountain, KeyRound, Bug } from 'lucide-react';
import { MockDB } from '../services/db';
import { User, OilRig } from '../types';
import { MAX_RIGS_PER_USER, RIG_PRESETS } from '../constants';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

import { api } from '../services/api';

// ... (imports)

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // PIN Validation (Frontend check)
    if (pin && (pin.length !== 4 || isNaN(Number(pin)))) {
      setError("กรุณากรอกรหัส PIN เป็นตัวเลข 4 หลัก");
      setLoading(false);
      return;
    }

    try {
      let user;
      if (isLogin) {
        user = await api.login(username, password, pin);
      } else {
        user = await api.register(username, password, pin);
      }
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSystemLogin = () => {
    try {
      const randId = Math.floor(Math.random() * 10000);
      const testUsername = `tester_${randId}`;
      const testPass = '1234';
      const testPin = '0000';

      // 1. Create User
      const newUser = MockDB.register(testUsername, testPass, testPin);

      // 2. Add Money (50,000)
      MockDB.updateBalance(newUser.id, 50000);

      // Log the initial deposit for history
      MockDB.logTransaction({
        userId: newUser.id,
        type: 'DEPOSIT',
        amount: 50000,
        status: 'COMPLETED',
        description: 'เงินขวัญถุง (Test System)'
      });

      // 3. Add Rigs (1 Unit) - Adjusted to 1 as requested
      const preset = RIG_PRESETS[0]; // Start with Coal Mining Rig
      const ratePerSecond = preset.dailyProfit / 86400;

      const newRig: OilRig = {
        id: Math.random().toString(36).substr(2, 9),
        ownerId: newUser.id,
        name: preset.name,
        investment: preset.price,
        durationMonths: preset.durationMonths,
        dailyProfit: preset.dailyProfit,
        bonusProfit: 0,
        rarity: 'COMMON',
        ratePerSecond: ratePerSecond,
        purchasedAt: Date.now(),
        lastClaimAt: Date.now(),
        lastGiftAt: Date.now(),
        renewalCount: 0,
        lastRepairAt: Date.now(),
        currentMaterials: 0
      };
      MockDB.addRig(newRig);

      // 4. Auto Login
      const loggedInUser = MockDB.login(testUsername, testPass, testPin);
      onLogin(loggedInUser);

    } catch (e: any) {
      setError("เกิดข้อผิดพลาดในการสร้างไอดีทดสอบ: " + e.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setPin('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-sm"></div>

      <div className="relative bg-stone-900/80 border border-yellow-600/30 w-full max-w-md p-10 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Decorative Lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full mb-6 shadow-lg border-4 border-stone-800">
            <Mountain size={40} className="text-stone-900" />
          </div>
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 drop-shadow-md">GOLD RUSH</h1>
          <p className="text-yellow-600/80 text-sm tracking-[0.2em] font-bold mt-2 uppercase">เกมจำลองธุรกิจเหมืองแร่</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-950/50 border border-red-500/30 text-red-400 text-sm p-3 text-center backdrop-blur-sm animate-pulse rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-yellow-600 uppercase tracking-wider">รหัสผู้ใช้งาน (ID)</label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-stone-950/50 border border-stone-700 rounded-sm py-3 pl-10 pr-4 text-yellow-100 focus:border-yellow-500 outline-none transition-all placeholder:text-stone-700 font-mono"
                placeholder="กรอกไอดี"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-yellow-600 uppercase tracking-wider">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-stone-950/50 border border-stone-700 rounded-sm py-3 pl-10 pr-4 text-yellow-100 focus:border-yellow-500 outline-none transition-all placeholder:text-stone-700 font-mono"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-yellow-600 uppercase tracking-wider flex justify-between">
              <span>PIN ความปลอดภัย (4 หลัก)</span>
              {!isLogin && <span className="text-stone-500 font-normal normal-case">ใช้สำหรับยืนยันตัวตน</span>}
            </label>
            <div className="relative group">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={e => {
                  // Allow only numbers
                  if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                    setPin(e.target.value);
                  }
                }}
                className="w-full bg-stone-950/50 border border-stone-700 rounded-sm py-3 pl-10 pr-4 text-yellow-100 focus:border-yellow-500 outline-none transition-all placeholder:text-stone-700 font-mono text-center tracking-[0.5em]"
                placeholder="----"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-stone-950 font-bold py-4 shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-display text-lg tracking-widest border border-yellow-500/20"
          >
            {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียนและตั้งรหัส PIN'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={toggleMode}
            className="text-stone-500 hover:text-yellow-500 text-xs uppercase tracking-widest transition-colors border-b border-transparent hover:border-yellow-500/50 pb-1"
          >
            {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
          </button>

          {/* Play Demo Button */}
          <div className="pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("เข้าสู่โหมดทดลองเล่น (Demo Mode)\n\n• เงินเริ่มต้น 50,000 บาท\n• ความเร็วเกม x720 (1 วัน = 2 นาที)\n• รีเฟรชหน้าเว็บข้อมูลจะหายไป\n• หมดเวลาใน 10 นาที")) {
                  const demoUser = MockDB.createDemoUser();
                  onLogin(demoUser);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-900/50 animate-pulse"
            >
              <Bug size={18} /> ทดลองเล่น (Play Demo) - Speed x720
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
