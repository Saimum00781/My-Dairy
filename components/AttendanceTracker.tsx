import React, { useEffect, useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { fetchSubjects, updateSubject, deleteSubject } from '../services';
import { Subject } from '../types';

interface AttendanceProps {
  userId: string;
}

export const AttendanceTracker: React.FC<AttendanceProps> = ({ userId }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchSubjects(userId).then(setSubjects);
  }, [userId]);

  const handleAdd = async () => {
    if (!newName) return;
    const newSub: Subject = { id: Date.now().toString(), name: newName, attended: 0, total: 0 };
    await updateSubject(userId, newSub);
    setSubjects([...subjects, newSub]);
    setNewName('');
    setIsAdding(false);
  };

  const handleUpdate = async (sub: Subject, attendedDelta: number, totalDelta: number) => {
      const updated = {
          ...sub,
          attended: Math.max(0, sub.attended + attendedDelta),
          total: Math.max(0, sub.total + totalDelta)
      };
      await updateSubject(userId, updated);
      setSubjects(subjects.map(s => s.id === sub.id ? updated : s));
  };

  const handleDelete = async (id: string) => {
      await deleteSubject(userId, id);
      setSubjects(subjects.filter(s => s.id !== id));
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Attendance
        </h2>
        <button onClick={() => setIsAdding(!isAdding)} className="text-indigo-400 hover:text-white transition">
            <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
          <div className="flex gap-2 mb-4">
              <input 
                className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1 text-sm text-white"
                placeholder="Subject name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button onClick={handleAdd} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Add</button>
          </div>
      )}

      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          {subjects.map(sub => {
              const pct = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 100;
              const isLow = pct < 75;
              return (
                  <div key={sub.id} className="bg-black/20 p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-200">{sub.name}</span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${isLow ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {pct}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleUpdate(sub, 1, 1)} className="hover:text-white bg-white/5 px-2 rounded">+</button>
                                    <span>{sub.attended} / {sub.total}</span>
                                    <button onClick={() => handleUpdate(sub, 0, 1)} className="hover:text-red-400 bg-white/5 px-2 rounded">Miss</button>
                                </div>
                          </div>
                      </div>
                       <button onClick={() => handleDelete(sub.id)} className="ml-2 opacity-0 group-hover:opacity-100 text-red-500"><X className="w-4 h-4" /></button>
                  </div>
              )
          })}
          {subjects.length === 0 && <p className="text-center text-gray-500 text-sm">No subjects added.</p>}
      </div>
    </div>
  );
};
