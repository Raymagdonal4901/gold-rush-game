import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AnnouncementModal } from './components/AnnouncementModal'; // Import Modal
import { User } from './services/types';
import { api } from './services/api';
import { AlertTriangle } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { WhitepaperPage } from './components/WhitepaperPage';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSystemMaintenance, setIsSystemMaintenance] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  // ... existing useEffect and component logic ...

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
            setShowLanding(false); // Skip landing if logged in
          } catch (authError) {
            console.error('[SYSTEM] Token invalid', authError);
            localStorage.removeItem('token');
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
    <>
      <AnnouncementModal />
      <AppContent />
    </>
  );
};

export default App;