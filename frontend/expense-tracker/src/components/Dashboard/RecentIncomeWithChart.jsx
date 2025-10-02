import React, { useEffect, useState } from 'react';
import { addThousandsSeperator } from '../../utils/helper';
import CustomPieChart from '../Charts/CustomPieChart';

const COLORS = ["#875CF5", "#FA2C37", "#FF6900", "#4f39f6", "#00BFFF", "#32CD32", "#FFD700", "#FF69B4", "#8A2BE2"];

const RecentIncomeWithChart = ({ data = [], totalIncome = 0 }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔍 [RecentIncomeWithChart] Received props:', {
            dataLength: data?.length || 0,
            totalIncome,
            sampleData: data?.slice(0, 2) || 'No data',
        });

        // If no data or invalid data, set empty chart data
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('⚠️ [RecentIncomeWithChart] No valid data array provided');
            setChartData([]);
            setLoading(false);
            return;
        }

        try {
            // Group by source and sum amounts
            const incomeBySource = data.reduce((acc, item) => {
                if (!item || typeof item !== 'object') return acc;
                
                const source = item?.source || 'Other Income';
                const amount = parseFloat(item?.amount) || 0;
                
                if (isNaN(amount)) {
                    console.warn('Invalid amount in income record:', item);
                    return acc;
                }
                
                if (!acc[source]) {
                    acc[source] = 0;
                }
                acc[source] += amount;
                return acc;
            }, {});

            console.log('📊 [RecentIncomeWithChart] Income by source:', incomeBySource);

            // Convert to array format for the chart
            const dataArr = Object.entries(incomeBySource).map(([name, amount], index) => ({
                name: String(name),
                amount: parseFloat(amount),
                color: COLORS[index % COLORS.length],
                value: parseFloat(amount) // For recharts compatibility
            }));

            console.log('✅ [RecentIncomeWithChart] Processed chart data:', dataArr);
            setChartData(dataArr);
        } catch (error) {
            console.error('❌ [RecentIncomeWithChart] Error processing data:', error);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, [data, totalIncome]);

    // Show loading state
    if (loading) {
        return (
            <div className='card'>
                <div className='flex items-center justify-between mb-4'>
                    <h5 className='text-lg font-medium'>Last 60 Days Income</h5>
                    <div className='w-24 h-6 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='w-full h-64 flex items-center justify-center'>
                    <div className='animate-pulse text-gray-400'>Loading income data...</div>
                </div>
            </div>
        );
    }

    // Show empty state
    if (chartData.length === 0) {
        return (
            <div className='card'>
                <div className='flex items-center justify-between mb-4'>
                    <h5 className='text-lg font-medium'>Last 60 Days Income</h5>
                    <div className='text-sm text-gray-500'>
                        Total: ₹{addThousandsSeperator(totalIncome)}
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center h-64 p-4 text-center bg-gray-50 rounded-lg'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                        </svg>
                    </div>
                    <p className='text-gray-600 font-medium mb-1'>No income data available</p>
                    <p className='text-sm text-gray-400'>Add income transactions to see the chart</p>
                </div>
            </div>
        );
    }

    return (
        <div className='card'>
            <div className='flex items-center justify-between mb-4'>
                <h5 className='text-lg font-medium'>Last 60 Days Income</h5>
                <div className='text-sm font-medium text-gray-700'>
                    Total: <span className='text-purple-600'>₹{addThousandsSeperator(totalIncome)}</span>
                </div>
            </div>

            <div className='relative w-full' style={{ aspectRatio: '1', minHeight: '250px', maxHeight: '400px' }}>
                <CustomPieChart
                    data={chartData}
                    label="Total Income"
                    totalAmount={`₹${addThousandsSeperator(totalIncome)}`}
                    colors={chartData.map(item => item.color || COLORS[0])}
                    showTextAnchor
                />
            </div>
        </div>
    );
};

export default RecentIncomeWithChart;