// src/lib/exportUtils.ts
import type { TaxCalculationResults } from '@/lib/taxCalculator';

/**
 * Export tax calculation results to CSV
 * CSV always includes all timeframes for maximum data export
 * Returns true when download is initiated
 */
export function exportToCSV(results: TaxCalculationResults): boolean {
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
  addRow('Tax-Free Allowance', results.taxFreeAmount);
  addRow('Total Taxable', results.taxableIncome);
  addRow('Total Tax Due', -results.incomeTax.annually);

  // Tax band breakdown
  for (const band of results.taxBands) {
    addRow(`  ${band.rate}% Rate`, -band.amount);
  }

  if (results.studentLoan.annually > 0) {
    addRow('Student Loan', -results.studentLoan.annually);
  }

  addRow('National Insurance', -results.nationalInsurance.annually);

  if (results.pensionContribution.annually > 0) {
    addRow('Pension [You]', -results.pensionContribution.annually);
  }

  addRow('Pension [HMRC Relief]', 0);
  addRow('Net Pay', results.netPay.annually);

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tax-calculation-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  // Return success flag for external toast handling
  return true;
}

/**
 * Print tax calculation results
 * Shows user's selected visible periods from the results table
 */
export function printResults(
  results: TaxCalculationResults,
  visiblePeriods: string[] = ['Yearly', 'Monthly', 'Weekly']
): void {
  // Create hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    document.body.removeChild(iframe);
    return;
  }

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
          @page { size: A4 landscape; margin: 15mm; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            color: #1e293b;
            max-width: 210mm;
            margin: 0 auto;
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
            ${row('Tax-Free Allowance', results.taxFreeAmount)}
            ${row('Total Taxable', results.taxableIncome)}
            ${row('Total Tax Due', -results.incomeTax.annually)}
            ${results.taxBands.map((band) => row(`  ${band.rate}% Rate`, -band.amount)).join('')}
            ${results.studentLoan.annually > 0 ? row('Student Loan', -results.studentLoan.annually) : ''}
            ${row('National Insurance', -results.nationalInsurance.annually)}
            ${results.pensionContribution.annually > 0 ? row('Pension [You]', -results.pensionContribution.annually) : ''}
            ${row('Pension [HMRC Relief]', 0)}
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
  setTimeout(() => {
    printWindow.print();
    // Remove iframe after printing
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 250);
}
