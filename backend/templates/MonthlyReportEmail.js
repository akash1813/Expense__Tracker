const MonthlyReportEmail = ({ report }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Monthly Financial Report</title>
      <style>
        /* Base styles */
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(120deg, #ffffff 0%, #f5f5f5 100%);
        }
        
        /* Container */
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
  
        /* Responsive styles */
        @media only screen and (max-width: 620px) {
          .email-container {
            width: 95%;
            margin: 20px auto;
          }
          h1, h2, p, td {
            font-size: 16px !important;
          }
        }
  
        /* Header */
        .header {
          padding: 40px 30px 25px;
          background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
          color: #fff;
          border-radius: 20px 20px 0 0;
        }
  
        .header h1 {
          font-size: 28px;
          margin: 0;
          font-weight: 700;
          letter-spacing: 1px;
        }
  
        .month-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 15px;
          margin-top: 15px;
          font-size: 16px;
        }
  
        /* Section styles */
        .section {
          padding: 35px 30px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
  
        .section:last-child {
          border-bottom: none;
        }
  
        .section h2 {
          margin: 0 0 20px;
          font-size: 22px;
          color: #000000;
          font-weight: 600;
        }
  
        .section p {
          margin: 0;
          font-size: 16px;
          color: #555;
        }
  
        /* Summary tables */
        .summary-table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }
  
        .summary-table tr {
          border-bottom: 1px solid #f0f0f0;
        }
  
        .summary-table td {
          padding: 15px 0;
          font-size: 15px;
          color: #333;
        }
  
        .summary-table td:first-child {
          padding-right: 20px;
        }
  
        .summary-table td:last-child {
          text-align: right;
        }
  
        .amount {
          font-weight: 600;
        }
  
        /* Net balance section */
        .net-balance {
          background: linear-gradient(135deg, #000000 0%, #333333 100%);
          text-align: center;
          color: #fff;
        }
  
        .net-balance h2 {
          margin: 0 0 15px;
          font-size: 22px;
        }
  
        .net-balance .balance-amount {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
  
        /* Footer */
        .footer {
          padding: 30px;
          text-align: center;
          background: #fff;
          border-radius: 0 0 20px 20px;
        }
  
        .footer p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
  
        .footer .highlight {
          color: #f093fb;
          font-weight: 600;
        }
  
        .footer .subtext {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
        }
  
        /* Amount colors */
        .positive {
          color: #27ae60;
        }
  
        .negative {
          color: #e74c3c;
        }
  
        .neutral {
          color: #f6e58d;
        }
  
        /* Icons */
        .icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>📊 Monthly Financial Report</h1>
          <div class="month-badge">${report.month} ${report.year}</div>
        </div>
  
        <!-- Income Summary -->
        <div class="section income-section">
          <h2>💰 Income Summary</h2>
          <p>Total Income: <strong style="color: #27ae60; font-size: 1.1em;">₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(report.totalIncome)}</strong></p>
          <table class="summary-table">
            ${Object.entries(report.incomeBySource).map(
              ([source, amount]) => `
                <tr>
                  <td>${source}</td>
                  <td class="amount positive">₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}</td>
                </tr>
              `).join('')}
          </table>
        </div>
  
        <!-- Expense Summary -->
        <div class="section expense-section">
          <h2>🧾 Expense Summary</h2>
          <p>Total Expenses: <strong style="color: #e74c3c; font-size: 1.1em;">₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(report.totalExpenses)}</strong></p>
          <table class="summary-table">
            ${Object.entries(report.expensesByCategory).map(
              ([category, amount]) => `
                <tr>
                  <td>${category}</td>
                  <td class="amount negative">₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}</td>
                </tr>
              `).join('')}
          </table>
        </div>
  
        <!-- Net Balance -->
        <div class="section net-balance">
          <h2>🏦 Net Balance</h2>
          <p class="balance-amount ${report.netBalance >= 0 ? 'positive' : 'negative'}">
            <strong>₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(report.netBalance)}</strong>
          </p>
        </div>
  
        <!-- Footer -->
        <div class="footer">
          <p>🌈 Thank you for using our <span class="highlight">Expense Tracker</span>!</p>
          <p class="subtext">Stay organized, stay happy!</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };
  
  module.exports = MonthlyReportEmail;
  