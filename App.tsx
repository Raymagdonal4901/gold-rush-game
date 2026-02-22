import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { VerifyEmailPage } from './components/VerifyEmailPage';
import { AdminDashboard } from './components/AdminDashboard';
import PlayerDashboard from './components/PlayerDashboard';
import { AnnouncementModal } from './components/AnnouncementModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { User } from './services/types';
import { api } from './services/api';
import { LandingPage } from './components/LandingPage';
import { WhitepaperPage } from './components/WhitepaperPage';
import { LanguageProvider } from './contexts/LanguageContext';

import { AuthGuard } from './components/AuthGuard';

import { WalletPage } from './components/WalletPage';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSystemMaintenance, setIsSystemMaintenance] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register' | 'verify'>('login');
  const [viewMode, setViewMode] = useState<'player' | 'admin'>('player');

  const hasDefaultedView = React.useRef(false);

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && !hasDefaultedView.current) {
      setViewMode('admin');
      hasDefaultedView.current = true;
    }
  }, [user]);

  useEffect(() => {
    // Handle direct routing to verify or register pages
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path === '/verify' || params.has('token')) {
      setAuthView('verify');
      setShowLanding(false);
    } else if (path === '/register' || params.has('ref')) {
      setAuthView('register');
      setShowLanding(false);
    }

    const checkSession = async () => {
      try {
        try {
          const config = await api.getSystemConfig();
          setIsSystemMaintenance(config.isMaintenanceMode);
        } catch (e) {
          console.error('[SYSTEM] Failed to fetch system config', e);
        }

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userData = await api.getMe();
            setUser(userData);
            setShowLanding(false);
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
    localStorage.removeItem('token');
    setUser(null);
    setAuthView('login');
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

  return (
    <>
      <AnnouncementModal />
      {showWhitepaper ? (
        <AuthGuard>
          <WhitepaperPage
            onBack={() => { setShowWhitepaper(false); setShowLanding(true); }}
            onPlayNow={() => { setShowWhitepaper(false); setShowLanding(false); }}
          />
        </AuthGuard>
      ) : showLanding ? (
        <LandingPage
          onPlayNow={() => setShowLanding(false)}
          onWhitepaper={() => { setShowLanding(false); setShowWhitepaper(true); }}
        />
      ) : !user ? (
        authView === 'verify' ? (
          <VerifyEmailPage onGoToLogin={() => setAuthView('login')} onBack={() => setShowLanding(true)} />
        ) : authView === 'register' ? (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} onBack={() => setShowLanding(true)} />
        ) : (
          <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} onBack={() => setShowLanding(true)} />
        )
      ) : isAdmin && viewMode === 'admin' ? (
        <AuthGuard>
          <AdminDashboard
            currentUser={user}
            onLogout={handleLogout}
            onSwitchToPlayer={() => setViewMode('player')}
            onBack={() => setShowLanding(true)}
          />
        </AuthGuard>
      ) : showWallet ? (
        <AuthGuard>
          <WalletPage
            user={user}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            onBack={() => setShowWallet(false)}
          />
        </AuthGuard>
      ) : (
        <AuthGuard>
          <PlayerDashboard
            user={user}
            onLogout={handleLogout}
            onOpenWallet={() => setShowWallet(true)}
            onOpenAdmin={() => setViewMode('admin')}
            onBack={() => setShowLanding(true)}
          />
        </AuthGuard>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;