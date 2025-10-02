const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const nodemailer = require('nodemailer');
const MonthlyReportEmail = require('../templates/MonthlyReportEmail');

// Initialize nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Track SMTP readiness instead of crashing the app on failure
let SMTP_READY = false;
transporter.verify((error, success) => {
    if (error) {
        console.error('Error verifying SMTP connection:', error);
        console.warn('Continuing without email capability. Monthly reports will be skipped until SMTP is configured.');
        SMTP_READY = false;
    } else {
        console.log('SMTP connection verified successfully');
        SMTP_READY = true;
    }
});

// Function to generate monthly financial report
const generateMonthlyReport = async (userId) => {
    try {
       
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const expenses = await Expense.find({
            userId,
            date: {
                $gte: new Date(year, month, 1),
                $lt: new Date(year, month + 1, 1)
            }
        });

        const income = await Income.find({
            userId,
            date: {
                $gte: new Date(year, month, 1),
                $lt: new Date(year, month + 1, 1)
            }
        });

        console.log(`Found ${expenses.length} expenses and ${income.length} income entries`);

        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        const expensesByCategory = expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) acc[expense.category] = 0;
            acc[expense.category] += expense.amount;
            return acc;
        }, {});

        const incomeBySource = income.reduce((acc, inc) => {
            if (!acc[inc.source]) acc[inc.source] = 0;
            acc[inc.source] += inc.amount;
            return acc;
        }, {});

        return {
            totalIncome,
            totalExpenses,
            netBalance,
            expensesByCategory,
            incomeBySource,
            month: date.toLocaleString('default', { month: 'long' }),
            year
        };
    } catch (error) {
        console.error('Error generating monthly report:', error);
        throw error;
    }
};

// Core function to send monthly reports without Express dependencies
const sendMonthlyReportsCore = async () => {
    try {
        if (!SMTP_READY) {
            console.warn('SMTP not ready. Skipping monthly reports send.');
            return;
        }
        console.log('Starting to fetch users...');
        const users = await User.find();
        console.log(`Found ${users.length} users in database`);
        
        if (users.length === 0) {
            console.log('No users found in database');
            return;
        }

        const promises = users.map(async (user) => {
            console.log(`Generating report for user: ${user.email}`);
            const report = await generateMonthlyReport(user._id);
            
            // Create email content using the HTML template
            const emailContent = MonthlyReportEmail({ report });
            
            // Use either verified email or fall back to user's email
            const verifiedEmail = process.env.VERIFIED_EMAIL || process.env.NODE_ENV === 'development' ? user.email : null;
            
            if (!verifiedEmail) {
                console.error('Warning: No verified email configured. Skipping email for:', user.email);
                return; // Skip this user if no verified email is available
            }
            
            // Use user's email directly in development mode
            const recipientEmail = process.env.NODE_ENV === 'development' ? user.email : verifiedEmail;
            
            const msg = {
                to: recipientEmail,
                from: process.env.SENDER_EMAIL || 'no-reply@expense-tracker.com',
                subject: `Monthly Financial Report - ${report.month} ${report.year}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #34495e;">
                        <h2 style="color: #2c3e50;">Monthly Financial Report</h2>
                        <p>Original recipient: ${user.email}</p>
                        <p>Development mode: ${process.env.NODE_ENV === 'development' ? 'Yes' : 'No'}</p>
                        ${emailContent}
                    </div>
                `
            };

            console.log(`Sending email to: ${msg.to}`);
            
            try {
                const result = await transporter.sendMail(msg);
                console.log(`Email sent successfully to: ${msg.to}`);
                
                if (result.rejected.length > 0) {
                    console.error('Email was rejected for:', result.rejected);
                    throw new Error('Email was rejected by the server');
                }
                
                if (result.accepted.length === 0) {
                    console.error('No emails were accepted by the server');
                    throw new Error('No emails were accepted by the server');
                }
            } catch (error) {
                console.error(`Failed to send email to ${msg.to}:`, error);
                if (error.response) {
                    console.error('Error details:', error.response);
                }
                throw error;
            }
        });

        await Promise.all(promises);
        console.log('All monthly reports sent successfully');
    } catch (error) {
        console.error('Error sending monthly reports:', error);
        throw error;
    }
};

// Function to handle both Express route and cron job contexts
exports.sendMonthlyReports = async (req, res) => {
    try {
        await sendMonthlyReportsCore();
        if (res) {
            res.status(200).json({ message: 'Monthly reports sent successfully' });
        } else {
            console.log('All monthly reports sent successfully');
        }
    } catch (error) {
        if (res) {
            res.status(500).json({ error: 'Failed to send monthly reports' });
        } else {
            console.error('Error sending monthly reports:', error);
            throw error;
        }
    }
};

// Export the core function for cron job
module.exports.sendMonthlyReportsCore = sendMonthlyReportsCore;