import React, { useEffect, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import CustomBarChart from '../Charts/CustomBarChart';
import { prepareIncomeBarChartData } from '../../utils/helper';

const IncomeOverview = ({ transactions = [], onAddIncome }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        console.log('IncomeOverview received transactions:', transactions);
        const result = prepareIncomeBarChartData(transactions);
        console.log('Processed chart data:', result);
        setChartData(result);
    }, [transactions]);

    return (
        <div className='card card-income'>
            <div className='flex items-center justify-between'>
                <div>
                    <h5 className='text-lg'>Income Overview</h5>
                    <p className='text-xs text-gray-400 mt-0.5'>
                        Track your earnings over time and analyze your income trends
                    </p>
                </div>

                <button 
                    className='add-btn' 
                    onClick={onAddIncome}
                    aria-label="Add income"
                >
                    <LuPlus className='text-lg' />
                    Add Income
                </button>
            </div>

            <div className='mt-10' style={{ minHeight: '300px' }}>
                {chartData.length > 0 ? (
                    <CustomBarChart data={chartData} />
                ) : (
                    <div className='flex flex-col items-center justify-center h-full py-10 text-gray-500'>
                        <p>No income data available</p>
                        <p className='text-sm'>Add income to see the chart</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomeOverview;