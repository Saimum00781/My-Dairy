import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Brain } from 'lucide-react';
import { DualTimeline } from './DualTimeline';
import { HabitTracker } from './HabitTracker';
import { FinanceManager } from './FinanceManager';
import { AttendanceTracker } from './AttendanceTracker';
import { addDiaryEntry, generateDashboardInsight } from '../services';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [quickThought, setQuickThought] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Function to load AI Insight based on time of day (mock check)
  useEffect(() => {
     // Simple check to see if we have an insight in session storage to avoid spamming API on refresh
     const cached = sessionStorage.getItem('daily_insight');
     if (cached) {
         setAiInsight(cached);
     }
  }, []);

  const handleGetInsight = async () => {
      setLoadingAi(true);
      // We pass a mock status here, but in a real app, we'd pass actual stats
      const insight = await generateDashboardInsight({
          time: new Date().toLocaleTimeString(),
          mood: "productive",
          tasksPending: 3
      });
      setAiInsight(insight);
      sessionStorage.setItem('daily_insight', insight);
      setLoadingAi(false);
  }

  const handleQuickCapture = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!quickThought.trim()) return;
      await addDiaryEntry(userId, {
          date: new Date().toISOString().split('T')[0],
          content: quickThought,
          createdAt: Date.now()
      });
      setQuickThought('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* AI Insight Header */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="flex-1 relative group">
            <form onSubmit={handleQuickCapture} className="h-full">
                <input 
                    type="text" 
                    className="w-full h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-6 pl-6 pr-14 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-lg min-h-[80px]"
                    placeholder="Capture a thought..."
                    value={quickThought}
                    onChange={e => setQuickThought(e.target.value)}
                />
                <button 
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-accent/20 text-accent rounded-xl hover:bg-accent hover:text-white transition-all"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
          </div>

          <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-300" />
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Assistant</span>
                  </div>
                  <p className="text-white font-medium italic">
                      "{aiInsight || "Ready to conquer the day? Tap the button for your daily briefing."}"
                  </p>
              </div>
              <button 
                onClick={handleGetInsight}
                disabled={loadingAi}
                className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50"
              >
                  <Sparkles className={`w-6 h-6 text-yellow-300 ${loadingAi ? 'animate-spin' : ''}`} />
              </button>
              {/* Decorative background element */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>
      </div>

      {/* Row 1: Habit Tracker */}
      <div className="w-full">
         <HabitTracker userId={userId} />
      </div>

      {/* Row 2: Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Dual Timeline - Takes up 2 columns on large screens */}
          <div className="xl:col-span-2">
              <DualTimeline userId={userId} />
          </div>

          {/* Right Column Stack */}
          <div className="space-y-8 flex flex-col h-full">
              <div className="flex-1 min-h-[300px]">
                <FinanceManager userId={userId} />
              </div>
              <div className="flex-1 min-h-[300px]">
                <AttendanceTracker userId={userId} />
              </div>
          </div>
      </div>
    </div>
  );
};