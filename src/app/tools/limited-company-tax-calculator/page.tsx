'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import ResultsTable from '@/components/ltd-tax-calculator/ResultsTable';
import ChartDisplay from '@/components/ltd-tax-calculator/ChartDisplay';
import ExportButton from '@/components/ltd-tax-calculator/ExportButton';
import NextSteps from '@/components/ltd-tax-calculator/NextSteps';
import Glossary from '@/components/ltd-tax-calculator/Glossary';
import { calculateLtdTax, LtdTaxResult } from '@/lib/ltdTaxCalculator';
import { TAX_CONSTANTS } from '@/config/taxConstants';

type ExpenseItem = { name: string; amount: string };

const LimitedCompanyTaxCalculator = () => {
  const [result, setResult] = useState<LtdTaxResult | null>(null);
  const [error, setError] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>('2025');
  const [revenue, setRevenue] = useState<string>('0');
  const [expenseInput, setExpenseInput] = useState<string>('');
  const [expenseName, setExpenseName] = useState<string>('');
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>([]);
  const [salary, setSalary] = useState<string>('0');
  const [dividends, setDividends] = useState<string>('0');
  const [vatRate, setVatRate] = useState<string>('20');

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    return num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCalculate = useCallback((newResult: LtdTaxResult | null, newError: string) => {
    setResult(newResult);
    setError(newError);
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  const totalExpenses = expensesList.reduce((sum, item) => sum + (parseFloat(item.amount.replace(/,/g, '')) || 0), 0);

  const calculate = useCallback(() => {
    const revenueNum = parseFloat(revenue.replace(/,/g, '')) || 0;
    const expensesNum = totalExpenses;
    const salaryNum = parseFloat(salary.replace(/,/g, '')) || 0;
    const dividendsNum = parseFloat(dividends.replace(/,/g, '')) || 0;
    const vatRateNum = parseFloat(vatRate) || 0;
    const vatApplicable = revenueNum > TAX_CONSTANTS.VAT_THRESHOLD;

    if (revenueNum < 0 || expensesNum < 0 || salaryNum < 0 || dividendsNum < 0 || vatRateNum < 0) {
      return { result: null, error: 'All values must be positive numbers.' };
    }

    const preliminaryResult = calculateLtdTax(revenueNum, expensesNum, salaryNum, 0, vatApplicable, vatRateNum, taxYear as '2024' | '2025');
    const availableForDividends = revenueNum - expensesNum - salaryNum - preliminaryResult.corpTax - preliminaryResult.employerNI - (vatApplicable ? preliminaryResult.vat : 0);
    const adjustedDividends = Math.min(dividendsNum, Math.max(0, availableForDividends));

    const result = calculateLtdTax(revenueNum, expensesNum, salaryNum, adjustedDividends, vatApplicable, vatRateNum, taxYear as '2024' | '2025');
    return { result, error: '' };
  }, [revenue, salary, dividends, vatRate, taxYear, totalExpenses]);

  const handleNumberInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(value);
  };

  const handleBlur = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, defaultValue: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    if (!cleaned || isNaN(parseFloat(cleaned))) {
      setter(defaultValue);
      return;
    }
    setter(formatNumber(cleaned));
  };

  const handleFocus = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter('');
  };

  const handleSliderChange = (type: 'salary' | 'dividends', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (type === 'salary') setSalary(formatNumber(value));
    else setDividends(formatNumber(value));
  };

  const handleRevenueBlur = () => {
    handleBlur(revenue, setRevenue, '0');
    setSalary('0');
    setDividends('0');
  };

  const addExpense = () => {
    if (expenseInput && expenseName) {
      const cleanedAmount = expenseInput.replace(/[^0-9.]/g, '');
      if (!cleanedAmount || isNaN(parseFloat(cleanedAmount))) {
        alert('Please enter a valid annual expense amount.');
        return;
      }
      const newExpense = { name: expenseName, amount: formatNumber(cleanedAmount) };
      const updatedList = [...expensesList, newExpense];
      setExpensesList(updatedList);
      localStorage.setItem('expensesList', JSON.stringify(updatedList));
      setExpenseInput('');
      setExpenseName('');
    }
  };

  const deleteExpense = (index: number) => {
    const updatedList = expensesList.filter((_, i) => i !== index);
    setExpensesList(updatedList);
    localStorage.setItem('expensesList', JSON.stringify(updatedList));
  };

  const handleResetLocal = () => {
    setRevenue('0');
    setExpensesList([]);
    setSalary('0');
    setDividends('0');
    setVatRate('20');
    setTaxYear('2025');
    handleReset();
  };

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expensesList');
    if (savedExpenses) setExpensesList(JSON.parse(savedExpenses));
  }, []);

  return (
    <main className="min-h-screen bg-gray-800 text-gray-100">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-99DW6ZQWMT"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-99DW6ZQWMT');
        `}
      </Script>

      <header className="bg-gray-900 py-6 shadow-md">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold md:text-3xl text-center">
            <i className="fas fa-building mr-2 text-blue-500"></i>Limited Company Tax Calculator
          </h1>
          <p className="mt-2 text-sm text-gray-400 text-center">
            Estimate your company’s tax obligations for the {taxYear}/{parseInt(taxYear) + 1} tax year
          </p>
        </div>
      </header>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-100 p-4 text-center z-10 shadow-t-md">
        <i className="fas fa-cookie-bite mr-2"></i>We use cookies to improve your experience.{' '}
        <Link href="/privacy" className="text-blue-500 hover:underline">Learn More</Link> |{' '}
        <button className="text-blue-500 hover:underline" onClick={(e) => e.currentTarget.parentElement?.remove()}>
          Accept
        </button>
      </div>

      <section className="container mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-100 mb-6 shadow-md">
          <p className="text-sm"><i className="fas fa-ad mr-2"></i>Advertisement - Support ToolHubX!</p>
        </div>

        <section className="p-6 bg-gray-900 rounded-lg shadow-lg mb-6 mx-auto max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-100 md:text-2xl">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>How to Use This Calculator
          </h2>
          <div className="text-gray-300 text-sm space-y-4">
            <p className="leading-relaxed">
              Estimate your limited company’s tax obligations for the {taxYear}/{parseInt(taxYear) + 1} tax year. Enter your annual turnover, allowable expenses, director’s salary, and dividends, then click Calculate to see your tax breakdown.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><i className="fas fa-pound-sign mr-2 text-blue-500"></i><strong>Turnover:</strong> Your company’s total annual income before deductions.</li>
              <li><i className="fas fa-shopping-cart mr-2 text-blue-500"></i><strong>Expenses:</strong> Annual allowable costs—find out more at <a href="https://www.gov.uk/expenses-and-allowances-for-limited-companies" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC</a>.</li>
              <li><i className="fas fa-user-tie mr-2 text-blue-500"></i><strong>Director’s Salary:</strong> Annual salary paid to the director, adjustable with the slider.</li>
              <li><i className="fas fa-money-check-alt mr-2 text-blue-500"></i><strong>Dividends:</strong> Annual profits distributed to shareholders, adjustable with the slider.</li>
              <li><i className="fas fa-receipt mr-2 text-blue-500"></i><strong>VAT Rate:</strong> Applied if turnover exceeds £90,000; standard rate is 20%.</li>
              <li><i className="fas fa-calculator mr-2 text-blue-500"></i><strong>Calculate:</strong> Click to view your tax summary and next steps.</li>
            </ul>
            <Link href="https://www.gov.uk/topic/company-tax/corporation-tax" className="text-blue-500 hover:underline inline-block mt-2" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-external-link-alt mr-2"></i>Learn More at HMRC
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-100">
                <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>Tax Year
                <span className="ml-2 text-xs text-gray-400">Select the tax year</span>
              </label>
              <select
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                aria-label="Select tax year"
              >
                <option value="2024">2024/25</option>
                <option value="2025">2025/26</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-100">
                <i className="fas fa-pound-sign mr-2 text-blue-500"></i>Annual Turnover (£)
                <span className="ml-2 text-xs text-gray-400">Total company income</span>
              </label>
              <input
                type="text"
                value={revenue}
                onChange={(e) => handleNumberInput(e.target.value, setRevenue)}
                onFocus={() => handleFocus(setRevenue)}
                onBlur={handleRevenueBlur}
                className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder="Enter annual turnover"
                aria-label="Enter annual turnover"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-100">
                <i className="fas fa-shopping-cart mr-2 text-blue-500"></i>Allowable Expenses (£)
                <span className="ml-2 text-xs text-gray-400">Total annual costs: £{totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  onFocus={() => handleFocus(setExpenseName)}
                  className="w-full sm:w-1/2 p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  placeholder="Expense Name"
                  aria-label="Enter expense name"
                />
                <input
                  type="text"
                  value={expenseInput}
                  onChange={(e) => handleNumberInput(e.target.value, setExpenseInput)}
                  onFocus={() => handleFocus(setExpenseInput)}
                  onBlur={() => handleBlur(expenseInput, setExpenseInput, '0')}
                  className="w-full sm:w-1/2 p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  placeholder="Annual Amount"
                  aria-label="Enter annual expense amount"
                />
                <button
                  onClick={addExpense}
                  className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  aria-label="Add expense"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {expensesList.length > 0 && (
                <table className="w-full text-sm text-gray-100 border border-gray-600 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-600">
                      <th className="p-3 text-left border-r border-gray-600">Expense Name</th>
                      <th className="p-3 text-right border-r border-gray-600">Annual Amount (£)</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesList.map((item, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-800 transition duration-150">
                        <td className="p-3 border-r border-gray-600">{item.name}</td>
                        <td className="p-3 text-right border-r border-gray-600">{item.amount}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteExpense(index)}
                            className="text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 transition duration-150"
                            aria-label={`Delete ${item.name}`}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-100">
                <i className="fas fa-user-tie mr-2 text-blue-500"></i>Director’s Salary (£)
                <span className="ml-2 text-xs text-gray-400">Annual salary paid</span>
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => handleNumberInput(e.target.value, setSalary)}
                onFocus={() => handleFocus(setSalary)}
                onBlur={() => handleBlur(salary, setSalary, '0')}
                className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder="Enter annual salary"
                aria-label="Enter director’s salary"
              />
              <input
                type="range"
                min="0"
                max={parseFloat(revenue.replace(/,/g, '')) || 50000}
                step="100"
                value={parseFloat(salary.replace(/,/g, '')) || 0}
                onChange={(e) => handleSliderChange('salary', e)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2"
                style={{ accentColor: '#3b82f6' }}
                aria-label="Adjust director’s salary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-100">
                <i className="fas fa-money-check-alt mr-2 text-blue-500"></i>Dividends (£)
                <span className="ml-2 text-xs text-gray-400">Annual profits distributed</span>
              </label>
              <input
                type="text"
                value={dividends}
                onChange={(e) => handleNumberInput(e.target.value, setDividends)}
                onFocus={() => handleFocus(setDividends)}
                onBlur={() => handleBlur(dividends, setDividends, '0')}
                className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder="Enter annual dividends"
                aria-label="Enter dividends"
              />
              <input
                type="range"
                min="0"
                max={parseFloat(revenue.replace(/,/g, '')) || 50000}
                step="100"
                value={parseFloat(dividends.replace(/,/g, '')) || 0}
                onChange={(e) => handleSliderChange('dividends', e)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2"
                style={{ accentColor: '#3b82f6' }}
                aria-label="Adjust dividends"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-100">
                <i className="fas fa-percentage mr-2 text-blue-500"></i>VAT Rate (%)
                <span className="ml-2 text-xs text-gray-400">Applied if turnover exceeds £90,000</span>
              </label>
              <input
                type="text"
                value={vatRate}
                onChange={(e) => handleNumberInput(e.target.value, setVatRate)}
                onFocus={() => handleFocus(setVatRate)}
                onBlur={() => handleBlur(vatRate, setVatRate, '20')}
                className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder="Enter VAT rate"
                aria-label="Enter VAT rate"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
            <button
              onClick={() => {
                const { result, error } = calculate();
                handleCalculate(result, error);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-sm font-medium"
              aria-label="Calculate tax"
            >
              <i className="fas fa-calculator mr-2"></i>Calculate
            </button>
            <button
              onClick={handleResetLocal}
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 text-sm font-medium"
              aria-label="Reset form"
            >
              <i className="fas fa-undo mr-2"></i>Reset
            </button>
          </div>
        </section>

        {error && (
          <p className="mt-6 text-red-500 text-sm text-center">
            <i className="fas fa-exclamation-triangle mr-2"></i>{error}
          </p>
        )}
        {result && (
          <div className="mt-8 space-y-6">
            <ResultsTable result={result} taxYear={taxYear} />
            <ChartDisplay result={result} />
            <NextSteps
              result={result}
              taxYear={taxYear}
              salary={salary}
              totalExpenses={totalExpenses}
              revenue={revenue}
              vatRegistered={parseFloat(revenue.replace(/,/g, '')) > TAX_CONSTANTS.VAT_THRESHOLD}
              expensesList={expensesList}
            />
            <div className="flex justify-center">
              <ExportButton result={result} taxYear={taxYear} />
            </div>
          </div>
        )}

        <Glossary taxYear={taxYear} />
      </section>

      <footer className="bg-gray-700 p-4 rounded-lg text-center text-gray-100 mt-8 shadow-md container mx-auto px-4 sm:px-6">
        <p className="text-sm"><i className="fas fa-ad mr-2"></i>Advertisement - Keep ToolHubX Free!</p>
      </footer>
    </main>
  );
};

export default LimitedCompanyTaxCalculator;