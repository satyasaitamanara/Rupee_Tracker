import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, PlusCircle, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { getTransactions, deleteTransaction, Transaction } from '../services/transactionService';
import { toast } from 'react-toastify';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(transaction => transaction.type === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        transaction =>
          transaction.description.toLowerCase().includes(term) ||
          transaction.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredTransactions(result);
  }, [filter, searchTerm, transactions]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        setIsDeleting(id);
        await deleteTransaction(id);
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success('Transaction deleted successfully');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative inline-block w-full sm:w-auto">
            <div className="flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-purple-400" />
              </div>
              <select
                className="input-field pl-10 pr-10"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
          </div>
          
          <Link
            to="/dashboard/add-transaction"
            className="btn-primary"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add
          </Link>
        </div>
      </div>
      
      {/* Transactions Table/List */}
      <div className="table-enhanced animate-slide-up">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner-large"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <>
            {/* Desktop view */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="table-header">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="table-row">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-2xl ${
                            transaction.type === 'income' 
                              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 glow-green' 
                              : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 glow-red'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-6 w-6 text-green-400" />
                            ) : (
                              <TrendingDown className="h-6 w-6 text-red-400" />
                            )}
                          </div>
                          <span className="ml-3 text-sm text-white font-semibold capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="badge-category">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDate(transaction.date)}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/dashboard/edit-transaction/${transaction.id}`}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-200"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 focus:outline-none"
                            disabled={isDeleting === transaction.id}
                          >
                            {isDeleting === transaction.id ? (
                              <div className="loading-spinner w-5 h-5 border-2"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view */}
            <div className="md:hidden">
              <ul className="divide-y divide-white/10">
                {filteredTransactions.map((transaction) => (
                  <li key={transaction.id} className="px-4 py-5 hover:bg-white/5 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-2xl ${
                          transaction.type === 'income' 
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 glow-green' 
                            : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 glow-red'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-6 w-6 text-green-400" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-white">{transaction.description}</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400">
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className={`text-sm font-bold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/edit-transaction/${transaction.id}`}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-200"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 focus:outline-none"
                            disabled={isDeleting === transaction.id}
                          >
                            {isDeleting === transaction.id ? (
                              <div className="loading-spinner w-5 h-5 border-2"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="p-6 rounded-full bg-purple-500/20 mb-6 mx-auto w-fit glow-purple">
              <PlusCircle className="h-16 w-16 text-purple-400" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">No transactions</h3>
            <p className="mt-2 text-gray-300">
              {searchTerm || filter !== 'all'
                ? 'No transactions match your search criteria.'
                : 'Get started by creating a new transaction.'}
            </p>
            {!searchTerm && filter === 'all' && (
              <div className="mt-8">
                <Link
                  to="/dashboard/add-transaction"
                  className="btn-primary"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Transaction
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;