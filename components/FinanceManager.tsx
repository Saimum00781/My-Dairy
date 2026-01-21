import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, PieChart as ChartIcon, Plus } from 'lucide-react';
import { fetchExpenses, addExpense } from '../services';
import { Expense } from '../types';

interface FinanceManagerProps {
  userId: string;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({ userId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchExpenses(userId).then(setExpenses);
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    const val = parseFloat(amount);
    if (isNaN(val)) return;

    const newEx = {
        amount: val,
        category,
        date: new Date().toISOString().split('T')[0]
    };
    await addExpense(userId, newEx);
    setExpenses([ { ...newEx, id: Date.now().toString() }, ...expenses ]);
    setAmount('');
    setCategory('');
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Simple week calculation (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    let weekTotal = 0;
    let monthTotal = 0;

    expenses.forEach(ex => {
        const d = new Date(ex.date);
        if (d >= oneWeekAgo) weekTotal += ex.amount;
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthTotal += ex.amount;
    });

    return { weekTotal, monthTotal };
  }, [expenses]);

  // Tiny Bar Chart Logic
  const chartBars = useMemo(() => {
      // Group last 5 expenses by category for a mini chart
      const groups: Record<string, number> = {};
      expenses.slice(0, 10).forEach(e => {
          groups[e.category] = (groups[e.category] || 0) + e.amount;
      });
      const entries = Object.entries(groups).sort((a,b) => b[1] - a[1]).slice(0, 4);
      const max = Math.max(...entries.map(e => e[1]), 1);
      return entries.map(([cat, val]) => ({ cat, val, pct: (val / max) * 100 }));
  }, [expenses]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Cash Flow
        </h2>
        <div className="text-right">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">This Month</div>
            <div className="text-2xl font-bold text-white">${stats.monthTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
          <input 
            type="number" 
            placeholder="Amount" 
            className="w-24 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Category (e.g. Food)" 
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg">
              <Plus className="w-5 h-5" />
          </button>
      </div>

      {/* Mini Chart */}
      <div className="flex-1 flex items-end justify-between gap-2 min-h-[100px] border-b border-white/10 pb-4 mb-4">
        {chartBars.length === 0 && <span className="w-full text-center text-gray-500 text-sm">No data yet</span>}
        {chartBars.map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-emerald-500/10 rounded-t-lg relative h-32 flex items-end justify-center overflow-hidden">
                    <div 
                        className="w-full bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-400" 
                        style={{ height: `${bar.pct}%` }}
                    />
                </div>
                <span className="text-xs text-gray-400 truncate w-full text-center">{bar.cat}</span>
            </div>
        ))}
      </div>

      {/* Recent List */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar max-h-[150px]">
          {expenses.map(ex => (
              <div key={ex.id} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded">
                  <span className="text-gray-300">{ex.category}</span>
                  <span className="text-white font-mono">${ex.amount}</span>
              </div>
          ))}
      </div>
    </div>
  );
};
