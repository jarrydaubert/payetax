// src/lib/exportUtils.ts
import type { TaxCalculationResults } from '@/lib/taxCalculator';

/**
 * Export tax calculation results to CSV
 */
export function exportToCSV(results: TaxCalculationResults): void {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  // Build CSV content
  let csv = 'Category,Yearly,Monthly,Weekly\n';

  const addRow = (label: string, annually: number) => {
    csv += `${label},${formatter.format(annually)},${formatter.format(annually / 12)},${formatter.format(annually / 52)}\n`;
  };

  addRow('Gross Pay', results.grossSalary.annually);
  addRow('Income Tax', -results.incomeTax.annually);
  addRow('National Insurance', -results.nationalInsurance.annually);

  if (results.pensionContribution.annually > 0) {
    addRow('Pension', -results.pensionContribution.annually);
  }

  if (results.studentLoan.annually > 0) {
    addRow('Student Loan', -results.studentLoan.annually);
  }

  addRow('Net Pay', results.netPay.annually);

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tax-calculation-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Print tax calculation results
 */
export function printResults(results: TaxCalculationResults): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  const row = (label: string, annually: number, highlight = false) => {
    const className = highlight ? ' class="highlight"' : '';
    return `
      <tr${className}>
        <td>${label}</td>
        <td>${formatter.format(annually)}</td>
        <td>${formatter.format(annually / 12)}</td>
        <td>${formatter.format(annually / 52)}</td>
      </tr>
    `;
  };

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Calculation - ToolHubX</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 40px;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          h1 {
            color: #0f172a;
            font-size: 28px;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #64748b;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 12px;
            text-align: right;
            border-bottom: 1px solid #e2e8f0;
          }
          th:first-child, td:first-child {
            text-align: left;
            font-weight: 500;
          }
          th {
            background: #f8fafc;
            font-weight: 600;
            color: #475569;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .highlight {
            background: #f0f9ff;
            font-weight: 600;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            body { padding: 20px; }
            .header { margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tax Calculation Results</h1>
          <p class="subtitle">
            Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            • Annual Salary: ${formatter.format(results.grossSalary.annually)}
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Yearly</th>
              <th>Monthly</th>
              <th>Weekly</th>
            </tr>
          </thead>
          <tbody>
            ${row('Gross Pay', results.grossSalary.annually, true)}
            ${row('Income Tax', -results.incomeTax.annually)}
            ${row('National Insurance', -results.nationalInsurance.annually)}
            ${results.pensionContribution.annually > 0 ? row('Pension', -results.pensionContribution.annually) : ''}
            ${results.studentLoan.annually > 0 ? row('Student Loan', -results.studentLoan.annually) : ''}
            ${row('Net Pay', results.netPay.annually, true)}
          </tbody>
        </table>

        <div class="footer">
          <p>ToolHubX UK PAYE Tax Calculator • toolhubx.uk</p>
          <p style="margin-top: 8px;">
            This calculation is for illustrative purposes only.
            For official tax advice, consult HMRC or a qualified accountant.
          </p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}
