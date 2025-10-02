import React, { useState } from 'react';
import { Input } from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';
import ReceiptScanner from '../ReceiptScanner';

const AddIncomeForm = ({ onAddIncome }) => {
    const [income, setIncome] = useState({
        source: "",
        amount: "",
        date: "",
        icon: "",
    })

    const handleChange = (key, value) =>
        setIncome((prevIncome) => ({ ...prevIncome, [key]: value }));

    const handleReceiptScan = (data) => {
        if (data.amount) {
            setIncome(prev => ({
                ...prev,
                amount: data.amount.toString(),
                ...(data.date && { date: data.date }),
                ...(data.merchant && { source: data.merchant })
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
                <div className='text-sm text-slate-600'>Pick an icon for this income</div>
                <EmojiPickerPopup
                    icon={income.icon}
                    onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
                />
            </div>

            <div className='grid gap-4 sm:gap-5'>
                <Input
                    value={income.source}
                    onChange={({ target }) => handleChange("source", target.value)}
                    label="Income Source"
                    placeholder="Freelance, Salary, etc."
                    type="text"
                    className="w-full"
                />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
                    <Input
                        value={income.amount}
                        onChange={({ target }) => handleChange("amount", target.value)}
                        label="Amount"
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full"
                    />

                    <Input
                        value={income.date}
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
                    onClick={() => onAddIncome(income)}
                >
                    Add Income
                </button>
            </div>

        </div>
    )
}

export default AddIncomeForm