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

interface PrintResultsOptions {
  results: TaxCalculationResults;
  visiblePeriods?: string[];
  whatIfResults?: TaxCalculationResults | null;
  studentLoans?: string[];
  allowancesDeductions?: number;
  previousYearResults?: TaxCalculationResults | null;
  taxYear?: string;
}

/**
 * Print tax calculation results exactly as shown in the results table
 * Includes What If scenarios, user-selected periods, and all calculation rows
 */
export function printResults({
  results,
  visiblePeriods = ['Yearly', 'Monthly', 'Weekly'],
  whatIfResults = null,
  studentLoans = [],
  allowancesDeductions = 0,
  previousYearResults = null,
  taxYear,
}: PrintResultsOptions): void {
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

  const calculatePercentage = (amount: number, total: number): string => {
    if (total === 0) return '0.0%';
    return `${Math.abs((amount / total) * 100).toFixed(1)}%`;
  };

  // Calculate year-over-year change
  const grossAnnual = results.grossSalary.annually;
  const currentTaxYear = taxYear || '2025-2026';
  const currentYearStart = Number.parseInt(currentTaxYear.split('-')[0] || '', 10);
  const previousYearLabel = currentYearStart - 1;
  const yearChange = previousYearResults
    ? results.netPay.annually - previousYearResults.netPay.annually
    : 0;
  const whatIfYearChange =
    previousYearResults && whatIfResults
      ? whatIfResults.netPay.annually - previousYearResults.netPay.annually
      : undefined;

  // Row generator with What If support
  const row = (
    label: string,
    annually: number,
    percentage: string,
    whatIfAnnual: number | undefined,
    highlight = false,
    isSubRow = false,
    color = ''
  ) => {
    const highlightClass = highlight ? ' highlight' : '';
    const subRowClass = isSubRow ? ' sub-row' : '';
    const colorClass = color ? ` ${color}` : '';
    const className = `${highlightClass}${subRowClass}${colorClass}`.trim();
    const classAttr = className ? ` class="${className}"` : '';

    const periodCells = visiblePeriods
      .map((period) => {
        const divisor = periodDivisors[period] || 1;
        const currentValue = annually / divisor;
        
        if (whatIfResults && whatIfAnnual !== undefined) {
          const whatIfValue = whatIfAnnual / divisor;
          return `
            <td class="current-col">${formatter.format(currentValue)}</td>
            <td class="whatif-col">${formatter.format(whatIfValue)}</td>
          `;
        }
        
        return `<td>${formatter.format(currentValue)}</td>`;
      })
      .join('');

    return `
      <tr${classAttr}>
        <td class="category-col">${label}</td>
        <td class="percentage-col">${percentage}</td>
        ${periodCells}
      </tr>
    `;
  };

  // Period headers (with What If sub-headers if needed)
  const periodHeaders = whatIfResults
    ? visiblePeriods
        .map(
          (period) => `
        <th colspan="2" class="period-header">${period}</th>
      `
        )
        .join('')
    : visiblePeriods.map((period) => `<th>${period}</th>`).join('');

  const subHeaders = whatIfResults
    ? `
    <tr class="sub-header-row">
      <th colspan="2"></th>
      ${visiblePeriods
        .map(
          () => `
        <th class="current-header">Current</th>
        <th class="whatif-header">What If</th>
      `
        )
        .join('')}
    </tr>
  `
    : '';

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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            width: 100%;
            max-width: 1200px;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #6366f1;
          }
          h1 {
            color: #6366f1;
            font-size: 20px;
            margin-bottom: 6px;
            font-weight: 600;
          }
          .subtitle {
            color: #64748b;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            background: white;
            border: 1px solid #e2e8f0;
          }
          th, td {
            padding: 8px 6px;
            text-align: right;
            border-bottom: 1px solid #e2e8f0;
          }
          .category-col {
            text-align: left !important;
            font-weight: 500;
            color: #1e293b;
            min-width: 140px;
          }
          .percentage-col {
            text-align: right;
            color: #64748b;
            font-size: 9px;
            min-width: 45px;
          }
          th {
            background: #f8fafc;
            font-weight: 600;
            color: #6366f1;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 2px solid #6366f1;
            padding: 10px 6px;
          }
          th:first-child {
            text-align: left;
            font-size: 11px;
          }
          .period-header {
            text-align: center !important;
          }
          .sub-header-row th {
            background: #fafafa;
            font-size: 9px;
            padding: 6px;
            border-bottom: 1px solid #e2e8f0;
          }
          .current-header {
            background: #dbeafe !important;
            color: #1e40af !important;
          }
          .whatif-header {
            background: #f3e8ff !important;
            color: #6b21a8 !important;
          }
          .current-col {
            background: #f0f9ff;
          }
          .whatif-col {
            background: #faf5ff;
          }
          .highlight {
            background: #fef3c7 !important;
            font-weight: 700;
            color: #1e293b;
          }
          .sub-row {
            font-size: 9px;
          }
          .sub-row .category-col {
            padding-left: 20px;
            font-weight: 400;
            color: #475569;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 9px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tax Calculation Results${whatIfResults ? ' - Comparison' : ''}</h1>
            <p class="subtitle">
              Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              • Tax Year: ${currentTaxYear}
              • Annual Salary: ${formatter.format(results.grossSalary.annually)}
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Payslip</th>
                <th>%</th>
                ${periodHeaders}
              </tr>
              ${subHeaders}
            </thead>
            <tbody>
              ${row(
                'Gross Pay',
                results.grossSalary.annually,
                '100%',
                whatIfResults?.grossSalary.annually,
                true
              )}
              ${row(
                'Tax-Free Allowance',
                results.taxFreeAmount,
                calculatePercentage(results.taxFreeAmount, grossAnnual),
                whatIfResults?.taxFreeAmount
              )}
              ${row(
                'Total Taxable',
                results.taxableIncome,
                calculatePercentage(results.taxableIncome, grossAnnual),
                whatIfResults?.taxableIncome
              )}
              ${row(
                'Total Tax Due',
                results.incomeTax.annually,
                calculatePercentage(results.incomeTax.annually, grossAnnual),
                whatIfResults?.incomeTax.annually,
                false,
                false,
                'red-text'
              )}
              ${results.taxBands
                .map((band, idx) =>
                  row(
                    `${band.rate}% Rate`,
                    band.amount,
                    calculatePercentage(band.amount, grossAnnual),
                    whatIfResults?.taxBands[idx]?.amount,
                    false,
                    true,
                    'red-text'
                  )
                )
                .join('')}
              ${
                studentLoans.length > 0
                  ? row(
                      `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
                      results.studentLoan.annually,
                      calculatePercentage(results.studentLoan.annually, grossAnnual),
                      whatIfResults?.studentLoan.annually,
                      false,
                      false,
                      'orange-text'
                    )
                  : ''
              }
              ${row(
                'National Insurance',
                results.nationalInsurance.annually,
                calculatePercentage(results.nationalInsurance.annually, grossAnnual),
                whatIfResults?.nationalInsurance.annually,
                false,
                false,
                'yellow-text'
              )}
              ${row(
                'Pension',
                results.pensionContribution.annually,
                calculatePercentage(results.pensionContribution.annually, grossAnnual),
                whatIfResults?.pensionContribution.annually,
                false,
                false,
                'purple-text'
              )}
              ${row(
                'Allowances/Deductions',
                allowancesDeductions,
                calculatePercentage(allowancesDeductions, grossAnnual),
                whatIfResults ? allowancesDeductions : undefined,
                false,
                false,
                'teal-text'
              )}
              ${row(
                'Net Pay',
                results.netPay.annually,
                calculatePercentage(results.netPay.annually, grossAnnual),
                whatIfResults?.netPay.annually,
                true,
                false,
                'green-text'
              )}
              ${row(
                "Employers NI",
                results.employerNI,
                calculatePercentage(results.employerNI, grossAnnual),
                whatIfResults?.employerNI,
                false,
                false,
                'gray-text'
              )}
              ${
                previousYearResults
                  ? row(
                      `Net Change from ${previousYearLabel}`,
                      yearChange,
                      calculatePercentage(
                        Math.abs(yearChange),
                        previousYearResults.netPay.annually
                      ),
                      whatIfYearChange,
                      false,
                      false,
                      yearChange >= 0 ? 'green-text' : 'red-text'
                    )
                  : ''
              }
            </tbody>
          </table>

          <div class="footer">
            <p><strong>PayeTax</strong> UK PAYE Tax Calculator • payetax.co.uk</p>
            <p style="margin-top: 6px;">
              This calculation is for illustrative purposes only.
              For official tax advice, consult HMRC or a qualified accountant.
            </p>
          </div>
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
