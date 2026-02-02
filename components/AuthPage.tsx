
import React, { useState } from 'react';
import { Pickaxe, Lock, User as UserIcon, ShieldAlert, Mountain, KeyRound, Bug } from 'lucide-react';
import { MockDB } from '../services/db';
import { User, OilRig } from '../services/types';
import { MAX_RIGS_PER_USER, RIG_PRESETS } from '../constants';

interface AuthPageProps {
  onLogin: (user: User) => void;
}
import { api } from '../services/api';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    console.log("--- SYSTEM DIAGNOSTICS ---");
    const errorHandler = (event: ErrorEvent) => {
      alert(`[BROWSER ERROR] ${event.message}\nAt: ${event.filename}:${event.lineno}`);
    };
    window.addEventListener('error', errorHandler);

    // Global helper to debug from console
    (window as any).forceLoginAdmin = async () => {
      console.log("Forcing Admin Login...");
      alert("กำลังสั่งระบบ Login อัตโนมัติ...");
      try {
        const user = await api.login('admin', 'bleach', '4901');
        onLogin(user);
      } catch (e: any) {
        alert("Force login failed: " + (e.message || "Network Error"));
      }
    };
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    alert("🚀 เริ่มขั้นตอนการเข้าสู่ระบบ...");
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("กรุณากรอกไอดีและรหัสผ่าน");
      setLoading(false);
      return;
    }

    // PIN Validation (Frontend check)
    if (pin && (pin.length !== 4 || isNaN(Number(pin)))) {
      setError("กรุณากรอกรหัส PIN เป็นตัวเลข 4 หลัก");
      setLoading(false);
      return;
    }

    try {
      console.log(`[AUTH] Attempting ${isLogin ? 'login' : 'register'} for: ${trimmedUsername}`);
      let user;
      if (isLogin) {
        user = await api.login(trimmedUsername, trimmedPassword, pin);
      } else {
        user = await api.register(trimmedUsername, trimmedPassword, pin);
      }

      console.log('[AUTH] Login successful:', user.username);
      onLogin(user);
    } catch (err: any) {
      console.error('[AUTH ERROR]', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      const status = err.response?.status ? `(Status: ${err.response.status})` : '';
      setError(`${msg} ${status}`);
      alert(`❌ Login Error: ${msg}\n${status}\n\nกรุณาเช็คว่ารัน Backend อยู่ที่พอร์ต 5001 หรือไม่`);
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
        durationMonths: preset.durationMonths || (preset.durationDays ? preset.durationDays / 30 : 1),
        dailyProfit: preset.dailyProfit,
        bonusProfit: 0,
        rarity: 'COMMON',
        ratePerSecond: ratePerSecond,
        purchasedAt: Date.now(),
        lastClaimAt: Date.now(),
        lastGiftAt: Date.now(),
        renewalCount: 0,
        lastRepairAt: Date.now(),
        currentMaterials: 0,
        expiresAt: Date.now() + ((preset.durationDays || 30) * 24 * 60 * 60 * 1000),
        repairCost: preset.repairCost || 0,
        energyCostPerDay: preset.energyCostPerDay || 0,
        energy: 100
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
      <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md z-[10]"></div>

      <div className="relative z-[100] bg-stone-900/90 border border-yellow-600/30 w-full max-w-md p-10 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Decorative Lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full mb-6 shadow-lg border-4 border-stone-800">
            <Mountain size={40} className="text-stone-900" />
          </div>
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 drop-shadow-md">GOLD RUSH</h1>
          <p className="text-yellow-600/80 text-sm tracking-[0.2em] font-bold mt-2 uppercase">เกมจำลองธุรกิจเหมืองแร่</p>

          {/* TOTAL BYPASS BUTTON */}
          <button
            onClick={() => (window as any).forceLoginAdmin()}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded shadow-xl border-2 border-white/20 animate-bounce"
          >
            ⚡ AUTO-LOGIN ADMIN (BYPASS)
          </button>
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
            type="button"
            onClick={(e) => {
              alert("👆 คุณกดปุ่มเข้าสู่ระบบแล้ว!");
              handleSubmit(e);
            }}
            disabled={loading}
            className={`w-full cursor-pointer bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-stone-950 font-bold py-4 shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-display text-lg tracking-widest border border-yellow-500/20 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-stone-950 border-t-white rounded-full animate-spin"></div>
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              isLogin ? 'เข้าสู่ระบบ (LOGIN)' : 'ลงทะเบียนและตั้งรหัส PIN'
            )}
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
                if (window.confirm("เข้าสู่โหมดทดลองเล่น (Demo Mode)\n\n• เงินเริ่มต้น 50,000 บาท\n• ความเร็วเกม x720 (1 วัน = 2 นาที)\n• รีเฟรชหน้าเว็บข้อมูลจะหายไป")) {
                  const demoUser = MockDB.createDemoUser();
                  onLogin(demoUser);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-900/50 animate-pulse"
            >
              <Bug size={18} /> ทดลองเล่น (Play Demo) - Speed x720
            </button>
          </div>

          {/* EMERGENCY LOGIN FOR ADMIN */}
          <div className="pt-6 border-t border-red-900/30">
            <button
              onClick={async () => {
                if (window.confirm("ทดลองเข้าสู่ระบบ Admin โดยอัตโนมัติ (เฉพาะการแก้ไขปัญหา)?")) {
                  try {
                    setLoading(true);
                    const user = await api.login('admin', 'bleach', '4901');
                    onLogin(user);
                  } catch (err: any) {
                    alert("Emergency Login Failed: " + (err.response?.data?.message || err.message));
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="w-full bg-red-900/40 hover:bg-red-800 text-red-200 py-3 rounded text-[10px] font-bold uppercase tracking-widest border border-red-500/30 transition-all"
            >
              🆘 EMERGENCY ADMIN ENTRANCE
            </button>
            <p className="text-[9px] text-red-500/60 mt-2">กดปุ่มนี้หากพิมพ์แล้วเข้าไม่ได้ เพื่อบังคับเข้าด้วยระบบ Admin สำรอง</p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                if (window.confirm("ต้องการซิงค์ข้อมูลบัญชีใหม่หรือไม่?\n(ระบบจะทำการรีเซ็ตรหัสผ่าน Admin เป็นค่าเริ่มต้น)")) {
                  window.location.href = "http://localhost:5001/api/auth/seed-admin";
                }
              }}
              className="text-[10px] text-stone-600 hover:text-stone-400 uppercase tracking-tighter"
            >
              ระบบขัดข้อง? (System Sync)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
