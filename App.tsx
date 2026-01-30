import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerDashboard } from './components/PlayerDashboard';
import { User } from './services/types';
import { MockDB } from './services/db';
import { ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check for session
  useEffect(() => {
    const session = MockDB.getSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    MockDB.logout();
    setUser(null);
  };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-500 font-display animate-pulse text-xl">Initializing System...</div>
      </div>
    );
  }

  // 1. Not Logged In -> Auth Page
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // 2. Logged In as Admin -> Back End
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return <AdminDashboard currentUser={user} onLogout={handleLogout} />;
  }

  // 3. Maintenance Check (For Regular Users)
  const sysConfig = MockDB.getSystemConfig();
  if (sysConfig.isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-red-900/20 flex items-center justify-center border-4 border-red-500/30 animate-pulse">
          {/* Icon placeholder or use existing import if available */}
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">SYSTEM UNDER MAINTENANCE</h1>
        <p className="text-stone-400 max-w-md mx-auto">
          ระบบกำลังปิดปรับปรุงชั่วคราวเพื่ออัปเดตประสิทธิภาพ กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
        <button onClick={handleLogout} className="mt-8 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-bold transition-colors">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  // 3. Logged In as User -> Front End
  return <PlayerDashboard initialUser={user} onLogout={handleLogout} />;
};

export default App;