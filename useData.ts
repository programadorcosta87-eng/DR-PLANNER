import { useState, useEffect } from 'react';
import { Transaction, UserSettings, User, Period } from './types';

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function useTransactions(user: User | null, period: Period) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accumulatedSavings, setAccumulatedSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to load transactions from localStorage
  const loadTransactions = () => {
    if (!user) return [];
    try {
      const stored = localStorage.getItem(`budget_app_txs_${user.uid}`);
      return stored ? JSON.parse(stored) as Transaction[] : [];
    } catch {
      return [];
    }
  };

  const calculateAccumulated = (allTxs: Transaction[], endOfPeriod: number) => {
    const pastTxs = allTxs.filter(tx => tx.date <= endOfPeriod);
    return pastTxs.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  };

  const getPeriodBounds = () => {
    if (period.type === 'month') {
      const start = new Date(period.date.getFullYear(), period.date.getMonth(), 1).getTime();
      const end = new Date(period.date.getFullYear(), period.date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      return { start, end };
    } else {
      const start = new Date(period.start.getFullYear(), period.start.getMonth(), period.start.getDate(), 0, 0, 0, 0).getTime();
      const end = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate(), 23, 59, 59, 999).getTime();
      return { start, end };
    }
  };

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccumulatedSavings(0);
      setLoading(false);
      return;
    }

    const { start, end } = getPeriodBounds();
    const allTxs = loadTransactions();
    
    setAccumulatedSavings(calculateAccumulated(allTxs, end));

    const filtered = allTxs
      .filter(tx => tx.date >= start && tx.date <= end)
      .sort((a, b) => b.date - a.date);
    setTransactions(filtered);
    setLoading(false);
  }, [user, period.type === 'month' ? period.date.getTime() : `${period.start.getTime()}-${period.end.getTime()}`]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    const allTxs = loadTransactions();
    const newTx: Transaction = {
      ...data,
      id: generateId(),
      userId: user.uid
    };

    const newAllTxs = [...allTxs, newTx];
    localStorage.setItem(`budget_app_txs_${user.uid}`, JSON.stringify(newAllTxs));
    
    const { start, end } = getPeriodBounds();
    setAccumulatedSavings(calculateAccumulated(newAllTxs, end));

    // Optimistic update if it belongs to current view
    if (newTx.date >= start && newTx.date <= end) {
      setTransactions(prev => [newTx, ...prev].sort((a, b) => b.date - a.date));
    }
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!user) return;
    const allTxs = loadTransactions();
    const index = allTxs.findIndex(t => t.id === id);
    if (index === -1) return;
    
    allTxs[index] = { ...allTxs[index], ...data };
    localStorage.setItem(`budget_app_txs_${user.uid}`, JSON.stringify(allTxs));
    
    const { start, end } = getPeriodBounds();
    setAccumulatedSavings(calculateAccumulated(allTxs, end));

    // Optimistic update
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t).sort((a, b) => b.date - a.date));
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const allTxs = loadTransactions();
    const newAllTxs = allTxs.filter(t => t.id !== id);
    localStorage.setItem(`budget_app_txs_${user.uid}`, JSON.stringify(newAllTxs));
    
    const { start, end } = getPeriodBounds();
    setAccumulatedSavings(calculateAccumulated(newAllTxs, end));

    // Optimistic update
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, accumulatedSavings, loading, addTransaction, updateTransaction, deleteTransaction };
}

export function useUserSettings(user: User | null) {
  const [settings, setSettings] = useState<UserSettings>({ savingsGoal: 0 });

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`budget_app_settings_${user.uid}`);
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        const defaultSettings = { savingsGoal: 0 };
        localStorage.setItem(`budget_app_settings_${user.uid}`, JSON.stringify(defaultSettings));
        setSettings(defaultSettings);
      }
    } catch {
      // Fallback
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const updated = { ...settings, ...newSettings };
    localStorage.setItem(`budget_app_settings_${user.uid}`, JSON.stringify(updated));
    setSettings(updated);
  };

  return { settings, updateSettings };
}
