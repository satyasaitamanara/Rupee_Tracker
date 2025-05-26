import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, LineChart } from 'lucide-react';
import { getTransactions, Transaction } from '../services/transactionService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Overview: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
        
        // Calculate totals
      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setTotalIncome(income);
      setTotalExpense(expense);

        
        // Get recent transactions
        setRecentTransactions(data.slice(0, 5));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Prepare doughnut chart data
  const doughnutData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare bar chart data for category breakdown
  const prepareBarChartData = () => {
    const categories: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (categories[t.category]) {
          categories[t.category] += t.amount;
        } else {
          categories[t.category] = t.amount;
        }
      });
    
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [
        {
          label: 'Expenses by Category',
          data: sortedCategories.map(([, amount]) => amount),
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
          borderWidth: 1,
        },
      ],
    };
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome - totalExpense)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpense)}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-blue-600" />
            Income vs Expenses
          </h2>
          <div className="h-64">
            {transactions.length > 0 ? (
              <Doughnut 
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 mb-2">No transaction data available</p>
                <Link
                  to="/dashboard/add-transaction"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add your first transaction
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-blue-600" />
            Top Expense Categories
          </h2>
          <div className="h-64">
            {transactions.filter(t => t.type === 'expense').length > 0 ? (
              <Bar
                data={prepareBarChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 mb-2">No expense data available</p>
                <Link
                  to="/dashboard/add-transaction"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add your first expense
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link
            to="/dashboard/transactions"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all
          </Link>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-4 ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className={`h-5 w-5 text-green-600`} />
                    ) : (
                      <TrendingDown className={`h-5 w-5 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.category}</p>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}

                  </p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 mb-4">No transactions found</p>
            <Link
              to="/dashboard/add-transaction"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add your first transaction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;