import React from 'react';
import CustomPieChart from '../Charts/CustomPieChart';
import { addThousandsSeperator } from '../../utils/helper';

const COLORS = ["#875CF5", "#FA2C37", "#FF6900"];

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
    const balanceData = [
        { name: "Total Balance", amount: totalBalance },
        { name: "Total Expenses", amount: totalExpense },
        { name: "Total Income", amount: totalIncome },
    ];

    return (
        <div className='card'>
            <div className='flex items-center justify-between mb-4'>
                <h5 className='text-lg font-medium'>Finance Overview</h5>
            </div>

            <div className='relative w-full' style={{ aspectRatio: '1', minHeight: '250px', maxHeight: '400px' }}>
                <CustomPieChart
                    data={balanceData}
                    label="Total Balance"
                    totalAmount={`₹${addThousandsSeperator(totalBalance)}`}
                    colors={COLORS}
                    showTextAnchor
                />
            </div>

            <div className='mt-4 grid grid-cols-3 gap-2 text-center text-sm'>
                <div className='p-2 rounded-lg bg-gray-50'>
                    <div className='text-gray-500'>Income</div>
                    <div className='font-medium text-green-600'>₹{addThousandsSeperator(totalIncome)}</div>
                </div>
                <div className='p-2 rounded-lg bg-gray-50'>
                    <div className='text-gray-500'>Expenses</div>
                    <div className='font-medium text-red-600'>₹{addThousandsSeperator(totalExpense)}</div>
                </div>
                <div className='p-2 rounded-lg bg-gray-50'>
                    <div className='text-gray-500'>Balance</div>
                    <div className='font-medium text-purple-600'>₹{addThousandsSeperator(totalBalance)}</div>
                </div>
            </div>
        </div>
    );
};

export default FinanceOverview;