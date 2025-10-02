const { Types } = require("mongoose");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const MonthlyBudget = require("../models/MonthlyBudget");

// Get dashboard data with optional date range filtering
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));
        
        const { startDate, endDate } = req.query;
        const query = {
            userId: userObjectId,
        };
        
        // Add date range filter if provided
        if (startDate && endDate) {
            query.date = { 
                $gte: new Date(startDate), 
                $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) // Include the entire end date
            };
        }

        // Fetch data in parallel for better performance
        const [
            totalIncome,
            totalExpense,
            last60DaysIncome,
            last30DaysExpense,
            recentIncome,
            recentExpense,
            categorySpending
        ] = await Promise.all([
            // Total income
            Income.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            
            // Total expense
            Expense.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            
            // Last 60 days income with source and amount
            (async () => {
                const sixtyDaysAgo = new Date(Date.now() - 60*24*60*60*1000);
                console.log('Querying income records after:', sixtyDaysAgo);
                console.log('For user ID:', userObjectId);
                
                try {
                    const result = await Income.aggregate([
                        {
                            $match: {
                                userId: userObjectId,
                                date: { $gte: sixtyDaysAgo }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                source: 1,
                                amount: 1,
                                date: 1,
                                description: 1
                            }
                        },
                        { $sort: { date: -1 } }
                    ]);
                    
                    console.log('Found income records:', result.length);
                    if (result.length > 0) {
                        console.log('Sample record:', {
                            _id: result[0]._id,
                            source: result[0].source,
                            amount: result[0].amount,
                            date: result[0].date
                        });
                    }
                    return result;
                } catch (error) {
                    console.error('Error querying income records:', error);
                    return [];
                }
            })(),
            
            // Last 30 days expense
            Expense.aggregate([
                { 
                    $match: {
                        userId: userObjectId,
                        date: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            
            // Recent income transactions with date filtering
            Income.find({
                userId: userObjectId,
                ...(startDate && endDate ? {
                    date: { 
                        $gte: new Date(startDate), 
                        $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
                    }
                } : {})
            })
                .sort({ date: -1 })
                .limit(10) // Match the limit used in the frontend
                .lean(),
                
            // Recent expense transactions
            Expense.find({ userId: userObjectId })
                .sort({ date: -1 })
                .limit(5)
                .lean(),
                
            // Category-wise spending
            Expense.aggregate([
                { $match: query },
                { 
                    $group: {
                        _id: "$category",
                        total: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { total: -1 } },
                { $limit: 5 }
            ])
        ]);

        // Combine and sort recent transactions
        const recentTransactions = [...recentIncome, ...recentExpense]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        // Calculate budget information
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        // Get budget for current month
        const budgetDoc = await MonthlyBudget.findOne({
            userId: userObjectId,
            month,
            year
        });
        
        // Calculate total expenses for current month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        
        const monthExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        const totalExpensesThisMonth = monthExpenses[0]?.total || 0;
        const budgetAmount = budgetDoc?.amount || 0;
        const isBudgetReached = budgetAmount > 0 && totalExpensesThisMonth >= budgetAmount;

        // Format the response to match frontend expectations
        const responseData = {
            success: true,
            data: {
                summary: {
                    totalIncome: totalIncome[0]?.total || 0,
                    totalExpenses: totalExpense[0]?.total || 0,
                    totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0)
                },
                categorySpending: categorySpending.map(cat => ({
                    _id: cat._id,
                    category: cat._id,
                    amount: cat.total,
                    count: cat.count,
                    percentage: 0 // Will be calculated on frontend if needed
                })),
                monthlyData: [
                    {
                        month: new Date().toISOString(),
                        income: totalIncome[0]?.total || 0,
                        spending: totalExpense[0]?.total || 0,
                        savings: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0)
                    }
                ],
                recentTransactions: recentTransactions || [],
                recentExpenses: recentExpense || [],
                recentIncome: recentIncome.map(income => ({
                    ...income,
                    type: 'income',
                    category: 'Income',
                    icon: '💵',
                    name: income.source || 'Income',
                    amount: Number(income.amount) || 0,
                    date: income.date ? new Date(income.date).toISOString() : new Date().toISOString()
                })) || [],
                last60DaysIncome: {
                    total: last60DaysIncome.reduce((sum, income) => sum + (Number(income.amount) || 0), 0),
                    transactions: last60DaysIncome.map(income => ({
                        ...income,
                        _id: income._id.toString(),
                        type: 'income',
                        category: 'Income',
                        icon: '💵',
                        source: income.source || 'Other Income',
                        amount: Number(income.amount) || 0,
                        date: income.date ? new Date(income.date).toISOString() : new Date().toISOString(),
                        description: income.description || ''
                    }))
                }
            },
            budget: {
                amount: budgetAmount,
                isBudgetReached,
                totalExpensesThisMonth,
                year,
                month,
                totalExpenses: totalExpense[0]?.total || 0,
                totalIncome: totalIncome[0]?.total || 0
            }
        };

        console.log('Dashboard response summary:', {
            summary: responseData.data.summary,
            budget: responseData.budget,
            incomeCount: responseData.data.last60DaysIncome?.transactions?.length || 0,
            expenseCount: responseData.data.recentExpenses?.length || 0
        });
        res.json(responseData);
    } catch (error) {
        console.error('Error in dashboard controller:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data',
            error: error.message
        });
    }
};

module.exports = { getDashboardData };