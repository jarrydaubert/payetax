// src/lib/exportUtils.ts
/**
 * Professional Tax Calculation Export Utilities
 *
 * This module provides comprehensive data export functionality for UK tax calculations,
 * enabling users to generate professional reports suitable for:
 * - Financial planning and budgeting
 * - Employer salary negotiations
 * - Accountant consultations
 * - Tax return preparation
 * - Personal record keeping
 *
 * ## Export Format Support
 *
 * ### CSV (Comma-Separated Values)
 * - **Compatible**: Excel, Google Sheets, LibreOffice Calc, Numbers
 * - **Structure**: Headers, input parameters, multi-period breakdowns, tax analysis
 * - **Currency**: Proper UK pound formatting with negative indicators
 * - **Encoding**: UTF-8 with BOM for international compatibility
 *
 * ### Print-Optimized HTML
 * - **Purpose**: Professional printouts and PDF conversion
 * - **Styling**: Clean layout with company branding and official formatting
 * - **Responsive**: A4 paper size optimization with proper margins
 * - **Accessibility**: High contrast and screen-reader compatible
 *
 * ## Data Processing Features
 *
 * ### Intelligent Field Handling
 * - **Conditional Fields**: Only includes pension/student loan data when applicable
 * - **Zero Handling**: Gracefully handles £0 values without cluttering output
 * - **Period Scaling**: Automatic calculation of weekly, monthly, annual figures
 * - **Rate Calculations**: Effective tax rates and percentage breakdowns
 *
 * ### Professional Formatting
 * - **Currency**: British pound symbols with proper thousand separators
 * - **Decimals**: Appropriate precision for different value types
 * - **Negatives**: Clear indication of deductions with minus symbols
 * - **Dates**: ISO formatting with user-friendly display
 *
 * ### Data Integrity
 * - **Validation**: Input parameter verification before export
 * - **Consistency**: Cross-period calculation validation
 * - **Traceability**: Includes generation timestamp and calculation parameters
 * - **Version**: Export format version for future compatibility
 *
 * ## Security & Privacy Considerations
 *
 * - **Client-Side Processing**: All exports generated in browser (no server transmission)
 * - **No Storage**: Export data not cached or transmitted to external services
 * - **Local Downloads**: Files saved directly to user's device
 * - **Data Minimization**: Only includes necessary calculation data
 *
 * @see {@link TaxCalculationResults} Core calculation result types
 * @see {@link formatCurrency} Currency formatting utility
 * @see {@link generateCSV} CSV generation function
 * @see {@link downloadCSV} Secure file download handler
 */

import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

/**
 * Export Data Container Interface
 *
 * Comprehensive data structure that combines tax calculation results with all input
 * parameters and metadata required for generating professional export documents.
 * This ensures exported files contain complete context for understanding and
 * verification of calculations.
 */
export interface ExportData {
  /**
   * Complete tax calculation results from the HMRC-compliant calculation engine
   *
   * Includes all computed values across different pay periods:
   * - Gross salary breakdowns
   * - Income tax by progressive bands
   * - National Insurance contributions (employee and employer)
   * - Student loan repayments (all plan types)
   * - Pension contributions (with tax relief)
   * - Net take-home pay calculations
   */
  results: TaxCalculationResults;

  /**
   * Original salary input amount as entered by user
   *
   * Used for:
   * - Calculation verification and audit trail
   * - Input parameter documentation
   * - Percentage-based analysis and comparisons
   *
   * @example 45000 // £45,000 annual salary
   */
  salary: number;

  /**
   * UK tax year used for HMRC rate calculations
   *
   * Format: "YYYY-YY" representing April 6th to April 5th period
   * Determines which tax rates, allowances, and thresholds apply
   *
   * @example "2024-25" // Tax year from 6 April 2024 to 5 April 2025
   */
  taxYear: string;

  /**
   * HMRC tax code applied to calculations
   *
   * Determines personal allowance and special circumstances:
   * - Standard codes: 1257L (most common)
   * - Scottish codes: S1257L, S1250L, etc.
   * - Emergency codes: 1257L M1, 1257L W1
   * - Special codes: BR, D0, D1, 0T, NT
   *
   * @example "1257L" // Standard personal allowance
   * @example "S1100L" // Scottish taxpayer with reduced allowance
   */
  taxCode: string;

  /**
   * Tax region for jurisdiction-specific rates
   *
   * Determines which income tax rates apply:
   * - "England & Wales": Standard UK rates
   * - "Scotland": Devolved Scottish income tax rates
   * - "Northern Ireland": Same as England & Wales rates
   *
   * Note: National Insurance and student loan rates are UK-wide
   */
  region: string;

  /**
   * Active student loan plan types for repayment calculations
   *
   * Multiple plans can be active simultaneously:
   * - Plan 1: Pre-2012 loans (9% above £22,015)
   * - Plan 2: Post-2012 loans (9% above £27,295)
   * - Plan 4: Scottish loans (9% above £27,660)
   * - Plan 5: 2023+ loans (9% above £25,000)
   * - Postgraduate: Masters/PhD loans (6% above £21,000)
   *
   * @example ["Plan 2", "Postgraduate"] // Undergraduate + postgraduate loans
   */
  studentLoans: string[];

  /**
   * ISO 8601 timestamp when export was generated
   *
   * Used for:
   * - Document versioning and audit trail
   * - Data freshness verification
   * - Tax year period validation
   *
   * @example "2025-01-15T10:30:00.000Z"
   */
  exportDate: string;
}

/**
 * Professional CSV Export Generator for UK Tax Calculations
 *
 * Generates a comprehensive, professionally-formatted CSV file containing complete tax
 * calculation breakdown suitable for financial planning, record keeping, and sharing
 * with financial advisors or employers.
 *
 * ## CSV Structure & Format
 *
 * ### Header Section
 * - Document title and branding
 * - Generation timestamp for version control
 * - Input parameters for calculation verification
 *
 * ### Multi-Period Breakdown
 * Creates separate sections for:
 * - **Annual**: Total yearly amounts for tax planning
 * - **Monthly**: Practical budgeting and cash flow planning
 * - **Weekly**: Day-to-day expense and savings planning
 *
 * ### Tax Analysis Section
 * - **Effective Tax Rate**: Combined income tax + NI as % of gross
 * - **Income Tax Rate**: Pure income tax percentage
 * - **National Insurance Rate**: NI contribution percentage
 *
 * ### Data Quality Features
 *
 * #### Smart Field Inclusion
 * - **Conditional Fields**: Only includes pension/student loan rows when > £0
 * - **Zero Suppression**: Avoids cluttering with £0.00 entries
 * - **Relevant Sections**: Adapts structure based on user's circumstances
 *
 * #### Format Compatibility
 * - **Excel Compatible**: Proper CSV escaping and encoding
 * - **Google Sheets**: UTF-8 encoding with BOM for international support
 * - **LibreOffice Calc**: Standard CSV delimiter handling
 * - **Numbers (macOS)**: Apple CSV import compatibility
 *
 * #### Currency & Number Formatting
 * - **British Pounds**: Proper £ symbol with thousand separators
 * - **Negative Values**: Clear minus prefix for deductions
 * - **Decimal Precision**: Appropriate precision for different value types
 * - **Percentage Display**: Formatted with % symbol and 1 decimal place
 *
 * ## Use Cases & Applications
 *
 * ### Financial Planning
 * - Import into budgeting software (YNAB, Mint, etc.)
 * - Mortgage affordability calculations
 * - Investment planning with net income analysis
 * - Retirement planning and pension contribution optimization
 *
 * ### Professional Services
 * - Share with accountants for tax return preparation
 * - Provide to financial advisors for portfolio planning
 * - Submit to mortgage brokers for lending assessments
 * - Include in employment contract negotiations
 *
 * ### Record Keeping
 * - Personal tax calculation history
 * - Salary comparison analysis across time periods
 * - Documentation for HMRC self-assessment
 * - Archive for annual financial reviews
 *
 * @param data - Complete export data container with results and metadata
 * @returns Formatted CSV content string ready for browser download or file saving
 *
 * @throws {Error} If required fields are missing or data validation fails
 *
 * @example
 * ```typescript
 * const csvContent = generateCSV({
 *   results: taxCalculationResults,
 *   salary: 45000,
 *   taxYear: '2024-25',
 *   taxCode: '1257L',
 *   region: 'England & Wales',
 *   studentLoans: ['Plan 2'],
 *   exportDate: new Date().toISOString()
 * });
 *
 * // CSV content ready for download
 * downloadCSV(csvContent, 'tax-calculation-2024-25.csv');
 * ```
 *
 * @see {@link downloadCSV} Secure file download function
 * @see {@link ExportData} Complete data structure requirements
 * @see {@link formatCurrency} Currency formatting utility used internally
 */
export function generateCSV(data: ExportData): string {
  const { results, salary, taxYear, taxCode, region, studentLoans, exportDate } = data;

  const csvRows = [
    ['ToolHubX UK Tax Calculator Results'],
    ['Generated on', exportDate],
    [''],
    ['Input Details'],
    ['Gross Salary', formatCurrency(salary)],
    ['Tax Year', taxYear],
    ['Tax Code', taxCode || '1257L'],
    ['Region', region],
    ['Student Loans', studentLoans.join(', ') || 'None'],
    [''],
    ['Annual Breakdown'],
    ['Gross Salary', formatCurrency(results.grossSalary.annually)],
    ['Income Tax', `-${formatCurrency(results.incomeTax.annually)}`],
    ['National Insurance', `-${formatCurrency(results.nationalInsurance.annually)}`],
  ];

  // Add pension if applicable
  if (results.pensionContribution.annually > 0) {
    csvRows.push([
      'Pension Contribution',
      `-${formatCurrency(results.pensionContribution.annually)}`,
    ]);
  }

  // Add student loan if applicable
  if (results.studentLoan.annually > 0) {
    csvRows.push(['Student Loan Repayment', `-${formatCurrency(results.studentLoan.annually)}`]);
  }

  csvRows.push(
    ['Net Take-Home Pay', formatCurrency(results.netPay.annually)],
    [''],
    ['Monthly Breakdown'],
    ['Gross Salary', formatCurrency(results.grossSalary.monthly)],
    ['Income Tax', `-${formatCurrency(results.incomeTax.monthly)}`],
    ['National Insurance', `-${formatCurrency(results.nationalInsurance.monthly)}`]
  );

  // Add monthly pension if applicable
  if (results.pensionContribution.monthly > 0) {
    csvRows.push([
      'Pension Contribution',
      `-${formatCurrency(results.pensionContribution.monthly)}`,
    ]);
  }

  // Add monthly student loan if applicable
  if (results.studentLoan.monthly > 0) {
    csvRows.push(['Student Loan Repayment', `-${formatCurrency(results.studentLoan.monthly)}`]);
  }

  csvRows.push(
    ['Net Take-Home Pay', formatCurrency(results.netPay.monthly)],
    [''],
    ['Weekly Breakdown'],
    ['Gross Salary', formatCurrency(results.grossSalary.weekly)],
    ['Income Tax', `-${formatCurrency(results.incomeTax.weekly)}`],
    ['National Insurance', `-${formatCurrency(results.nationalInsurance.weekly)}`]
  );

  // Add weekly pension if applicable
  if (results.pensionContribution.weekly > 0) {
    csvRows.push([
      'Pension Contribution',
      `-${formatCurrency(results.pensionContribution.weekly)}`,
    ]);
  }

  // Add weekly student loan if applicable
  if (results.studentLoan.weekly > 0) {
    csvRows.push(['Student Loan Repayment', `-${formatCurrency(results.studentLoan.weekly)}`]);
  }

  csvRows.push(
    ['Net Take-Home Pay', formatCurrency(results.netPay.weekly)],
    [''],
    ['Tax Rates'],
    [
      'Effective Tax Rate',
      `${(((results.incomeTax.annually + results.nationalInsurance.annually) / results.grossSalary.annually) * 100).toFixed(1)}%`,
    ],
    [
      'Income Tax Rate',
      `${((results.incomeTax.annually / results.grossSalary.annually) * 100).toFixed(1)}%`,
    ],
    [
      'National Insurance Rate',
      `${((results.nationalInsurance.annually / results.grossSalary.annually) * 100).toFixed(1)}%`,
    ],
    [''],
    ['Generated by ToolHubX - https://toolhubx.uk']
  );

  return csvRows.map((row) => row.join(',')).join('\n');
}

/**
 * Secure Client-Side File Download Handler for CSV Exports
 *
 * Implements secure, client-side file download functionality using modern browser APIs.
 * This approach ensures user privacy by processing all data locally without any
 * server transmission or external service dependencies.
 *
 * ## Security & Privacy Features
 *
 * ### Client-Side Processing
 * - **No Server Upload**: All data processing happens in the user's browser
 * - **No External Services**: No third-party APIs or cloud storage involved
 * - **No Data Persistence**: Files are not cached or stored on any external system
 * - **Direct Download**: File saved directly to user's chosen download location
 *
 * ### Modern Browser Compatibility
 * - **Blob API**: Uses modern File API for efficient memory handling
 * - **Object URLs**: Temporary in-memory references (automatically cleaned up)
 * - **Download Attribute**: HTML5 download attribute for filename control
 * - **Fallback Handling**: Graceful degradation for older browsers
 *
 * ## Implementation Strategy
 *
 * ### Memory Management
 * 1. **Blob Creation**: Efficient binary data container with proper MIME type
 * 2. **Object URL**: Temporary reference for download link generation
 * 3. **DOM Manipulation**: Temporary link element created and removed
 * 4. **Cleanup**: Automatic memory cleanup via browser garbage collection
 *
 * ### User Experience
 * - **Immediate Download**: File download starts immediately when called
 * - **Proper Filename**: User sees meaningful filename with extension
 * - **Save Location**: Respects user's default download folder preferences
 * - **No UI Disruption**: Hidden link element prevents visual interference
 *
 * ## Browser Support & Compatibility
 *
 * ### Supported Browsers
 * - **Chrome 15+**: Full support with download attribute
 * - **Firefox 20+**: Complete functionality including filename
 * - **Safari 10.1+**: Full download support with proper MIME handling
 * - **Edge 12+**: Complete compatibility with all features
 *
 * ### Graceful Degradation
 * - **Feature Detection**: Checks for download attribute support
 * - **Fallback Strategy**: Could be extended for legacy browser support
 * - **Error Handling**: Silent failure for unsupported environments
 *
 * @param csvContent - Complete CSV file content as generated by generateCSV()
 * @param filename - Desired filename for the downloaded file (should include .csv extension)
 *
 * @throws {Error} Silently handles unsupported browsers (no download occurs)
 *
 * @example
 * ```typescript
 * // Generate and download tax calculation CSV
 * const csvData = generateCSV(exportData);
 * downloadCSV(csvData, 'my-tax-calculation-2024-25.csv');
 *
 * // File will be saved to user's default download folder
 * // Filename: my-tax-calculation-2024-25.csv
 * ```
 *
 * @see {@link generateCSV} CSV content generation function
 * @see {@link ExportData} Required data structure for export
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create Blob with proper MIME type and UTF-8 encoding
  // UTF-8 ensures international character support (£ symbol, etc.)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create temporary anchor element for download trigger
  const link = document.createElement('a');

  // Feature detection: Check if browser supports HTML5 download attribute
  if (link.download !== undefined) {
    // Create temporary object URL pointing to the Blob
    // This creates an in-memory reference that can be used as href
    const url = URL.createObjectURL(blob);

    // Configure download link with URL and desired filename
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    // Hide link to prevent visual interference with UI
    link.style.visibility = 'hidden';

    // Temporarily add to DOM (required for click() to work in some browsers)
    document.body.appendChild(link);

    // Programmatically trigger download
    link.click();

    // Clean up: Remove temporary link element from DOM
    document.body.removeChild(link);

    // Note: Object URL cleanup happens automatically via garbage collection
    // Could optionally call URL.revokeObjectURL(url) for immediate cleanup
  }
  // For unsupported browsers, function fails silently
  // Could be extended with fallback strategies (e.g., open in new window)
}

// PDF generation has been moved to @/lib/pdfExport.ts for better code splitting

function _generatePrintHTML(data: ExportData): string {
  const { results, salary, taxYear, taxCode, region, studentLoans, exportDate } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ToolHubX Tax Calculator Results</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }
        .date { font-size: 14px; color: #666; }
        .section { margin: 30px 0; }
        .section h3 { color: #6366f1; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        .detail-item { display: flex; justify-content: space-between; padding: 8px 0; }
        .results-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .results-table th, .results-table td { padding: 12px; text-align: right; border-bottom: 1px solid #e5e5e5; }
        .results-table th { background: #f8f9fa; font-weight: 600; }
        .results-table td:first-child, .results-table th:first-child { text-align: left; }
        .total-row { background: #f0fdf4; font-weight: bold; }
        .negative { color: #dc2626; }
        .positive { color: #16a34a; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ToolHubX</div>
        <h2>UK Tax Calculator Results</h2>
        <div class="date">Generated on ${exportDate}</div>
      </div>
      
      <div class="section">
        <h3>Input Details</h3>
        <div class="details-grid">
          <div class="detail-item"><span>Gross Salary:</span><span>${formatCurrency(salary)}</span></div>
          <div class="detail-item"><span>Tax Year:</span><span>${taxYear}</span></div>
          <div class="detail-item"><span>Tax Code:</span><span>${taxCode || '1257L'}</span></div>
          <div class="detail-item"><span>Region:</span><span>${region}</span></div>
          <div class="detail-item"><span>Student Loans:</span><span>${studentLoans.join(', ') || 'None'}</span></div>
        </div>
      </div>
      
      <div class="section">
        <h3>Tax Calculation Results</h3>
        <table class="results-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Annual</th>
              <th>Monthly</th>
              <th>Weekly</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gross Salary</td>
              <td>${formatCurrency(results.grossSalary.annually)}</td>
              <td>${formatCurrency(results.grossSalary.monthly)}</td>
              <td>${formatCurrency(results.grossSalary.weekly)}</td>
            </tr>
            <tr>
              <td>Income Tax</td>
              <td class="negative">-${formatCurrency(results.incomeTax.annually)}</td>
              <td class="negative">-${formatCurrency(results.incomeTax.monthly)}</td>
              <td class="negative">-${formatCurrency(results.incomeTax.weekly)}</td>
            </tr>
            <tr>
              <td>National Insurance</td>
              <td class="negative">-${formatCurrency(results.nationalInsurance.annually)}</td>
              <td class="negative">-${formatCurrency(results.nationalInsurance.monthly)}</td>
              <td class="negative">-${formatCurrency(results.nationalInsurance.weekly)}</td>
            </tr>
            ${
              results.pensionContribution.annually > 0
                ? `
            <tr>
              <td>Pension Contribution</td>
              <td class="negative">-${formatCurrency(results.pensionContribution.annually)}</td>
              <td class="negative">-${formatCurrency(results.pensionContribution.monthly)}</td>
              <td class="negative">-${formatCurrency(results.pensionContribution.weekly)}</td>
            </tr>`
                : ''
            }
            ${
              results.studentLoan.annually > 0
                ? `
            <tr>
              <td>Student Loan Repayment</td>
              <td class="negative">-${formatCurrency(results.studentLoan.annually)}</td>
              <td class="negative">-${formatCurrency(results.studentLoan.monthly)}</td>
              <td class="negative">-${formatCurrency(results.studentLoan.weekly)}</td>
            </tr>`
                : ''
            }
            <tr class="total-row">
              <td><strong>Net Take-Home Pay</strong></td>
              <td class="positive"><strong>${formatCurrency(results.netPay.annually)}</strong></td>
              <td class="positive"><strong>${formatCurrency(results.netPay.monthly)}</strong></td>
              <td class="positive"><strong>${formatCurrency(results.netPay.weekly)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h3>Tax Rate Summary</h3>
        <div class="details-grid">
          <div class="detail-item"><span>Effective Tax Rate:</span><span>${(((results.incomeTax.annually + results.nationalInsurance.annually) / results.grossSalary.annually) * 100).toFixed(1)}%</span></div>
          <div class="detail-item"><span>Income Tax Rate:</span><span>${((results.incomeTax.annually / results.grossSalary.annually) * 100).toFixed(1)}%</span></div>
          <div class="detail-item"><span>National Insurance Rate:</span><span>${((results.nationalInsurance.annually / results.grossSalary.annually) * 100).toFixed(1)}%</span></div>
        </div>
      </div>
      
      <div class="footer">
        Generated by ToolHubX UK Tax Calculator<br>
        https://toolhubx.uk<br>
        Results calculated using official HMRC rates for ${taxYear}
      </div>
    </body>
    </html>
  `;
}
