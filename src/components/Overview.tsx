import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, LineChart, BarChart3, PieChart } from 'lucide-react';
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
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
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
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
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
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card-balance animate-slide-up hover-lift">
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 glow-blue">
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Current Balance</p>
              <h3 className="text-3xl font-bold gradient-text">{formatCurrency(totalIncome - totalExpense)}</h3>
            </div>
          </div>
        </div>
        
        <div className="stat-card-income animate-slide-up hover-lift" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mr-4 glow-green">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">Total Income</p>
              <h3 className="text-3xl font-bold gradient-text-green">{formatCurrency(totalIncome)}</h3>
            </div>
          </div>
        </div>
        
        <div className="stat-card-expense animate-slide-up hover-lift" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 mr-4 glow-red">
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-300">Total Expenses</p>
              <h3 className="text-3xl font-bold gradient-text-red">{formatCurrency(totalExpense)}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="chart-container-colorful card-purple animate-scale-in">
          <h2 className="text-xl font-bold mb-6 flex items-center text-white">
            <PieChart className="h-6 w-6 mr-3 text-purple-400" />
            Income vs Expenses
          </h2>
          <div className="h-80">
            {transactions.length > 0 ? (
              <Doughnut 
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#e5e7eb',
                        font: {
                          size: 14,
                          weight: 'bold'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      cornerRadius: 12,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = formatCurrency(context.parsed);
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  elements: {
                    arc: {
                      borderWidth: 3,
                      hoverBorderWidth: 4
                    }
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 rounded-full bg-purple-500/20 mb-4">
                  <PieChart className="h-12 w-12 text-purple-400" />
                </div>
                <p className="text-gray-300 mb-3 text-lg">No transaction data available</p>
                <Link
                  to="/dashboard/add-transaction"
                  className="btn-primary"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add your first transaction
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="chart-container-colorful card-blue animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center text-white">
            <BarChart3 className="h-6 w-6 mr-3 text-blue-400" />
            Top Expense Categories
          </h2>
          <div className="h-80">
            {transactions.filter(t => t.type === 'expense').length > 0 ? (
              <Bar
                data={prepareBarChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      cornerRadius: 12,
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      ticks: {
                        color: '#e5e7eb',
                        font: {
                          weight: 'bold'
                        }
                      }
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      ticks: {
                        color: '#e5e7eb',
                        font: {
                          weight: 'bold'
                        },
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  },
                  elements: {
                    bar: {
                      borderRadius: 8,
                      borderSkipped: false,
                    }
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 rounded-full bg-blue-500/20 mb-4">
                  <BarChart3 className="h-12 w-12 text-blue-400" />
                </div>
                <p className="text-gray-300 mb-3 text-lg">No expense data available</p>
                <Link
                  to="/dashboard/add-transaction"
                  className="btn-primary"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add your first expense
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <LineChart className="h-6 w-6 mr-3 text-purple-400" />
            Recent Transactions
          </h2>
          <Link
            to="/dashboard/transactions"
            className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors duration-200"
          >
            View all
          </Link>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-white/10">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="px-6 py-5 flex justify-between items-center hover:bg-white/5 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-2xl mr-4 ${
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
                  <div>
                    <p className="font-semibold text-white text-lg">{transaction.category}</p>
                    <p className="text-sm text-gray-300">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-400">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="p-4 rounded-full bg-purple-500/20 mb-6 mx-auto w-fit">
              <LineChart className="h-12 w-12 text-purple-400" />
            </div>
            <p className="text-gray-300 mb-6 text-lg">No transactions found</p>
            <Link
              to="/dashboard/add-transaction"
              className="btn-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add your first transaction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;