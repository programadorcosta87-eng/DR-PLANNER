export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: number | Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatMonthYear = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const parts = formatter.formatToParts(date);
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

export const formatCurrencyInput = (value: string | number) => {
  if (value === '' || value === undefined || value === null) return '';
  // Se for número, converte para string com 2 casas decimais para capturar os centavos corretamente antes de remover pontuações
  const stringValue = typeof value === 'number' ? value.toFixed(2) : value;
  const digits = stringValue.replace(/\D/g, '');
  if (!digits) return '';
  const numericValue = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

export const parseCurrencyInput = (value: string) => {
  if (!value) return 0;
  const digits = value.replace(/\D/g, '');
  return parseInt(digits, 10) / 100;
};

// Common Tailwind classes
export const cardClass = "bg-white rounded-2xl shadow-sm border border-slate-100 p-5";
export const inputClass = "w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";
export const btnPrimaryClass = "w-full rounded-xl bg-blue-600 px-4 py-3.5 font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30";
export const btnSecondaryClass = "w-full rounded-xl bg-slate-100 px-4 py-3.5 font-medium text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30";
