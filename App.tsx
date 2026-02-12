import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerDashboard } from './components/PlayerDashboard';
import { User } from './services/types';
import { api } from './services/api';
import { AlertTriangle } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { WhitepaperPage } from './components/WhitepaperPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { STORAGE_KEYS } from './constants';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSystemMaintenance, setIsSystemMaintenance] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  // ... existing useEffect and component logic ...

  useEffect(() => {
    console.log('--- SYSTEM CORE INITIALIZED ---');
    console.log('API URL:', (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api (Default)');
    console.log('Current Session:', user?.username || 'Guest');
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Fetch system config first (can fail if server is down, handle catch)
        try {
          const config = await api.getSystemConfig();
          setIsSystemMaintenance(config.isMaintenanceMode);
          console.log('[SYSTEM] Maintenance status:', config.isMaintenanceMode);
        } catch (e) {
          console.error('[SYSTEM] Failed to fetch system config', e);
        }

        // 2. Check for token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userData = await api.getMe();
            setUser(userData);
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userData)); // Save user data to session
            setShowLanding(false); // Skip landing if logged in
          } catch (authError) {
            console.error('[SYSTEM] Token invalid', authError);
            localStorage.removeItem('token');
            localStorage.removeItem(STORAGE_KEYS.SESSION); // Clear session if token invalid
          }
        }
      } catch (err) {
        console.error('[SYSTEM] Critical init error', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setShowLanding(false);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setShowLanding(false); // Or true if we want to go back to landing? Let's stay on Auth for now as per consistent UX, or true? User requested "PLAY NOW" button from Landing.
    // Actually, traditionally logout goes to Landing or Auth. Let's go to AuthPage for now to allow quick re-login, but maybe Landing is better for "Exit".
    // I'll set it to false (AuthPage) to match current behavior for now.
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
        <div className="text-yellow-500 font-display animate-pulse text-xl tracking-widest uppercase">
          Initializing System...
        </div>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  // --- Routing Logic ---

  // 1. If Maintenance is ON and user is NOT Admin -> show Maintenance
  if (isSystemMaintenance && !isAdmin) {
    // If not logged in, we must show AuthPage so they can attempt Admin login
    if (!user) {
      // If on landing page, stick to landing page? No, probably show maintenance if they try to login.
      // But if site is down, maybe show maintenance immediately?
      // For now, let's let LandingPage show, but clicking "PLAY NOW" goes to Auth which shows Maintenance?
      // Actually, existing logic for `!user` returns AuthPage immediately.
      // If maintenance is ON, we should probably intercept.
      if (showLanding) {
        return <LandingPage onPlayNow={() => setShowLanding(false)} onWhitepaper={() => { setShowLanding(false); setShowWhitepaper(true); }} />;
      }
      return <AuthPage onLogin={handleLogin} />;
    }

    // Is logged in as regular user -> Maintenance screen
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-center z-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-stone-950"></div>

        <div className="w-24 h-24 mb-6 rounded-full bg-red-900/20 flex items-center justify-center border-4 border-red-500/30 animate-pulse relative z-10">
          <AlertTriangle size={48} className="text-red-500" />
        </div>

        <h1 className="text-4xl font-black text-red-500 mb-6 tracking-wider uppercase drop-shadow-md relative z-10 font-display">
          SYSTEM MAINTENANCE
        </h1>

        <div className="max-w-xl mx-auto space-y-6 relative z-10 bg-stone-900/80 p-8 rounded-2xl border border-red-500/20 backdrop-blur-sm shadow-xl">
          <p className="text-lg text-stone-300 font-medium">
            เนื่องจากตอนนี้เว็บไซต์ <span className="text-red-400 font-bold">โดนโจมตี</span> กำลังเจาะระบบเข้ามา
          </p>
          <p className="text-2xl text-yellow-400 font-bold drop-shadow-sm border-y border-yellow-500/20 py-2">
            ผมขอปิดระบบจนถึงเวลา 20.00 น.
          </p>

          <div className="bg-red-950/40 p-4 rounded-xl border border-red-500/30 text-left space-y-2">
            <p className="text-red-400 font-bold text-sm uppercase">
              หมายเหตุ (Important Note)
            </p>
            <p className="text-stone-300 text-sm">
              กรณีที่กำจัด Bot อาจจะต้อง <span className="text-white font-bold underline decoration-red-500">รีข้อมูลใหม่</span>
            </p>
            <p className="text-emerald-400 font-bold text-sm bg-emerald-900/20 p-2 rounded border border-emerald-500/20">
              "ผู้เล่นที่เติมเงินแล้ว ผมจะคืนเป็นเงินเท่าเดิม + เงินชดเชยนะครับ"
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 text-stone-500 hover:text-white transition-colors text-sm underline z-10"
        >
          Logout / Switch Account
        </button>
      </div>
    );
  }

  // 2. Not logged in
  if (!user) {
    if (showWhitepaper) {
      return <WhitepaperPage onBack={() => { setShowWhitepaper(false); setShowLanding(true); }} onPlayNow={() => { setShowWhitepaper(false); setShowLanding(false); }} />;
    }
    if (showLanding) {
      return <LandingPage onPlayNow={() => setShowLanding(false)} onWhitepaper={() => { setShowLanding(false); setShowWhitepaper(true); }} />;
    }
    return <AuthPage onLogin={handleLogin} />;
  }

  // 3. Logged in as Admin -> Dashboard
  if (isAdmin) {
    return <AdminDashboard currentUser={user} onLogout={handleLogout} />;
  }

  // 4. Regular user (No maintenance) -> Player Dashboard
  return <PlayerDashboard initialUser={user} onLogout={handleLogout} />;
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;