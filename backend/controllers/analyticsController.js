const Expense = require('../models/Expense');
const Income = require('../models/Income');

exports.getCategoryBreakdown = async (req, res) => {
  try {
    // Use the correct user identifier from auth middleware
    const userId = req.user._id;

    // Get expenses grouped by category
    const expensesByCategory = await Expense.aggregate([
      {
        // Match on the correct field name per schema (models/Expense.js)
        $match: { userId: userId }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          amount: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);

    // Get incomes grouped by category
    const incomesByCategory = await Income.aggregate([
      {
        // Match on the correct field name per schema (models/Income.js)
        $match: { userId: userId }
      },
      {
        $group: {
          _id: '$source',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          amount: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);

    res.json({
      expensesByCategory,
      incomesByCategory,
      summary: {
        totalExpenses: expensesByCategory.reduce((sum, item) => sum + item.amount, 0),
        totalIncome: incomesByCategory.reduce((sum, item) => sum + item.amount, 0),
        expenseCategories: expensesByCategory.length,
        incomeCategories: incomesByCategory.length
      }
    });

  } catch (error) {
    console.error('Error in getCategoryBreakdown:', error);
    res.status(500).json({
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};
