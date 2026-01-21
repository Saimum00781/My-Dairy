import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Showcase } from './components/Showcase';
import { DigitalDiary } from './components/DigitalDiary';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply saved theme immediately on app load
    const savedThemeId = localStorage.getItem('app_theme_id');
    if (savedThemeId) {
       const themes: any = {
          'violet': { accent: '139 92 246', bg: ['#1e1b4b', '#312e81', '#4c1d95'] },
          'ocean': { accent: '6 182 212', bg: ['#0f172a', '#1e3a8a', '#1d4ed8'] },
          'emerald': { accent: '16 185 129', bg: ['#022c22', '#064e3b', '#065f46'] },
          'crimson': { accent: '244 63 94', bg: ['#4c0519', '#881337', '#be123c'] },
          'sunset': { accent: '249 115 22', bg: ['#431407', '#7c2d12', '#c2410c'] }
       };

       const t = themes[savedThemeId];
       if (t) {
          const root = document.documentElement;
          root.style.setProperty('--accent-rgb', t.accent);
          root.style.setProperty('--bg-gradient-from', t.bg[0]);
          root.style.setProperty('--bg-gradient-mid', t.bg[1]);
          root.style.setProperty('--bg-gradient-to', t.bg[2]);
       }
    }

    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
        setUser(JSON.parse(demoUser));
        setLoading(false);
    } else if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    } else {
        setLoading(false);
    }
  }, []);

  const handleLoginSuccess = () => {
      // Check local storage for demo user immediately after successful guest login
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
          setUser(JSON.parse(demoUser));
      }
      // Note: If using Firebase auth, the onAuthStateChanged listener in useEffect will handle the update
  };

  const handleLogout = async () => {
    if (auth) {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout error", error);
        }
    }
    localStorage.removeItem('demo_user');
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1e1b4b] text-white">Loading Command Center...</div>;
  }

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard userId={user.uid} />} />
          <Route path="/showcase" element={<Showcase userId={user.uid} />} />
          <Route path="/diary" element={<DigitalDiary userId={user.uid} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;