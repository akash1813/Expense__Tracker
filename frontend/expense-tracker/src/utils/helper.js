import moment from "moment";
import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

export async function scanReceipt(file) {
    try {
        if (!file) throw new Error("No file provided for scanning.");
        if (!file.type?.startsWith('image/')) throw new Error("Unsupported file type. Please select an image.");

        const form = new FormData();
        form.append('image', file);

        const resp = await axiosInstance.post(API_PATHS.AI.SCAN_RECEIPT, form);

        const { amount, date, category } = resp.data || {};
        return {
            amount: amount != null ? Number(amount) : undefined,
            date: date ? new Date(date) : undefined,
            category: category || "",
        };
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || "Failed to scan receipt");
    }
}



export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const getInitials = (name) => {

    if (!name)
        return "";

    const words = name.split(" ");
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0];
    }

    return initials.toUpperCase();


}

export const addThousandsSeperator = (num) => {

    if (num == null || isNaN(num)) return "";
    
  
    const [integerPart, fractionalPart] = num.toString().split(".");
    

    const formattedInteger = parseInt(integerPart).toLocaleString("en-IN");
    
    return fractionalPart
        ? `${formattedInteger}.${fractionalPart}`
        : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('No expense data available for chart');
        return [];
    }

    try {
        // Group expenses by category and sum amounts
        const categoryMap = data.reduce((acc, item) => {
            if (!item) return acc;
            
            const category = item.category || 'Uncategorized';
            const amount = Number(item.amount) || 0;
            
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
            return acc;
        }, {});

        // Convert to array format for the chart
        const chartData = Object.entries(categoryMap).map(([category, amount], index) => ({
            category,
            amount,
            name: category, // For tooltip
            month: category, // For X-axis
            source: category // For tooltip
        }));

        console.log('Processed expense chart data:', chartData);
        return chartData;
    } catch (error) {
        console.error('Error preparing expense chart data:', error);
        return [];
    }
};

export const prepareIncomeBarChartData = (data = []) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('No income data available for chart');
        return [];
    }

    try {
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log('Processed income data for chart:', sortedData);

        const chartData = sortedData.map((item) => ({
            month: moment(item?.date).format('Do MMM'),
            amount: Number(item?.amount) || 0,
            source: item?.source || 'Other',
            category: item?.source || 'Other' // Added for tooltip compatibility
        }));
        
        return chartData;
    } catch (error) {
        console.error('Error preparing income chart data:', error);
        return [];
    }
}

export const prepareExpenseLineChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    const chartData = sortedData.map((item) => ({
        month: moment(item?.date).format("Do MMM"),
        amount: item?.amount,
        category: item?.category,

    }));

    return chartData;
}


