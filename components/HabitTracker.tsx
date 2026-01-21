import React, { useEffect, useState } from 'react';
import { Flame, Check, Plus, Trash, X } from 'lucide-react';
import { fetchHabits, updateHabit, deleteHabit } from '../services';
import { Habit } from '../types';

interface HabitTrackerProps {
  userId: string;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ userId }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits(userId).then(setHabits);
  }, [userId]);

  const handleAdd = async () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      lastCompletedDate: ''
    };
    await updateHabit(userId, newHabit);
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setIsAdding(false);
  };

  const handleCheck = async (habit: Habit) => {
    const isCompletedToday = habit.lastCompletedDate === today;
    if (isCompletedToday) return; // Already done

    // Simple streak logic: if last completed was yesterday, inc streak, else reset to 1
    // For simplicity in this demo, we just increment if checked today.
    const updatedHabit = {
        ...habit,
        streak: habit.streak + 1,
        lastCompletedDate: today
    };
    
    await updateHabit(userId, updatedHabit);
    setHabits(habits.map(h => h.id === habit.id ? updatedHabit : h));
  };

  const handleDelete = async (id: string) => {
      await deleteHabit(userId, id);
      setHabits(habits.filter(h => h.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Habit Streaks
        </h2>
        <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition">
            {isAdding ? 'Cancel' : '+ New Habit'}
        </button>
      </div>
      
      {isAdding && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
              <input 
                autoFocus
                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-orange-500"
                placeholder="Habit name..."
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button onClick={handleAdd} className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">Add</button>
          </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {habits.map(habit => {
            const isDone = habit.lastCompletedDate === today;
            return (
                <div key={habit.id} className="relative group min-w-[140px] bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col items-center justify-between hover:border-orange-500/30 transition-all">
                    <button onClick={() => handleDelete(habit.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1"><X className="w-3 h-3" /></button>
                    <div className="text-center mb-2">
                        <div className="text-sm font-medium text-gray-200 mb-1 truncate max-w-[120px]">{habit.name}</div>
                        <div className="flex items-center justify-center gap-1 text-orange-400">
                            <Flame className={`w-4 h-4 ${isDone ? 'fill-orange-500' : ''}`} />
                            <span className="font-bold">{habit.streak}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleCheck(habit)}
                        disabled={isDone}
                        className={`w-full py-1.5 rounded-lg flex items-center justify-center transition-all ${
                            isDone 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-white/10 text-gray-400 hover:bg-orange-500/20 hover:text-orange-400'
                        }`}
                    >
                        {isDone ? <Check className="w-4 h-4" /> : 'Check'}
                    </button>
                </div>
            )
        })}
        {habits.length === 0 && !isAdding && (
            <div className="text-gray-500 text-sm italic p-4">No habits tracked yet.</div>
        )}
      </div>
    </div>
  );
};
