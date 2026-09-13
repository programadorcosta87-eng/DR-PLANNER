import { useState, FormEvent } from 'react';
import { Period } from '../types';
import { btnPrimaryClass, btnSecondaryClass, inputClass } from '../utils';
import { X, Calendar } from 'lucide-react';

interface PeriodSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriod: Period;
  onSave: (period: Period) => void;
}

export default function PeriodSelectorModal({ isOpen, onClose, currentPeriod, onSave }: PeriodSelectorModalProps) {
  const [type, setType] = useState<'month' | 'custom'>(currentPeriod.type);
  
  // States for 'month'
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    currentPeriod.type === 'month' ? currentPeriod.date : new Date()
  );

  // States for 'custom'
  const [startDate, setStartDate] = useState<string>(
    currentPeriod.type === 'custom' 
      ? currentPeriod.start.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    currentPeriod.type === 'custom' 
      ? currentPeriod.end.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (type === 'month') {
      onSave({ type: 'month', date: selectedMonth });
    } else {
      if (!startDate || !endDate) return;
      const start = new Date(startDate);
      // Create local date properly
      const startLocal = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
      const end = new Date(endDate);
      const endLocal = new Date(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
      
      onSave({ type: 'custom', start: startLocal, end: endLocal });
    }
    onClose();
  };

  const handleMonthChange = (offset: number) => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm animate-in fade-in zoom-in-95 rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800">Selecionar Período</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('month')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                type === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => setType('custom')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                type === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Personalizado
            </button>
          </div>

          {type === 'month' ? (
            <div className="flex items-center justify-between py-4">
              <button
                type="button"
                onClick={() => handleMonthChange(-1)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
              >
                &larr;
              </button>
              <div className="text-lg font-medium text-slate-800 capitalize">
                {selectedMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
              <button
                type="button"
                onClick={() => handleMonthChange(1)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
              >
                &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Data Inicial</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Data Final</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onClose} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimaryClass}>
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
