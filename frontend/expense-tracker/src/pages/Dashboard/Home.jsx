import { format, subMonths, startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import InfoCard from '../../components/Cards/InfoCard';
import { IoMdCard } from 'react-icons/io';
import { addThousandsSeperator } from '../../utils/helper';
import { FiTarget, FiAlertTriangle } from 'react-icons/fi';
import { LuWalletMinimal, LuHandCoins } from 'react-icons/lu';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

function Home() {
  const { user, loading: authLoading } = useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0,
    recentTransactions: [],
    last30DaysExpenses: { transactions: [] },
    last60DaysIncome: { transactions: [] },
    budget: { amount: 0, isBudgetReached: false, totalExpensesThisMonth: 0 },
    expenses: [],
    income: []
  });
  
  const [loading, setLoading] = useState(true);
  const [openBudgetModal, setOpenBudgetModal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [error, setError] = useState(null);
  
  // Helper function to get date range for last N days
  const getDateRange = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    };
  };

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set date ranges
      const last30Days = getDateRange(30);
      const last60Days = getDateRange(60);
      
      // Fetch all dashboard data in parallel
      const [
        dashboardRes, 
        budgetRes,
        expensesRes, 
        incomeRes
      ] = await Promise.all([
        // Dashboard summary data
        axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            startDate: last30Days.start,
            endDate: last30Days.end
          },
          timeout: 10000
        }).catch(err => {
          console.error('Dashboard API error:', err);
          return { data: { data: { summary: {}, categorySpending: [] } } };
        }),
        
        // Budget data
        axiosInstance.get(API_PATHS.BUDGET.GET, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          timeout: 10000
        }).catch(err => {
          console.error('Budget API error:', err);
          return { data: { budget: {} } };
        }),
        
        // Recent expenses
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            limit: 10,
            sort: '-date',
            startDate: last30Days.start,
            endDate: last30Days.end
          },
          timeout: 10000
        }).catch(err => {
          console.error('Error fetching expenses:', err);
          return { data: [] };
        }),
        
        // Recent income
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            limit: 10,
            sort: '-date',
            startDate: last60Days.start,
            endDate: last60Days.end
          },
          timeout: 10000
        }).catch(err => {
          console.error('Error fetching income:', err);
          return { data: [] };
        })
      ]);
      
      // Extract and log responses for debugging
      console.group('API Responses');
      console.log('Dashboard response:', dashboardRes?.data);
      console.log('Budget response:', budgetRes?.data);
      console.log('Expenses response:', expensesRes);
      console.log('Income response:', incomeRes);
      console.groupEnd();
      
      // Extract data from responses with proper fallbacks
      const dashboardData = dashboardRes?.data?.data || { 
        summary: {}, 
        categorySpending: [], 
        monthlyData: [],
        last60DaysIncome: { transactions: [] }
      };
      const budgetData = budgetRes?.data?.budget || { amount: 0, isBudgetReached: false };
      const recentExpenses = Array.isArray(expensesRes?.data) ? expensesRes.data : [];
      const recentIncome = Array.isArray(incomeRes?.data) ? incomeRes.data : [];
      
      console.log('Dashboard data:', dashboardData);
      
      // Process last 60 days income data
      const last60DaysIncome = Array.isArray(incomeRes?.data) ? incomeRes.data : [];
      
      // Process summary data with fallbacks
      const summary = {
        totalIncome: Number(dashboardData.summary?.totalIncome) || 0,
        totalExpenses: Number(dashboardData.summary?.totalExpenses) || 0,
        ...dashboardData.summary
      };
      
      // Process category spending for expenses
      const categorySpending = Array.isArray(dashboardData.categorySpending) 
        ? dashboardData.categorySpending.map(cat => ({
            id: cat._id || cat.category || `cat-${Math.random().toString(36).substr(2, 9)}`,
            category: cat.category || 'Uncategorized',
            amount: Number(cat.amount) || 0,
            count: Number(cat.count) || 0,
            type: 'expense',
            percentage: Number(cat.percentage) || 0,
            icon: '💰'
          }))
        : [];
      
      // Process monthly income data
      const monthlyData = Array.isArray(dashboardData.monthlyData)
        ? dashboardData.monthlyData.map(month => ({
            id: month.month || `month-${Math.random().toString(36).substr(2, 9)}`,
            date: month.month || new Date().toISOString(),
            monthName: format(new Date(month.month || new Date()), 'MMM yyyy'),
            amount: Number(month.income) || 0,
            spending: Number(month.spending) || 0,
            savings: Number(month.savings) || 0,
            type: 'income',
            icon: '💵'
          }))
        : [];
      
      // Process recent transactions (combined expenses and income)
      const allTransactions = [
        ...(recentExpenses || []).map(expense => ({
          id: expense._id || `expense-${Math.random().toString(36).substr(2, 9)}`,
          name: expense.title || 'Expense',
          amount: Number(expense.amount) || 0,
          type: 'expense',
          date: expense.date || new Date().toISOString(),
          category: expense.category || 'Uncategorized',
          icon: '💰'
        })),
        ...(recentIncome || []).map(income => ({
          id: income._id || `income-${Math.random().toString(36).substr(2, 9)}`,
          name: income.source || 'Income',
          amount: Number(income.amount) || 0,
          type: 'income',
          date: income.date || new Date().toISOString(),
          category: 'Income',
          icon: '💵'
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
       .slice(0, 10); // Get 10 most recent
      
      // Create the final dashboard data object with proper data transformation
      const transformedData = {
        // Summary data with proper number conversion
        totalIncome: Number(summary.totalIncome) || 0,
        totalExpenses: Number(summary.totalExpenses) || 0,
        totalBalance: (Number(summary.totalIncome) || 0) - (Number(summary.totalExpenses) || 0),
        
        // Transactions (already processed)
        recentTransactions: allTransactions,
        
        // Expenses data with proper formatting
        expenses: recentExpenses.map(expense => ({
          ...expense,
          amount: Number(expense.amount) || 0,
          date: expense.date || new Date().toISOString()
        })),
        
        last30DaysExpenses: {
          transactions: categorySpending.map(cat => ({
            id: cat._id || cat.category || `cat-${Math.random().toString(36).substr(2, 9)}`,
            category: cat.category || 'Uncategorized',
            amount: Number(cat.amount) || 0,
            count: Number(cat.count) || 0,
            type: 'expense',
            percentage: Number(cat.percentage) || 0,
            icon: '💰',
            date: new Date().toISOString()
          }))
        },
        
        // Income data with proper formatting
        income: recentIncome.map(income => ({
          ...income,
          id: income._id?.toString() || `income-${Math.random().toString(36).substr(2, 9)}`,
          amount: Number(income.amount) || 0,
          date: income.date || new Date().toISOString(),
          type: 'income',
          icon: '💵'
        })),
        
        last60DaysIncome: {
          total: last60DaysIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
          transactions: last60DaysIncome.map(income => ({
            id: income._id?.toString() || `income-${Math.random().toString(36).substr(2, 9)}`,
            source: income.source || 'Other Income',
            amount: Number(income.amount) || 0,
            date: income.date ? new Date(income.date).toISOString() : new Date().toISOString(),
            type: 'income',
            icon: '💵',
            description: income.description || ''
          }))
        },
        
        // Budget data with proper number conversion
        budget: {
          amount: Number(budgetData.amount) || 0,
          isBudgetReached: Boolean(budgetData.isBudgetReached),
          totalExpensesThisMonth: Number(summary.totalExpenses) || 0
        }
      };
      
      console.log('Processed dashboard data:', transformedData);
      
      setDashboardData(transformedData);
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setError("Failed to load dashboard data. Please try again later.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, fetchDashboardData]);

  // Show loading state while checking auth or loading data
  if (authLoading || loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if failed to load data
  if (error) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleOpenBudget = () => {
    const currentAmount = dashboardData?.budget?.amount ?? '';
    setBudgetAmount(currentAmount === 0 ? '' : String(currentAmount));
    setOpenBudgetModal(true);
  };

  // Handle saving budget
  const handleSaveBudget = async () => {
    if (savingBudget) return;
    
    // Validate input
    const amount = Number(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid non-negative number');
      return;
    }

    setSavingBudget(true);
    try {
      // Update budget on the server
      const response = await axiosInstance.post(API_PATHS.BUDGET.SET, { 
        amount: amount 
      });
      
      // Refetch dashboard data to ensure we have the latest state
      await fetchDashboardData();
      
      // Also update local state immediately for better UX
      setDashboardData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          amount: response.data?.budget?.amount || amount,
          isBudgetReached: response.data?.isBudgetReached || false,
          totalExpensesThisMonth: response.data?.totals?.totalExpenses || 0
        }
      }));
      
      setOpenBudgetModal(false);
      toast.success('Budget updated successfully');
      
    } catch (error) {
      console.error('Failed to update budget:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update budget. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSavingBudget(false);
    }
  };
  const budgetAmountNum = Number(dashboardData?.budget?.amount || 0);
  const spentMTD = Number(dashboardData?.budget?.totalExpensesThisMonth || 0);
  const percentUsed = budgetAmountNum > 0 ? Math.min(100, Math.round((spentMTD / budgetAmountNum) * 100)) : 0;

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='my-5 mx-auto'>
        {/* Budget actions and alert */}
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex items-start md:items-center justify-between gap-4 flex-col md:flex-row'>
            <div className='flex-1'>
              {dashboardData?.budget?.amount > 0 ? (
                <div className='rounded-xl border border-slate-200 bg-white/70 backdrop-blur px-4 py-3 shadow-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-2 text-slate-700'>
                      <FiTarget className='text-primary text-lg' />
                      <span className='font-medium'>This Month's Budget</span>
                    </div>
                    <div className='text-sm text-slate-500'>
                      Budget: <span className='font-semibold text-slate-700'>₹{addThousandsSeperator(dashboardData?.budget?.amount || 0)}</span>
                    </div>
                  </div>

                  <div className='mt-3'>
                    <div className='flex items-center justify-between text-xs mb-1 text-slate-500'>
                      <span>Spent: ₹{addThousandsSeperator(dashboardData?.budget?.totalExpensesThisMonth || 0)}</span>
                      <span>{Math.min(100, Math.round(((dashboardData?.budget?.totalExpensesThisMonth || 0) / (dashboardData?.budget?.amount || 1)) * 100))}% used</span>
                    </div>
                    <div className='h-3 w-full rounded-full bg-slate-100 overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${dashboardData?.budget?.isBudgetReached ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-primary to-indigo-500'}`}
                        style={{ width: `${Math.min(100, Math.round(((dashboardData?.budget?.totalExpensesThisMonth || 0) / (dashboardData?.budget?.amount || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm'>
                  Set a monthly budget to track your spending progress throughout the month.
                </div>
              )}
            </div>

            <button
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.99] transition'
              onClick={handleOpenBudget}
            >
              <FiTarget className='text-lg' />
              <span className='font-semibold'>Set Monthly Budget</span>
            </button>
          </div>

          {dashboardData?.budget?.isBudgetReached && (
            <div role='alert' className='w-full px-4 py-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 text-red-700 border border-red-200 flex items-start gap-3'>
              <FiAlertTriangle className='text-red-500 text-xl mt-0.5' />
              <div className='text-sm'>
                <div className='font-semibold'>Budget limit reached</div>
                <div>
                  Budget: ₹{addThousandsSeperator(dashboardData?.budget?.amount || 0)} · Spent: ₹{addThousandsSeperator(dashboardData?.budget?.totalExpensesThisMonth || 0)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeperator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeperator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={addThousandsSeperator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
            onSeeMore={() => navigate("/expense")}
          />  

          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpenses || 0}
          />

          <ExpenseTransactions 
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={(path) => navigate(path || "/expense")}
          />

          <Last30DaysExpenses
            data={dashboardData?.last30DaysExpenses?.transactions || []}
          />

          <RecentIncomeWithChart
            data={dashboardData?.last60DaysIncome?.transactions || []}
            totalIncome={dashboardData?.last60DaysIncome?.total || 0}
          />

          <RecentIncome 
            transactions={(dashboardData?.last60DaysIncome?.transactions || []).slice(0, 5)}
            onSeeMore={() => navigate("/income")}
          />
        </div>

        <Modal
          isOpen={openBudgetModal}
          onClose={() => setOpenBudgetModal(false)}
          title="Set Monthly Budget"
        >
          <div className='space-y-5'>
            <div>
              <p className='text-sm text-slate-600'>Set a monthly budget to get notified and track your month-to-date spending.</p>
            </div>
            <div>
              <label className='block text-sm mb-1 font-medium text-slate-700'>Amount (₹)</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>₹</span>
                <input
                  type='number'
                  className='w-full border border-slate-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-lg pl-8 pr-3 py-2 outline-none transition bg-white'
                  placeholder='Enter amount'
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  min="0"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveBudget(); }}
                />
              </div>
              {budgetAmount !== '' && Number(budgetAmount) > 0 && (
                <div className='text-xs text-slate-500 mt-1'>This will apply to the current month only.</div>
              )}
            </div>
            <div className='flex justify-end gap-3'>
              <button
                className='px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50'
                onClick={() => setOpenBudgetModal(false)}
              >
                Cancel
              </button>
              <button
                className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white shadow hover:shadow-md disabled:opacity-60'
                onClick={handleSaveBudget}
                disabled={savingBudget}
              >
                <FiTarget /> {savingBudget ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </Modal>

      </div>

    </DashboardLayout>
  )
}

export default Home;