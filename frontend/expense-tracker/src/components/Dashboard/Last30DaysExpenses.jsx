import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { prepareExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../Charts/CustomBarChart';
import { LuArrowRight } from 'react-icons/lu';

const Last30DaysExpenses = ({ data = [] }) => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Last30DaysExpenses received data:', data);
        try {
            const result = prepareExpenseBarChartData(data);
            console.log('Processed chart data:', result);
            setChartData(result);
        } catch (error) {
            console.error('Error processing chart data:', error);
        } finally {
            setLoading(false);
        }
    }, [data]);

    const handleSeeAll = (e) => {
        e.preventDefault();
        navigate('/expense');
    };

    if (loading) {
        return (
            <div className='card'>
                <div className='flex items-center justify-between mb-4'>
                    <h5 className='text-lg font-medium'>Last 30 Days Expenses</h5>
                    <button 
                        className='card-btn flex items-center gap-1 text-sm opacity-50 cursor-not-allowed'
                        disabled
                    >
                        Loading...
                    </button>
                </div>
                <div className='w-full flex items-center justify-center' style={{ minHeight: '250px' }}>
                    <div className='animate-pulse text-gray-400'>Loading chart data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className='card'>
            <div className='flex items-center justify-between mb-4'>
                <h5 className='text-lg font-medium'>Last 30 Days Expenses</h5>
                <button 
                    className='card-btn flex items-center gap-1 text-sm hover:text-primary transition-colors'
                    onClick={handleSeeAll}
                >
                    See All <LuArrowRight className='text-base' />
                </button>
            </div>

            <div className='w-full' style={{ minHeight: '250px' }}>
                {chartData.length > 0 ? (
                    <CustomBarChart 
                        data={chartData}
                        xDataKey="month"
                        barDataKey="amount"
                        tooltipLabel="Expense"
                    />
                ) : (
                    <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                        <div className='bg-gray-100 rounded-full p-3 mb-3'>
                            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'></path>
                            </svg>
                        </div>
                        <p className='text-gray-600 font-medium'>No expense data available</p>
                        <p className='text-sm text-gray-400 mt-1'>Add some expenses to see the chart</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Last30DaysExpenses;