import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createTransaction, getCategories, TransactionFormData } from '../services/transactionService';
import { IndianRupee, Plus, ArrowLeft } from 'lucide-react';

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const categories = getCategories();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    category: categories[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTransaction(formData);
      toast.success('Transaction added successfully');
      navigate('/dashboard/transactions');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="card">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Transactions
            </button>
            <div className="flex items-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 glow-purple mr-3">
                <IndianRupee className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold gradient-text">New Transaction</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="card-colorful card-purple p-6">
              <label className="block text-sm font-semibold text-white mb-4">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    formData.type === 'income'
                      ? 'btn-success'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                >
                  <Plus className={`w-5 h-5 mr-2 ${formData.type === 'income' ? 'text-white' : 'text-gray-400'}`} />
                  Income
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    formData.type === 'expense'
                      ? 'btn-danger'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                >
                  <Plus className={`w-5 h-5 mr-2 ${formData.type === 'expense' ? 'text-white' : 'text-gray-400'}`} />
                  Expense
                </button>
              </div>
            </div>
            
            {/* Amount */}
            <div className="card-colorful card-blue p-6">
              <label htmlFor="amount" className="block text-sm font-semibold text-white mb-4">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  className={`input-field pl-12 py-4 text-lg ${
                    errors.amount
                      ? 'border-red-400/50 focus:ring-red-400 focus:border-red-400'
                      : ''
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.amount}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="card-colorful card-green p-6">
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-4">
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className={`input-field py-4 ${
                  errors.description
                    ? 'border-red-400/50 focus:ring-red-400 focus:border-red-400'
                    : ''
                }`}
                placeholder="What's this transaction for?"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.description}</p>
              )}
            </div>
            
            {/* Category */}
            <div className="card-colorful card-orange p-6">
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-4">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field py-4 ${
                  errors.category
                    ? 'border-red-400/50 focus:ring-red-400 focus:border-red-400'
                    : ''
                }`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.category}</p>
              )}
            </div>
            
            {/* Date */}
            <div className="card-colorful card-purple p-6">
              <label htmlFor="date" className="block text-sm font-semibold text-white mb-4">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className={`input-field py-4 ${
                  errors.date
                    ? 'border-red-400/50 focus:ring-red-400 focus:border-red-400'
                    : ''
                }`}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.date}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/transactions')}
                className="px-6 py-4 border border-white/20 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 ${
                  formData.type === 'income'
                    ? 'btn-success'
                    : 'btn-primary'
                } ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-5 h-5 border-2 mr-3"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;