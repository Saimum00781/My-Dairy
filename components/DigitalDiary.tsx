import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchDiaryEntries, addDiaryEntry, generateDiaryReflection } from '../services';
import { DiaryEntry } from '../types';
import { Save, Plus, Sparkles } from 'lucide-react';

interface DiaryProps {
  userId: string;
}

export const DigitalDiary: React.FC<DiaryProps> = ({ userId }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Partial<DiaryEntry>>({
    content: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDiaryEntries(userId).then(setEntries);
  }, [userId]);

  const handleSave = async () => {
    if (!activeEntry.content) return;
    
    await addDiaryEntry(userId, {
        date: activeEntry.date || new Date().toISOString().split('T')[0],
        content: activeEntry.content,
        createdAt: Date.now()
    });

    setEntries(await fetchDiaryEntries(userId));
    setIsEditing(false);
    setAiReflection(null);
  };

  const handleGenerateReflection = async () => {
    if(!activeEntry.content) return;
    setAiLoading(true);
    const reflection = await generateDiaryReflection(activeEntry.content);
    setAiReflection(reflection);
    setAiLoading(false);
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar List */}
      <div className="w-full md:w-1/4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col">
        <button 
            onClick={() => {
                setIsEditing(true);
                setActiveEntry({ content: '', date: new Date().toISOString().split('T')[0] });
                setAiReflection(null);
            }}
            className="mb-4 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
            <Plus className="w-4 h-4" /> New Entry
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-2">
            {entries.map(entry => (
                <div 
                    key={entry.id}
                    onClick={() => {
                        setActiveEntry(entry);
                        setIsEditing(false);
                        setAiReflection(null);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeEntry.id === entry.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                    }`}
                >
                    <div className="text-sm font-bold mb-1">{entry.date}</div>
                    <div className="text-xs truncate opacity-70">{entry.content}</div>
                </div>
            ))}
        </div>
      </div>

      {/* Editor/View Area */}
      <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col relative">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/10">
            <span className="text-gray-400 font-mono text-sm">
                {activeEntry.date} {isEditing ? '(Drafting...)' : ''}
            </span>
            <div className="flex gap-2">
                 {isEditing && (
                     <>
                        <button 
                            onClick={handleGenerateReflection}
                            disabled={aiLoading}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            {aiLoading ? "Thinking..." : "AI Reflect"}
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-accent/20"
                        >
                            <Save className="w-4 h-4" /> Save
                        </button>
                     </>
                 )}
                 {!isEditing && (
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded"
                     >
                        Edit
                     </button>
                 )}
            </div>
        </div>

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {isEditing ? (
                <textarea 
                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none font-mono leading-relaxed"
                    placeholder="Dear Diary..."
                    value={activeEntry.content}
                    onChange={e => setActiveEntry({ ...activeEntry, content: e.target.value })}
                />
            ) : (
                <div className="flex-1 overflow-y-auto prose prose-invert max-w-none">
                    <ReactMarkdown>{activeEntry.content || ''}</ReactMarkdown>
                </div>
            )}
            
            {/* AI Reflection Panel */}
            {aiReflection && (
                <div className="mt-4 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-2 text-indigo-300 mb-2 font-bold text-sm">
                        <Sparkles className="w-4 h-4" /> AI Reflection
                    </div>
                    <p className="text-indigo-100 text-sm italic">"{aiReflection}"</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
