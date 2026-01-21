import React, { useEffect, useState } from 'react';
import { Palette, Layout, Moon, Sun, Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  accentRgb: string; // "R G B"
  bgGradient: {
    from: string;
    mid: string;
    to: string;
  };
}

const themes: Theme[] = [
  {
    id: 'violet',
    name: 'Deep Space',
    accentRgb: '139 92 246', // violet-500
    bgGradient: { from: '#1e1b4b', mid: '#312e81', to: '#4c1d95' }
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    accentRgb: '6 182 212', // cyan-500
    bgGradient: { from: '#0f172a', mid: '#1e3a8a', to: '#1d4ed8' }
  },
  {
    id: 'emerald',
    name: 'Forest Mist',
    accentRgb: '16 185 129', // emerald-500
    bgGradient: { from: '#022c22', mid: '#064e3b', to: '#065f46' }
  },
  {
    id: 'crimson',
    name: 'Red Velvet',
    accentRgb: '244 63 94', // rose-500
    bgGradient: { from: '#4c0519', mid: '#881337', to: '#be123c' }
  },
  {
    id: 'sunset',
    name: 'Evening Glow',
    accentRgb: '249 115 22', // orange-500
    bgGradient: { from: '#431407', mid: '#7c2d12', to: '#c2410c' }
  }
];

export const Settings: React.FC = () => {
  const [currentThemeId, setCurrentThemeId] = useState('emerald');

  useEffect(() => {
    const saved = localStorage.getItem('app_theme_id');
    if (saved) setCurrentThemeId(saved);
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--accent-rgb', theme.accentRgb);
    root.style.setProperty('--bg-gradient-from', theme.bgGradient.from);
    root.style.setProperty('--bg-gradient-mid', theme.bgGradient.mid);
    root.style.setProperty('--bg-gradient-to', theme.bgGradient.to);
    
    localStorage.setItem('app_theme_id', theme.id);
    setCurrentThemeId(theme.id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">Personalize your command center.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-bold text-white">Theme & Appearance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => applyTheme(theme)}
              className={`relative group flex items-center gap-4 p-4 rounded-xl border transition-all overflow-hidden ${
                currentThemeId === theme.id 
                  ? 'border-accent bg-white/10' 
                  : 'border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-lg shadow-inner flex items-center justify-center"
                style={{ 
                    background: `linear-gradient(135deg, ${theme.bgGradient.from}, ${theme.bgGradient.mid})` 
                }}
              >
                <div 
                    className="w-4 h-4 rounded-full shadow-lg" 
                    style={{ backgroundColor: `rgb(${theme.accentRgb})` }}
                />
              </div>
              <div className="text-left">
                <span className={`block font-bold ${currentThemeId === theme.id ? 'text-white' : 'text-gray-300'}`}>
                    {theme.name}
                </span>
                <span className="text-xs text-gray-500">
                    {currentThemeId === theme.id ? 'Active' : 'Click to apply'}
                </span>
              </div>
              {currentThemeId === theme.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Check className="w-5 h-5 text-accent" />
                  </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 opacity-50 cursor-not-allowed">
         <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Layout className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-400">Dashboard Layout (Coming Soon)</h3>
        </div>
        <p className="text-gray-500 text-sm">Future updates will allow you to drag, drop, and resize widgets.</p>
      </div>
    </div>
  );
};