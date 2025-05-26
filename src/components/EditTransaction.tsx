import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IndianRupee, ArrowLeft } from 'lucide-react';
import { 
  getTransaction, 
  updateTransaction, 
  getCategories, 
  TransactionFormData 
} from '../services/transactionService';

const EditTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const categories = getCategories();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    category: categories[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        if (!id) return;
        const data = await getTransaction(parseInt(id));
        setFormData({
          amount: data.amount,
          category: data.category,
          description: data.description,
          date: data.date,
          type: data.type,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast.error('Failed to load transaction');
        navigate('/dashboard/transactions');
      }
    };

    fetchTransaction();
  }, [id, navigate]);

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
    
    if (!validateForm() || !id) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateTransaction(parseInt(id), formData);
      toast.success('Transaction updated successfully');
      navigate('/dashboard/transactions');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Transactions
            </button>
            <div className="flex items-center">
              <IndianRupee className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Edit Transaction</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    formData.type === 'income'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    formData.type === 'expense'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-3">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-4 text-lg rounded-xl transition-all duration-200 ${
                    errors.amount
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  } bg-white`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className={`block w-full px-4 py-4 rounded-xl transition-all duration-200 ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                } bg-white`}
                placeholder="What's this transaction for?"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`block w-full px-4 py-4 rounded-xl transition-all duration-200 ${
                  errors.category
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                } bg-white`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Date */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-3">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className={`block w-full px-4 py-4 rounded-xl transition-all duration-200 ${
                  errors.date
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                } bg-white`}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/transactions')}
                className="px-6 py-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 ${
                  formData.type === 'income'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                } hover:shadow-lg transform hover:-translate-y-0.5 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Update Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTransaction;