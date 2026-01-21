import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Image as ImageIcon, LogOut, Moon, Sun, Settings, BookOpen } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: ReactNode;
  user: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    } else {
        localStorage.removeItem('demo_user');
        window.location.reload();
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ImageIcon, label: 'Showcase', path: '/showcase' },
    { icon: Book, label: 'Diary', path: '/diary' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''} transition-colors duration-300`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 text-white p-6 fixed h-full z-10">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-pink-500 flex items-center justify-center shadow-lg shadow-accent/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">MY DIARY</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent/20 text-accent border border-accent/20 shadow-sm'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between">
             <span className="text-sm text-gray-400 truncate max-w-[100px]" title={user.displayName || user.email}>
                 {user.displayName || user.email?.split('@')[0] || 'User'}
             </span>
             <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-gray-900/90 backdrop-blur-md border-b border-white/10 z-20 p-4 flex justify-between items-center text-white shadow-lg">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">MY DIARY</span>
        </div>
        <div className="flex gap-4">
            {navItems.map(item => (
                <NavLink key={item.path} to={item.path} className={({isActive}) => isActive ? 'text-accent' : 'text-gray-400'}>
                    <item.icon className="w-6 h-6" />
                </NavLink>
            ))}
             <button onClick={handleLogout}><LogOut className="w-6 h-6 text-red-400" /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen text-white">
         <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {children}
         </div>
      </main>
    </div>
  );
};