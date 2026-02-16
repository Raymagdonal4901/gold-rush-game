
import React, { useState } from 'react';
import { Pickaxe, Lock, User as UserIcon, ShieldAlert, Mountain, KeyRound } from 'lucide-react';
import { MockDB } from '../services/db';
import { User, OilRig } from '../services/types';
import { MAX_RIGS_PER_USER, RIG_PRESETS } from '../constants';
import { ReferralAnnouncement } from './ReferralAnnouncement';

interface AuthPageProps {
  onLogin: (user: User) => void;
}
import { api } from '../services/api';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  React.useEffect(() => {
    console.log("--- SYSTEM DIAGNOSTICS ---");
    const errorHandler = (event: ErrorEvent) => {
      console.error(`[BROWSER ERROR] ${event.message}\nAt: ${event.filename}:${event.lineno}`);
    };
    window.addEventListener('error', errorHandler);

    // Capture Referral Code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      console.log(`[AUTH] Referral code detected from URL: ${ref}`);
      setReferralCode(ref);
      setIsLogin(false); // Switch to Register mode if ref code is present
    }

    return () => window.removeEventListener('error', errorHandler);
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
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
        if (!email.trim() || !email.includes('@')) {
          setError("กรุณากรอกอีเมลให้ถูกต้อง");
          setLoading(false);
          return;
        }
        user = await api.register(trimmedUsername, email.trim(), trimmedPassword, pin, referralCode.trim());
      }

      console.log('[AUTH] Login successful:', user.username);
      onLogin(user);
    } catch (err: any) {
      console.error('[AUTH ERROR]', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      const status = err.response?.status ? `(Status: ${err.response.status})` : '';
      setError(`${msg} ${status}`);
    } finally {
      setLoading(false);
    }
  };



  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPin('');
    setReferralCode('');
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

          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-yellow-600 uppercase tracking-wider">อีเมล (Email)</label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-950/50 border border-stone-700 rounded-sm py-3 pl-10 pr-4 text-yellow-100 focus:border-yellow-500 outline-none transition-all placeholder:text-stone-700 font-mono"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
            </div>
          )}

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

          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between">
                <span>รหัสแนะนำ (Referral Code)</span>
                <span className="text-stone-500 font-normal normal-case opacity-70">Optional</span>
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                  className="w-full bg-stone-950/50 border border-stone-700 rounded-sm py-3 pl-10 pr-4 text-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-700 font-mono"
                  placeholder="ใส่ชื่อผู้แนะนำ (ถ้ามี)"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
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
