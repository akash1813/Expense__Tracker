import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/Layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { addThousandsSeperator } from '../../utils/helper';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiDollarSign } from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300'];

function Analytics() {
  useUserAuth();

  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchAnalyticsData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.CATEGORY_BREAKDOWN}`
      );

      if (response.data) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAnalyticsData();
  }, []);


  const filteredExpenseData = selectedCategory === 'all'
    ? analyticsData?.expensesByCategory || []
    : analyticsData?.expensesByCategory?.filter(item => item.category === selectedCategory) || [];

  const filteredIncomeData = selectedCategory === 'all'
    ? analyticsData?.incomesByCategory || []
    : analyticsData?.incomesByCategory?.filter(item => item.category === selectedCategory) || [];

  const totalExpenses = filteredExpenseData.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = filteredIncomeData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardLayout activeMenu="Analytics">
      <div className='my-5 mx-auto max-w-7xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Financial Analytics</h1>
          <p className='text-gray-600'>Track your expenses and income patterns with AI-powered insights</p>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Expenses</p>
                <p className='text-2xl font-bold text-red-600'>₹{addThousandsSeperator(totalExpenses)}</p>
              </div>
              <FiTrendingDown className='h-8 w-8 text-red-500' />
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Income</p>
                <p className='text-2xl font-bold text-green-600'>₹{addThousandsSeperator(totalIncome)}</p>
              </div>
              <FiTrendingUp className='h-8 w-8 text-green-500' />
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Net Savings</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{addThousandsSeperator(totalIncome - totalExpenses)}
                </p>
              </div>
              <FiTarget className='h-8 w-8 text-blue-500' />
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Savings Rate</p>
                <p className='text-2xl font-bold text-purple-600'>
                  {totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%
                </p>
              </div>
              <FiDollarSign className='h-8 w-8 text-purple-500' />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8'>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {[...new Set([...(analyticsData?.expensesByCategory || []), ...(analyticsData?.incomesByCategory || [])]
              .map(item => item.category))]
              .slice(0, 8)
              .map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))
            }
          </div>
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Expense Breakdown */}
          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              {selectedCategory === 'all' ? 'Expense Breakdown' : `${selectedCategory} Expenses`}
            </h3>
            {filteredExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredExpenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {filteredExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${addThousandsSeperator(value)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-64 text-gray-500'>
                No expense data available
              </div>
            )}
          </div>

          {/* Income Breakdown */}
          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              {selectedCategory === 'all' ? 'Income Breakdown' : `${selectedCategory} Income`}
            </h3>
            {filteredIncomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `₹${addThousandsSeperator(value)}`} />
                  <Tooltip formatter={(value) => `₹${addThousandsSeperator(value)}`} />
                  <Bar dataKey="amount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-64 text-gray-500'>
                No income data available
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Analytics
