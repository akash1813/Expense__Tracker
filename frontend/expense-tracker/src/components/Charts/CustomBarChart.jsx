import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from 'recharts';
import { addThousandsSeperator } from '../../utils/helper';

const CustomBarChart = ({ 
    data = [], 
    xDataKey = 'month', 
    barDataKey = 'amount',
    tooltipLabel = 'Amount',
    height = 300
}) => {
    // Generate consistent colors for bars
    const getBarColor = (index) => {
        const colors = [
            '#875cf5', // Primary purple
            '#5a3d9a', // Darker purple
            '#b794f4', // Lighter purple
            '#9f7aea', // Medium purple
            '#d6bcfa', // Very light purple
        ];
        return colors[index % colors.length];
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className='bg-white shadow-lg rounded-lg p-3 border border-gray-200 text-sm'>
                    <p className='font-semibold text-gray-800 mb-1'>
                        {data.category || data.source || tooltipLabel}
                    </p>
                    {data.month && (
                        <p className='text-gray-600 mb-1'>
                            <span className='font-medium'>Date:</span> {data.month}
                        </p>
                    )}
                    <p className='text-gray-600'>
                        <span className='font-medium'>Amount:</span>{' '}
                        <span className='font-semibold text-purple-700'>
                            ₹{addThousandsSeperator(data.amount || 0)}
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Calculate dynamic bar size based on data length
    const barSize = useMemo(() => {
        if (!data || data.length === 0) return 30;
        return Math.max(20, Math.min(40, 400 / data.length));
    }, [data.length]);

    // Calculate Y-axis domain with some padding
    const calculateDomain = () => {
        if (!data || data.length === 0) return [0, 100];
        const maxValue = Math.max(...data.map(item => Number(item[barDataKey]) || 0));
        return [0, Math.ceil(maxValue * 1.1)]; // 10% padding on top
    };

    if (!data || data.length === 0) {
        return (
            <div className='w-full h-full flex items-center justify-center text-gray-500 p-4'>
                <div className='text-center'>
                    <div className='mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2'>
                        <svg className='w-6 h-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                    </div>
                    <p className='text-gray-500'>No chart data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full' style={{ height: `${height}px` }}>
            <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 5,
                    }}
                    barCategoryGap='15%'
                >
                    <CartesianGrid
                        strokeDasharray='3 3'
                        vertical={false}
                        stroke='#f0f0f0'
                    />

                    <XAxis
                        dataKey={xDataKey}
                        tick={{
                            fontSize: 11,
                            fill: '#666',
                            fontFamily: 'Inter, sans-serif',
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        minTickGap={5}
                    />

                    <YAxis
                        domain={calculateDomain()}
                        tick={{
                            fontSize: 11,
                            fill: '#666',
                            fontFamily: 'Inter, sans-serif',
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                            `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`
                        }
                        tickMargin={5}
                        width={60}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                    />

                    <Bar
                        dataKey={barDataKey}
                        name={tooltipLabel}
                        barSize={barSize}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getBarColor(index)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CustomBarChart