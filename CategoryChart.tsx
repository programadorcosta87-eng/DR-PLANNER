import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const filteredTxs = transactions.filter(t => t.type === chartType);
  
  if (transactions.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400">
        Nenhuma transação no período.
      </div>
    );
  }

  const categoryTotals = filteredTxs.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setChartType('expense')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${chartType === 'expense' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Despesas
        </button>
        <button
          onClick={() => setChartType('income')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${chartType === 'income' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Rendas
        </button>
      </div>
      
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-slate-400">
          Nenhuma {chartType === 'expense' ? 'despesa' : 'renda'} no período.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
