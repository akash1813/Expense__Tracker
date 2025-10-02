const express = require('express');
const { protect } = require("../middleware/authMiddleware");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

const router = express.Router();

// Get dashboard data with optional date range filtering
router.get("/", protect, async (req, res) => {
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
            
            // Last 60 days income
            Income.aggregate([
                { 
                    $match: {
                        userId: userObjectId,
                        date: { $gte: new Date(Date.now() - 60*24*60*60*1000) }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            
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
            
            // Recent income transactions
            Income.find({ userId: userObjectId })
                .sort({ date: -1 })
                .limit(5)
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

        // Calculate savings and savings rate
        const totalIncomeAmount = totalIncome[0]?.total || 0;
        const totalExpenseAmount = totalExpense[0]?.total || 0;
        const savings = totalIncomeAmount - totalExpenseAmount;
        const savingsRate = totalIncomeAmount > 0 ? (savings / totalIncomeAmount) * 100 : 0;

        // Prepare response
        res.json({
            success: true,
            data: {
                summary: {
                    totalIncome: totalIncomeAmount,
                    totalExpenses: totalExpenseAmount,
                    savings,
                    savingsRate,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null
                },
                recentTransactions,
                topCategories: categorySpending,
                monthlyData: [], // This would be populated with actual monthly data
                categorySpending: categorySpending,
                patterns: {},
                anomalies: {},
                tips: []
            }
        });
        
    } catch (error) {
        console.error('Error in dashboard controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

module.exports = router;
