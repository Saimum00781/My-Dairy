import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Lock, Mail, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = () => {
    setLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
        localStorage.setItem('demo_user', JSON.stringify({ 
            email: 'guest@mydiary.app', 
            uid: 'guest-user-123',
            displayName: 'Guest Explorer' 
        }));
        onLoginSuccess();
        setLoading(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!auth) {
        handleGuestLogin();
        return;
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/api-key-not-valid' || err.message.includes('api-key-not-valid')) {
         setError('Configuration Error: Missing API Keys. Please use "Continue as Guest".');
      } else {
         setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-accent/20 mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">MY DIARY</h1>
          <p className="text-gray-300">Your Personal OS & Digital Mind</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-accent/20"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <div className="my-6 flex items-center justify-center gap-2 opacity-50">
            <div className="h-px bg-white/20 w-full"></div>
            <span className="text-xs text-white uppercase whitespace-nowrap">Or try without account</span>
            <div className="h-px bg-white/20 w-full"></div>
        </div>

        <button 
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/30"
        >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Continue as Guest</span>
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};