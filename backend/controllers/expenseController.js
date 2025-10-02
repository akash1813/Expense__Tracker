const xlsx = require("xlsx");
const Expense = require("../models/Expense");
const { checkAndNotifyBudget } = require("./budgetController");

// Add Expense source
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date),
    });

    await newExpense.save();
    // After saving, check budget and possibly notify
    let budgetStatus = null;
    try {
      budgetStatus = await checkAndNotifyBudget(userId);
    } catch (e) {
      console.error("Budget check failed:", e?.message || e);
    }
    res.status(200).json({ expense: newExpense, budgetStatus });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Expense source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Expense source
exports.deleteExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Download excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
console.log("User ID:", userId);
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    //Prepare data for excel
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "expense");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense_details.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json( {error: error, message: "Server error" } );
  }
};
