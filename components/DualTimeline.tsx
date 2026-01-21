import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  RefreshCcw, 
  Calendar,
  Activity
} from 'lucide-react';
import { 
  fetchRoutine, 
  saveRoutine, 
  fetchDailyLog, 
  saveDailyLog 
} from '../services';
import { RoutineItem, LogItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DualTimelineProps {
  userId: string;
}

export const DualTimeline: React.FC<DualTimelineProps> = ({ userId }) => {
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const loadData = async () => {
      const [rData, lData] = await Promise.all([
        fetchRoutine(userId),
        fetchDailyLog(userId, today)
      ]);
      setRoutine(rData);
      
      if (lData.length === 0 && rData.length > 0) {
        const initialLog = rData.map(r => ({ id: r.id, title: r.title, completed: false }));
        setLogs(initialLog);
      } else {
        setLogs(lData);
      }
    };
    loadData();
  }, [userId, today]);

  const addRoutineItem = async () => {
    if (!newRoutineTitle.trim()) return;
    const newItem: RoutineItem = { id: Date.now().toString(), title: newRoutineTitle };
    const updatedRoutine = [...routine, newItem];
    setRoutine(updatedRoutine);
    await saveRoutine(userId, updatedRoutine);
    
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
  // Neon Cyan for progress
  const COLORS = ['#06b6d4', 'rgba(255,255,255,0.05)'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Productivity Pulse
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} innerRadius={12} outerRadius={18} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <span className="text-xl font-bold text-cyan-400">{syncScore}%</span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        {/* Ideal Routine */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ideal Routine</span>
            <RefreshCcw className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={newRoutineTitle} 
              onChange={(e) => setNewRoutineTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRoutineItem()}
              placeholder="Add task..."
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={addRoutineItem} className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg hover:bg-cyan-500/30"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {routine.map(item => (
                  <div key={item.id} className="group flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all">
                      <span className="text-sm text-gray-300">{item.title}</span>
                      <button onClick={() => removeRoutineItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                  </div>
              ))}
          </div>
        </div>

        {/* Reality Log */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden">
           <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reality Log</span>
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {logs.map(item => (
                  <div 
                      key={item.id} 
                      onClick={() => toggleLogItem(item.id)}
                      className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          item.completed 
                          ? 'bg-cyan-500/10 border-cyan-500/30' 
                          : 'bg-black/20 border-white/5 hover:border-white/20'
                      }`}
                  >
                      {item.completed 
                          ? <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" /> 
                          : <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      }
                      <span className={`text-sm ${item.completed ? 'text-white line-through opacity-50' : 'text-gray-200'}`}>
                          {item.title}
                      </span>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
