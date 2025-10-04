// src/lib/exportUtils.ts
import type { TaxCalculationResults } from '@/lib/taxCalculator';

/**
 * Export tax calculation results to CSV
 * CSV always includes all timeframes for maximum data export
 */
export function exportToCSV(results: TaxCalculationResults): void {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  // Build CSV content with all timeframes
  let csv = 'Category,Yearly,Monthly,4-Weekly,Fortnightly,Weekly,Daily,Hourly\n';

  const addRow = (label: string, annually: number) => {
    csv += `${label},${formatter.format(annually)},${formatter.format(annually / 12)},${formatter.format(annually / 13)},${formatter.format(annually / 26)},${formatter.format(annually / 52)},${formatter.format(annually / 260)},${formatter.format(annually / 1950)}\n`;
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
 * Uses user's selected visible periods from the results table
 */
export function printResults(
  results: TaxCalculationResults,
  visiblePeriods: string[] = ['Yearly', 'Monthly', 'Weekly'],
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });

  const periodDivisors: Record<string, number> = {
    Yearly: 1,
    Monthly: 12,
    '4-Weekly': 13,
    Fortnightly: 26,
    Weekly: 52,
    Daily: 260,
    Hourly: 1950,
  };

  const row = (label: string, annually: number, highlight = false) => {
    const className = highlight ? ' class="highlight"' : '';
    const periodCells = visiblePeriods
      .map((period) => {
        const value = annually / periodDivisors[period];
        return `<td>${formatter.format(value)}</td>`;
      })
      .join('');

    return `
      <tr${className}>
        <td>${label}</td>
        ${periodCells}
      </tr>
    `;
  };

  const periodHeaders = visiblePeriods.map((period) => `<th>${period}</th>`).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Calculation - PayeTax</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 15mm; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            color: #1e293b;
            max-width: 210mm;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #6366f1;
          }
          h1 {
            color: #6366f1;
            font-size: 24px;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #64748b;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
          }
          th, td {
            padding: 10px 8px;
            text-align: right;
            border-bottom: 1px solid #e2e8f0;
          }
          th:first-child, td:first-child {
            text-align: left;
            font-weight: 500;
            color: #1e293b;
          }
          th {
            background: #f8fafc;
            font-weight: 600;
            color: #6366f1;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #6366f1;
          }
          .highlight {
            background: #fef3c7;
            font-weight: 700;
            color: #1e293b;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 15mm; }
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
              ${periodHeaders}
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
          <p><strong>PayeTax</strong> UK PAYE Tax Calculator • payetax.co.uk</p>
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
