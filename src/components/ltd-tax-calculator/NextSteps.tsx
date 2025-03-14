import React from 'react';
import Link from 'next/link';
import { LtdTaxResult } from '@/lib/ltdTaxCalculator';
import { TAX_CONSTANTS } from '@/config/taxConstants';

interface Props {
  result: LtdTaxResult | null;
  taxYear: string;
  salary: string;
  totalExpenses: number;
  revenue: string;
  vatRegistered: boolean;
  expensesList: { name: string; amount: string }[];
}

const NextSteps: React.FC<Props> = ({ result, taxYear, salary, totalExpenses, revenue, vatRegistered, expensesList }) => {
  if (!result) return null;

  const salaryNum = parseFloat(salary.replace(/,/g, '')) || 0;
  const revenueNum = parseFloat(revenue.replace(/,/g, '')) || 0;
  const pensionCredits = salaryNum >= TAX_CONSTANTS.PENSION_CREDIT_THRESHOLD;
  const accountingPeriodEnd = `31 Mar ${parseInt(taxYear) + 1}`;
  const filingDeadline = `31 Mar ${parseInt(taxYear) + 2}`;
  const paymentDeadline = `1 Jan ${parseInt(taxYear) + 2}`;
  const selfAssessmentDeadline = `31 Jan ${parseInt(taxYear) + 2}`;

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl">
        <i className="fas fa-list mr-2 text-blue-500"></i>Next Steps for Your Company
      </h2>
      <div className="text-gray-100 text-sm space-y-4">
        <div>
          <h3 className="font-bold">Set Up PAYE for Salary:</h3>
          <p><strong>Action:</strong> Register the company with HMRC as an employer if not already done.</p>
          <p><strong>Process:</strong> Pay <span className="text-xl font-bold text-green-400">£{salaryNum.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>/year (<span className="text-xl font-bold text-green-400">£{(salaryNum / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>/month) via payroll, reporting monthly via Real Time Information (RTI). {salaryNum < TAX_CONSTANTS.PERSONAL_ALLOWANCE ? 'No Employee NI or Income Tax due (below £12,570).' : 'Check NI and tax obligations.'}</p>
          <p><strong>Deadline:</strong> Before the first payroll run (e.g., April {taxYear} for {taxYear}/{parseInt(taxYear) + 1} tax year).</p>
          <p><Link href="https://www.gov.uk/register-employer" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC PAYE Registration</Link></p>
        </div>
        <div>
          <h3 className="font-bold">Claim and Record Expenses:</h3>
          <p><strong>Action:</strong> Log <span className="text-xl font-bold text-green-400">£{totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in {taxYear}/{parseInt(taxYear) + 1} expenses:</p>
          {expensesList.length > 0 ? (
            <ul className="list-disc pl-5">
              {expensesList.map((item, index) => (
                <li key={index}>{item.name}: £{parseFloat(item.amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
              ))}
            </ul>
          ) : (
            <p>No expenses added yet.</p>
          )}
          <p><strong>Process:</strong> Keep receipts/invoices and record in accounting software or a spreadsheet.</p>
          <p><strong>Deadline:</strong> Ongoing, finalized by accounting period end (e.g., {accountingPeriodEnd}).</p>
        </div>
        <div>
          <h3 className="font-bold">Distribute Dividends:</h3>
          <p><strong>Action:</strong> Declare <span className="text-xl font-bold text-green-400">£{result.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> dividends after profit confirmation.</p>
          <p><strong>Process:</strong> Hold a board meeting (even as sole director), issue dividend vouchers, and pay yourself <span className="text-xl font-bold text-green-400">£{result.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (<span className="text-xl font-bold text-green-400">£{(result.netProfit / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>/month). Report <span className="text-xl font-bold text-green-400">£{result.dividendTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> Dividend Tax on your personal Self Assessment.</p>
          <p><strong>Deadline:</strong> After Corporation Tax payment, typically mid-year (e.g., December {taxYear}).</p>
          <p><Link href="https://www.gov.uk/log-in-file-self-assessment-tax-return" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC Self Assessment</Link></p>
        </div>
        <div>
          <h3 className="font-bold">File Company Taxes:</h3>
          <p><strong>Action:</strong> Submit CT600 with <span className="text-xl font-bold text-green-400">£{result.profit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> profit, <span className="text-xl font-bold text-green-400">£{result.corpTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> Corporation Tax.</p>
          <p><strong>Process:</strong> File online via HMRC’s Corporation Tax service within 12 months of the accounting period end (e.g., {filingDeadline} for a {accountingPeriodEnd} period).</p>
          <p><strong>Payment:</strong> Pay <span className="text-xl font-bold text-green-400">£{result.corpTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> by 9 months + 1 day after period end (e.g., {paymentDeadline}).</p>
          <p><strong>Deadline:</strong> Filing by {filingDeadline}, payment by {paymentDeadline}.</p>
          <p><Link href="https://www.gov.uk/file-your-company-accounts-and-tax-return" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC CT600</Link></p>
        </div>
        <div>
          <h3 className="font-bold">File Personal Self Assessment:</h3>
          <p><strong>Action:</strong> Report <span className="text-xl font-bold text-green-400">£{salaryNum.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> salary {pensionCredits ? '(earns pension credits)' : '(no pension credits, needs £6,396+)'} and <span className="text-xl font-bold text-green-400">£{result.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> dividends, paying <span className="text-xl font-bold text-green-400">£{result.dividendTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> Dividend Tax.</p>
          <p><strong>Process:</strong> Register for Self Assessment if new, file online by {selfAssessmentDeadline}.</p>
          <p><strong>Deadline:</strong> {selfAssessmentDeadline} (online filing and payment).</p>
          <p><Link href="https://www.gov.uk/log-in-file-self-assessment-tax-return" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC Self Assessment</Link></p>
        </div>
        {vatRegistered && (
          <div>
            <h3 className="font-bold">File VAT Returns:</h3>
            <p><strong>Action:</strong> Submit quarterly VAT returns for <span className="text-xl font-bold text-green-400">£{result.vat.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.</p>
            <p><strong>Process:</strong> File online via HMRC’s VAT service, typically due one month after each quarter.</p>
            <p><strong>Deadline:</strong> Quarterly, based on your VAT period (e.g., 31 Jul {taxYear} for Apr-Jun).</p>
            <p><Link href="https://www.gov.uk/vat-returns" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC VAT Returns</Link></p>
          </div>
        )}
        {!vatRegistered && revenueNum > TAX_CONSTANTS.VAT_THRESHOLD && (
          <div>
            <h3 className="font-bold">Register for VAT:</h3>
            <p><strong>Action:</strong> Turnover exceeds £90,000 (<span className="text-xl font-bold text-green-400">£{revenueNum.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>). Register for VAT with HMRC.</p>
            <p><strong>Process:</strong> Apply online and start charging VAT on invoices once registered.</p>
            <p><strong>Deadline:</strong> Within 30 days of exceeding £90,000 turnover.</p>
            <p><Link href="https://www.gov.uk/vat-registration" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC VAT Registration</Link></p>
          </div>
        )}
        <div>
          <h3 className="font-bold">Maintain Records:</h3>
          <p><strong>Action:</strong> Keep records of revenue (<span className="text-xl font-bold text-green-400">£{revenueNum.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>), expenses (<span className="text-xl font-bold text-green-400">£{totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>), payroll, and dividends for 6 years.</p>
          <p><strong>Process:</strong> Use digital tools or physical files, ensuring compliance with HMRC record-keeping rules.</p>
        </div>
      </div>
    </div>
  );
};

export default NextSteps;