import api from './api';

export interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface TransactionFormData {
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/api/transactions');
  return response.data;
};

export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await api.get(`/api/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (transaction: TransactionFormData): Promise<Transaction> => {
  const response = await api.post('/api/transactions', transaction);
  return response.data;
};

export const updateTransaction = async (id: number, transaction: TransactionFormData): Promise<Transaction> => {
  const response = await api.put(`/api/transactions/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await api.delete(`/api/transactions/${id}`);
};

export const getCategories = (): string[] => {
  return [
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Savings',
    'Personal',
    'Entertainment',
    'Education',
    'Clothing',
    'Gifts',
    'Income',
    'Other'
  ];
};