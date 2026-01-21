import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  RefreshCcw, 
  Calendar,
  TrendingUp 
} from 'lucide-react';
import { 
  fetchRoutine, 
  saveRoutine, 
  fetchDailyLog, 
  saveDailyLog 
} from '../services';
import { RoutineItem, LogItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LifeSyncProps {
  userId: string;
}

export const LifeSync: React.FC<LifeSyncProps> = ({ userId }) => {
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [rData, lData] = await Promise.all([
        fetchRoutine(userId),
        fetchDailyLog(userId, today)
      ]);
      setRoutine(rData);
      
      // If no log exists for today, copy routine structure to log
      if (lData.length === 0 && rData.length > 0) {
        const initialLog = rData.map(r => ({ id: r.id, title: r.title, completed: false }));
        setLogs(initialLog);
      } else {
        setLogs(lData);
      }
      setLoading(false);
    };
    loadData();
  }, [userId, today]);

  // Sync Routine to Log whenever Routine changes (optional: could be manual)
  useEffect(() => {
    // Only update log structure if log is empty or new items added to routine
    // This is a simple implementation; complex syncing logic might merge diffs.
  }, [routine]);

  const addRoutineItem = async () => {
    if (!newRoutineTitle.trim()) return;
    const newItem: RoutineItem = { id: Date.now().toString(), title: newRoutineTitle };
    const updatedRoutine = [...routine, newItem];
    setRoutine(updatedRoutine);
    await saveRoutine(userId, updatedRoutine);
    
    // Also add to today's log if not present
    if (!logs.find(l => l.title === newItem.title)) {
        const newLogItem: LogItem = { ...newItem, completed: false };
        const updatedLogs = [...logs, newLogItem];
        setLogs(updatedLogs);
        await saveDailyLog(userId, today, updatedLogs);
    }
    
    setNewRoutineTitle('');
  };

  const removeRoutineItem = async (id: string) => {
    const updatedRoutine = routine.filter(r => r.id !== id);
    setRoutine(updatedRoutine);
    await saveRoutine(userId, updatedRoutine);
  };

  const toggleLogItem = async (id: string) => {
    const updatedLogs = logs.map(l => 
      l.id === id ? { ...l, completed: !l.completed } : l
    );
    setLogs(updatedLogs);
    await saveDailyLog(userId, today, updatedLogs);
  };

  const syncScore = useMemo(() => {
    if (logs.length === 0) return 0;
    const completed = logs.filter(l => l.completed).length;
    return Math.round((completed / logs.length) * 100);
  }, [logs]);

  const chartData = [
    { name: 'Completed', value: syncScore },
    { name: 'Remaining', value: 100 - syncScore },
  ];
  const COLORS = ['#8b5cf6', 'rgba(255,255,255,0.1)'];

  if (loading) return <div className="text-white text-center mt-20">Syncing Life...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Header & Score */}
      <div className="lg:col-span-2 flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Daily Sync Score</h2>
              <p className="text-gray-400 text-sm">{today}</p>
            </div>
            <TrendingUp className="text-accent w-6 h-6" />
          </div>
          <div className="h-40 flex items-center gap-8">
             <div className="h-32 w-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{syncScore}%</span>
                </div>
             </div>
             <div>
                <p className="text-gray-300 max-w-xs">
                    {syncScore === 100 ? "Perfect alignment! You're crushing it." : 
                     syncScore > 70 ? "Great flow today. Keep pushing." : 
                     "Every step counts. Focus on the next task."}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Ideal Routine Column */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-pink-400">
            <RefreshCcw className="w-5 h-5" />
            <h3 className="font-bold text-lg">Ideal Routine</h3>
          </div>
          <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">BLUEPRINT</span>
        </div>

        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newRoutineTitle} 
            onChange={(e) => setNewRoutineTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRoutineItem()}
            placeholder="Add new habit..."
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-400"
          />
          <button 
            onClick={addRoutineItem}
            className="bg-pink-500/20 hover:bg-pink-500/40 text-pink-400 p-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {routine.map(item => (
                <div key={item.id} className="group flex items-center justify-between bg-white/5 p-3 rounded-lg border border-transparent hover:border-pink-500/30 transition-all">
                    <span className="text-gray-200">{item.title}</span>
                    <button onClick={() => removeRoutineItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            {routine.length === 0 && <p className="text-center text-gray-500 mt-10">Define your ideal day.</p>}
        </div>
      </div>

      {/* Reality Log Column */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col h-[600px]">
         <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-accent">
            <Calendar className="w-5 h-5" />
            <h3 className="font-bold text-lg">Reality Log</h3>
          </div>
          <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">TODAY</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {logs.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => toggleLogItem(item.id)}
                    className={`cursor-pointer flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        item.completed 
                        ? 'bg-accent/10 border-accent/30' 
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                >
                    {item.completed 
                        ? <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" /> 
                        : <Circle className="w-6 h-6 text-gray-500 flex-shrink-0" />
                    }
                    <span className={`text-lg ${item.completed ? 'text-white line-through opacity-50' : 'text-gray-200'}`}>
                        {item.title}
                    </span>
                </div>
            ))}
             {logs.length === 0 && <p className="text-center text-gray-500 mt-10">Add items to your routine to start logging.</p>}
        </div>
      </div>
    </div>
  );
};
