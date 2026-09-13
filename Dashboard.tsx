import { useState, useMemo } from 'react';
import { User, Transaction, Period } from '../types';
import { useTransactions, useUserSettings } from '../useData';
import { formatCurrency, formatMonthYear, formatDate, cardClass } from '../utils';
import CategoryChart from './CategoryChart';
import TransactionModal from './TransactionModal';
import SettingsModal from './SettingsModal';
import PeriodSelectorModal from './PeriodSelectorModal';
import { LogOut, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Target, TrendingUp, TrendingDown, DollarSign, Settings, Calendar } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUsername: (name: string) => Promise<void>;
}

export default function Dashboard({ user, onLogout, onUpdateUsername }: DashboardProps) {
  const [currentPeriod, setCurrentPeriod] = useState<Period>({ type: 'month', date: new Date() });
  const { transactions, accumulatedSavings, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(user, currentPeriod);
  const { settings, updateSettings } = useUserSettings(user);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | undefined>();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const prevMonth = () => {
    if (currentPeriod.type === 'month') {
      setCurrentPeriod({ type: 'month', date: new Date(currentPeriod.date.getFullYear(), currentPeriod.date.getMonth() - 1, 1) });
    }
  };

  const nextMonth = () => {
    if (currentPeriod.type === 'month') {
      setCurrentPeriod({ type: 'month', date: new Date(currentPeriod.date.getFullYear(), currentPeriod.date.getMonth() + 1, 1) });
    }
  };

  const handleOpenNewTx = () => {
    setTxToEdit(undefined);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (txToEdit) {
      await updateTransaction(txToEdit.id, data);
    } else {
      await addTransaction(data);
    }
    
    // Switch to the month of the new/edited transaction so the user can see it
    const txDate = new Date(data.date);
    if (currentPeriod.type === 'month' && (txDate.getMonth() !== currentPeriod.date.getMonth() || txDate.getFullYear() !== currentPeriod.date.getFullYear())) {
      setCurrentPeriod({ type: 'month', date: new Date(txDate.getFullYear(), txDate.getMonth(), 1) });
    } else if (currentPeriod.type === 'custom') {
      const isWithinCustom = txDate >= currentPeriod.start && txDate <= currentPeriod.end;
      if (!isWithinCustom) {
        setCurrentPeriod({ type: 'month', date: new Date(txDate.getFullYear(), txDate.getMonth(), 1) });
      }
    }
  };

  const handleDeleteTx = async (id: string) => {
    await deleteTransaction(id);
  };

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });
    
    const savingsGoal = settings.savingsGoal || 0;
    const remaining = income - expense;
    
    const savingsProgress = savingsGoal > 0 ? Math.max(0, (accumulatedSavings / savingsGoal) * 100) : 0;

    return { income, expense, remaining, savingsGoal, currentSavings: accumulatedSavings, savingsProgress };
  }, [transactions, settings.savingsGoal, accumulatedSavings]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-blue-900 px-6 pt-4 pb-12 text-white rounded-b-[24px] shadow-sm relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            {currentPeriod.type === 'month' && (
              <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            
            <button onClick={() => setIsPeriodModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-xl transition-colors">
              <Calendar size={18} />
              <h1 className="text-base font-medium capitalize tracking-wide">
                {currentPeriod.type === 'month' ? formatMonthYear(currentPeriod.date) : 'Personalizado'}
              </h1>
            </button>
            
            {currentPeriod.type === 'month' && (
              <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight size={20} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Settings size={18} />
            </button>
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        <div className="text-center space-y-0.5">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">Saldo Remanescente</p>
          <h2 className={`text-2xl font-bold tracking-tight ${summary.remaining < 0 ? 'text-red-300' : 'text-white'}`}>
            {formatCurrency(summary.remaining)}
          </h2>
        </div>
        <p className="text-white text-lg font-semibold mt-4 text-left">Olá, {user.username}</p>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 max-w-4xl mx-auto mt-4 space-y-6 relative z-10">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${cardClass} flex flex-col justify-between`}>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <div className="bg-green-100 p-1.5 rounded-lg text-green-600"><TrendingUp size={16} /></div>
              <span className="text-xs font-medium uppercase tracking-wider">Renda</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(summary.income)}</p>
          </div>
          
          <div className={`${cardClass} flex flex-col justify-between`}>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <div className="bg-red-100 p-1.5 rounded-lg text-red-600"><TrendingDown size={16} /></div>
              <span className="text-xs font-medium uppercase tracking-wider">Despesas</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(summary.expense)}</p>
          </div>

          <div className={`${cardClass} col-span-2 flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><Target size={16} /></div>
                <span className="text-xs font-medium uppercase tracking-wider">Meta de Poupança</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{formatCurrency(summary.savingsGoal)}</span>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>
                  Guardado: {formatCurrency(summary.currentSavings)}
                  {summary.currentSavings > summary.savingsGoal && summary.savingsGoal > 0 && (
                    <span className="text-green-600 font-medium ml-1">
                      (+{formatCurrency(summary.currentSavings - summary.savingsGoal)})
                    </span>
                  )}
                </span>
                <span className="font-medium text-blue-600">
                  {summary.savingsProgress > 100 ? '+100' : summary.savingsProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${summary.currentSavings >= summary.savingsGoal ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, summary.savingsProgress)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Transações por Categoria</h3>
          <CategoryChart transactions={transactions} />
        </div>

        {/* Transactions List */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Transações Recentes</h3>
          </div>
          
          {loading ? (
            <div className="py-8 text-center text-slate-500">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center">
              <DollarSign size={48} className="mb-4 opacity-20" />
              <p>Nenhuma transação neste mês.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(tx => (
                <div key={tx.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 sm:gap-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 overflow-hidden">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl ${
                      tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{tx.category}</p>
                      <p className="text-sm text-slate-500 truncate">{tx.description || 'Sem descrição'} • {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto pl-16 sm:pl-0">
                    <p className={`font-bold truncate ${tx.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEditTx(tx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteTx(tx.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button 
        onClick={handleOpenNewTx}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        onSave={handleSaveTx}
        transactionToEdit={txToEdit}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={updateSettings}
        user={user}
        onUpdateUsername={onUpdateUsername}
      />
      
      <PeriodSelectorModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        currentPeriod={currentPeriod}
        onSave={setCurrentPeriod}
      />
    </div>
  );
}
