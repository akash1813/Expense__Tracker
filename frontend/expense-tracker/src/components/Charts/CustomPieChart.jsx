import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import CustomTooltip from './CustomTooltip';
import CustomLegend from './CustomLegend';
import { addThousandsSeperator } from '../../utils/helper';

const CustomPieChart = ({ data = [], label, totalAmount, colors = [], showTextAnchor = true }) => {
    console.log('📊 [CustomPieChart] Rendering with data:', {
        dataLength: data?.length || 0,
        label,
        totalAmount,
        colorsLength: colors?.length || 0,
        showTextAnchor
    });

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No chart data available</p>
            </div>
        );
    }

    // Ensure we have colors for all data points
    const chartColors = colors.length >= data.length 
        ? colors 
        : [...colors, ...Array(data.length - colors.length).fill().map((_, i) => `hsl(${(i * 360) / (data.length - colors.length)}, 70%, 60%)`)];

    // Calculate responsive radius based on container size
    const getRadius = (containerWidth) => {
        if (!containerWidth) return { outer: 130, inner: 100 };
        const baseSize = Math.min(containerWidth, 500); // Cap the maximum size
        return {
            outer: Math.max(80, baseSize * 0.4),  // 40% of container width, min 80px
            inner: Math.max(60, baseSize * 0.3)   // 30% of container width, min 60px
        };
    };

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="60%"
                        labelLine={false}
                        paddingAngle={2}
                        animationDuration={1000}
                        animationBegin={0}
                        animationEasing="ease-out"
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={chartColors[index % chartColors.length]} 
                                stroke="#fff"
                                strokeWidth={1}
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        content={<CustomTooltip />} 
                        wrapperStyle={{ zIndex: 10 }}
                    />
                    <Legend 
                        content={<CustomLegend />} 
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />

                    {showTextAnchor && (
                        <g>
                            <text
                                x="50%"
                                y="50%"
                                dy={-25}
                                textAnchor="middle"
                                fill="#666"
                                fontSize="14px"
                                fontWeight="500"
                            >
                                {label}
                            </text>
                            <text
                                x="50%"
                                y="50%"
                                dy={8}
                                textAnchor="middle"
                                fill="#333"
                                fontSize="24px"
                                fontWeight="600"
                            >
                                {totalAmount}
                            </text>
                        </g>
                    )}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomPieChart;