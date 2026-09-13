import { useState, useEffect, FormEvent } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { inputClass, btnPrimaryClass, btnSecondaryClass, formatCurrencyInput, parseCurrencyInput } from '../utils';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  transactionToEdit?: Transaction;
}

const CATEGORIES: Category[] = [
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Salário', 'Rendimento', 'Outros'
];

export default function TransactionModal({ isOpen, onClose, onSave, transactionToEdit }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Outros');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(formatCurrencyInput(transactionToEdit.amount));
        setCategory(transactionToEdit.category);
        setDescription(transactionToEdit.description);
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
      } else {
        setType('expense');
        setAmount('');
        setCategory('Outros');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, transactionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    
    setIsSubmitting(true);
    try {
      // Split date into parts and create a date object reflecting local time
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      
      await onSave({
        type,
        amount: parseCurrencyInput(amount),
        category,
        description,
        date: localDate.getTime()
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:fade-in rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800">
            {transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setType('expense')}
            >
              Despesa
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${type === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setType('income')}
            >
              Renda
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Valor (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                className={`${inputClass} text-2xl font-semibold`}
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={inputClass}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Descrição (opcional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                placeholder="Ex: Almoço de domingo"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onClose} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={btnPrimaryClass}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
