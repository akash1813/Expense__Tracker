import React, { useState } from 'react';
import { Input } from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';
import ReceiptScanner from '../ReceiptScanner';

const AddExpenseForm = ({ onAddExpense }) => {
  const [expense, setExpense] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  })

  const handleChange = (key, value) =>
    setExpense((prevExpense) => ({ ...prevExpense, [key]: value }));

  const handleReceiptScan = (data) => {
    if (data.amount) {
      setExpense(prev => ({
        ...prev,
        amount: data.amount.toString(),
        ...(data.date && { date: data.date }),
        ...(data.category && { category: data.category })
      }));
    }
  };

  return (
    <div className='space-y-4 sm:space-y-5'>
      <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
        <h3 className='text-sm font-medium text-gray-700 mb-2'>Scan Receipt</h3>
        <ReceiptScanner onScanComplete={handleReceiptScan} />
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
        <div className='text-sm text-slate-600'>Pick an icon for this expense</div>
        <EmojiPickerPopup
          icon={expense.icon}
          onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
        />
      </div>

      <div className='grid gap-4 sm:gap-5'>
        <Input
          value={expense.category}
          onChange={({ target }) => handleChange("category", target.value)}
          label="Category"
          placeholder="Food, Fuel, etc."
          type="text"
          className="w-full"
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
          <Input
            value={expense.amount}
            onChange={({ target }) => handleChange("amount", target.value)}
            label="Amount"
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            className="w-full"
          />

          <Input
            value={expense.date}
            onChange={({ target }) => handleChange("date", target.value)}
            label="Date"
            type="date"
            className="w-full"
          />
        </div>
      </div>

      <div className='pt-2'>
        <button
          type="button"
          className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white text-sm sm:text-base font-medium shadow hover:shadow-md active:scale-[0.98] transition-transform duration-100'
          onClick={() => onAddExpense(expense)}
        >
          Add Expense
        </button>
      </div>

    </div>
  )
}

export default AddExpenseForm