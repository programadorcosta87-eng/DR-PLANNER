export interface User {
  uid: string;
  username: string;
}

export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Alimentação' 
  | 'Transporte' 
  | 'Moradia' 
  | 'Lazer' 
  | 'Saúde' 
  | 'Educação' 
  | 'Salário'
  | 'Rendimento'
  | 'Outros';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: number; // Storing as Unix timestamp for easier sorting/filtering
}

export interface UserSettings {
  savingsGoal: number;
}

export type Period = 
  | { type: 'month'; date: Date }
  | { type: 'custom'; start: Date; end: Date };
