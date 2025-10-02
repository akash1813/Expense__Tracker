const MonthlyBudget = require('../models/MonthlyBudget');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Income = require('../models/Income');
const nodemailer = require('nodemailer');

// Local transporter for budget alerts (keeps existing email flow intact)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper to get current year/month
const getYearMonth = (date = new Date()) => ({ year: date.getFullYear(), month: date.getMonth() });

// Compose and send a budget alert email
const sendBudgetAlertEmail = async (user, { totalExpenses, totalIncome, budgetAmount }) => {
  const monthName = new Date().toLocaleString('default', { month: 'long' });
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #34495e;">
      <h2 style="color: #e74c3c;">Budget Limit Reached</h2>
      <p>Hi ${user.fullName || user.email},</p>
      <p>You have reached your monthly budget limit for <strong>${monthName}</strong>.</p>
      <ul>
        <li><strong>Budget:</strong> ₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(budgetAmount)}</li>
        <li><strong>Total Expenses (month-to-date):</strong> ₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(totalExpenses)}</li>
        <li><strong>Total Income (month-to-date):</strong> ₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(totalIncome)}</li>
      </ul>
      <p>Please review your spending in the app.</p>
      <p style="color:#888; font-size:12px;">This is an automated notification from Expense Tracker.</p>
    </div>
  `;

  const to = process.env.NODE_ENV === 'development' ? user.email : (process.env.VERIFIED_EMAIL || user.email);
  const msg = {
    to,
    from: process.env.SENDER_EMAIL || 'no-reply@expense-tracker.com',
    subject: `Budget Alert - ${monthName}`,
    html,
  };

  await transporter.sendMail(msg);
};

// Calculate current month's totals
const getCurrentMonthAggregates = async (userId) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const expenses = await Expense.find({ userId, date: { $gte: start, $lt: end } });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Optional: income total month-to-date for context
  const incomes = await Income.find({ userId, date: { $gte: start, $lt: end } });
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return { totalExpenses, totalIncome };
};

// Public: Set current month's budget
exports.setMonthlyBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (amount === undefined || isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const { year, month } = getYearMonth();

    const budget = await MonthlyBudget.findOneAndUpdate(
      { userId, year, month },
      { $set: { amount: Number(amount) }, $setOnInsert: { notified: false, userId, year, month } },
      { upsert: true, new: true }
    );

    // If the new amount is below already spent, we may need to notify immediately
    const { totalExpenses, totalIncome } = await getCurrentMonthAggregates(userId);
    let isBudgetReached = false;
    if (budget.amount > 0 && totalExpenses >= budget.amount) {
      isBudgetReached = true;
      if (!budget.notified) {
        const user = await User.findById(userId);
        await sendBudgetAlertEmail(user, { totalExpenses, totalIncome, budgetAmount: budget.amount });
        budget.notified = true;
        await budget.save();
      }
    } else if (totalExpenses < budget.amount && budget.notified) {
      // Reset notification flag if user adjusts to a higher budget
      budget.notified = false;
      await budget.save();
    }

    const responseData = {
      success: true,
      message: 'Monthly budget set successfully',
      budget: { 
        amount: budget.amount, 
        year: budget.year, 
        month: budget.month, 
        notified: budget.notified,
        isBudgetReached,
        totalExpensesThisMonth: totalExpenses
      },
      totals: { 
        totalExpenses, 
        totalIncome 
      },
      isBudgetReached
    };
    
    console.log('Budget set response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Error setting monthly budget', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public: Get current month's budget and status
exports.getMonthlyBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = getYearMonth();
    const budget = await MonthlyBudget.findOne({ userId, year, month });
    const { totalExpenses, totalIncome } = await getCurrentMonthAggregates(userId);

    const amount = budget?.amount || 0;
    const isBudgetReached = amount > 0 && totalExpenses >= amount;

    const responseData = {
      success: true,
      budget: { 
        amount, 
        year, 
        month,
        isBudgetReached,
        totalExpensesThisMonth: totalExpenses
      },
      totals: { 
        totalExpenses, 
        totalIncome 
      },
      isBudgetReached
    };
    
    console.log('Budget get response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching monthly budget', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Internal: Check after expense creation
exports.checkAndNotifyBudget = async (userId) => {
  const { year, month } = getYearMonth();
  const budget = await MonthlyBudget.findOne({ userId, year, month });
  if (!budget || !budget.amount || budget.amount <= 0) return { hasBudget: false, isBudgetReached: false };

  const { totalExpenses, totalIncome } = await getCurrentMonthAggregates(userId);
  if (totalExpenses >= budget.amount) {
    if (!budget.notified) {
      const user = await User.findById(userId);
      await sendBudgetAlertEmail(user, { totalExpenses, totalIncome, budgetAmount: budget.amount });
      budget.notified = true;
      await budget.save();
    }
    return { hasBudget: true, isBudgetReached: true, totalExpenses, totalIncome, budgetAmount: budget.amount };
  }
  return { hasBudget: true, isBudgetReached: false, totalExpenses, totalIncome, budgetAmount: budget.amount };
};
