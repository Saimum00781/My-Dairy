import React, { useEffect, useState } from 'react';
import { Plus, X, Image as ImageIcon, Briefcase, Star, Target } from 'lucide-react';
import { fetchShowcase, addShowcaseItem, deleteShowcaseItem } from '../services';
import { ShowcaseItem } from '../types';

interface ShowcaseProps {
  userId: string;
}

export const Showcase: React.FC<ShowcaseProps> = ({ userId }) => {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ShowcaseItem>>({ type: 'project' });

  useEffect(() => {
    fetchShowcase(userId).then(setItems);
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.description) return;

    const itemToAdd = {
        title: newItem.title,
        description: newItem.description,
        type: newItem.type || 'project',
        imageUrl: newItem.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`,
        createdAt: Date.now()
    } as Omit<ShowcaseItem, 'id'>;

    await addShowcaseItem(userId, itemToAdd);
    setItems(await fetchShowcase(userId)); // Refresh
    setShowModal(false);
    setNewItem({ type: 'project', title: '', description: '' });
  };

  const handleDelete = async (id: string) => {
      await deleteShowcaseItem(userId, id);
      setItems(items.filter(i => i.id !== id));
  };

  const getTypeIcon = (type: string) => {
      switch(type) {
          case 'dream': return <Star className="w-4 h-4 text-yellow-400" />;
          case 'goal': return <Target className="w-4 h-4 text-red-400" />;
          default: return <Briefcase className="w-4 h-4 text-blue-400" />;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-white">Showcase</h2>
            <p className="text-gray-400">Your gallery of dreams, goals, and creations.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-300">
             <div className="h-48 overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
             </div>
             <div className="p-5">
                <div className="flex items-center gap-2 mb-2 uppercase text-xs font-bold tracking-wider text-gray-500">
                    {getTypeIcon(item.type)}
                    <span>{item.type}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm line-clamp-3">{item.description}</p>
             </div>
             <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
             >
                 <Trash2Icon className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1e1b4b] border border-white/20 p-8 rounded-2xl w-full max-w-lg relative shadow-2xl">
                <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold text-white mb-6">Add to Showcase</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                            value={newItem.title || ''}
                            onChange={e => setNewItem({...newItem, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Type</label>
                        <select 
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                            value={newItem.type}
                            onChange={(e: any) => setNewItem({...newItem, type: e.target.value})}
                        >
                            <option value="project">Project / Work</option>
                            <option value="dream">Dream</option>
                            <option value="goal">Goal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea 
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white h-32 focus:outline-none focus:border-accent"
                            value={newItem.description || ''}
                            onChange={e => setNewItem({...newItem, description: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-violet-600 transition-colors">
                        Create Item
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

const Trash2Icon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
