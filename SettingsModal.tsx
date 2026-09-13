import { useState, useEffect, FormEvent, useRef } from 'react';
import { User, UserSettings } from '../types';
import { inputClass, btnPrimaryClass, btnSecondaryClass, formatCurrencyInput, parseCurrencyInput } from '../utils';
import { X, Download, Upload } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: Partial<UserSettings>) => Promise<void>;
  user: User;
  onUpdateUsername: (name: string) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave, user, onUpdateUsername }: SettingsModalProps) {
  const [savingsGoal, setSavingsGoal] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSavingsGoal(formatCurrencyInput(settings.savingsGoal));
      setUsername(user.username);
    }
  }, [isOpen, settings.savingsGoal, user.username]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Process update in order to avoid race conditions and handle errors gracefully
    try {
      // First save settings
      await onSave({ savingsGoal: parseCurrencyInput(savingsGoal) || 0 });
      // Then update username (which might fail if already in use)
      const newName = username.trim();
      if (newName && newName !== user.username) {
        await onUpdateUsername(newName);
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Ocorreu um erro ao atualizar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const txs = localStorage.getItem(`budget_app_txs_${user.uid}`);
    const currentSettings = localStorage.getItem(`budget_app_settings_${user.uid}`);
    
    const data = {
      transactions: txs ? JSON.parse(txs) : [],
      settings: currentSettings ? JSON.parse(currentSettings) : { savingsGoal: 0 }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu_orcamento_${user.username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) {
          const txs = data.transactions.map((tx: any) => ({ ...tx, userId: user.uid }));
          localStorage.setItem(`budget_app_txs_${user.uid}`, JSON.stringify(txs));
        }
        if (data.settings) {
          localStorage.setItem(`budget_app_settings_${user.uid}`, JSON.stringify(data.settings));
        }
        alert('Dados importados com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao importar o arquivo. Verifique se é um arquivo de backup válido do aplicativo.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm animate-in fade-in zoom-in-95 rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="settings-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Seu Nome</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="Como quer ser chamado?"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Meta de Poupança (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(formatCurrencyInput(e.target.value))}
                className={inputClass}
                placeholder="0,00"
              />
              <p className="mt-2 text-xs text-slate-500">
                Esta é a sua meta total de poupança. O saldo guardado acumula automaticamente todos os meses.
              </p>
            </div>
          </form>

          <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-800">Aplicativo</h3>
            
            <PWAInstallButton />
            
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Backup de Dados</h3>
              <p className="text-xs text-slate-500 mb-3">
                Exporte seus dados para não perdê-los ou para transferi-los para outro dispositivo (Android ou iOS).
              </p>
              
              <div className="flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors"
                >
                  <Download size={16} />
                  Baixar Dados (Exportar)
                </button>
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <Upload size={16} />
                  Restaurar Dados (Importar)
                </button>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImport}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className={btnSecondaryClass}>
            Cancelar
          </button>
          <button type="submit" form="settings-form" disabled={isSubmitting} className={btnPrimaryClass}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
