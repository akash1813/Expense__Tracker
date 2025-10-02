const cron = require('node-cron');
const { sendMonthlyReportsCore } = require('../controllers/emailController');
const express = require('express');
const app = express();

// Schedule monthly reports to be sent on the 1st day of every month at 9 AM
const task = cron.schedule('0 9 1 * *', async () => {
    try {
        console.log('Starting monthly report generation...');
        await sendMonthlyReportsCore();
        console.log('Monthly reports sent successfully!');
    } catch (error) {
        console.error('Error in monthly report cron job:', error);
    }
});

// Start the cron job
if (process.env.NODE_ENV !== 'test') {
    task.start();
    console.log('Monthly report cron job initialized');
}

module.exports = task;
