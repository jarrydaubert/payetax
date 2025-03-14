'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

declare global {
  interface Window {
    gtag: (command: string, action: string, options?: { [key: string]: string | number | undefined }) => void;
  }
}

export default function SelfEmployedTaxCalculator() {
  const [income, setIncome] = useState<string>('20,000');
  const [expenses, setExpenses] = useState<string>('5,000');
  const [result, setResult] = useState<{
    profit: number;
    personalAllowance: number;
    taxableProfit: number;
    incomeTaxBreakdown: { band: string; range: string; rate: number; amount: number }[];
    incomeTax: number;
    niClass2: number;
    niClass4Breakdown: { band: string; range: string; rate: number; amount: number }[];
    niClass4: number;
    niTotal: number;
    net: number;
    paymentOnAccount: number;
    monthlyNet: number;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const trackEvent = useCallback((action: string, category: string, label?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, { event_category: category, event_label: label });
    }
  }, []);

  const formatNumber = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const parseNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

  const calculateTax = useCallback(() => {
    setError('');
    const grossIncome = parseNumber(income);
    const allowableExpenses = parseNumber(expenses);

    if (!grossIncome) {
      setError('Please enter your gross income.');
      setResult(null);
      return;
    }
    if (allowableExpenses > grossIncome) {
      setError('Expenses cannot exceed income.');
      setResult(null);
      return;
    }

    const profit = grossIncome - allowableExpenses;
    const personalAllowance = 12570;
    const taxableProfit = Math.max(0, profit - personalAllowance);
    let incomeTax = 0;
    const incomeTaxBreakdown: { band: string; range: string; rate: number; amount: number }[] = [];
    let niClass2 = 0;
    let niClass4 = 0;
    const niClass4Breakdown: { band: string; range: string; rate: number; amount: number }[] = [];

    if (taxableProfit > 0) {
      const basicRate = Math.min(taxableProfit, 50270 - personalAllowance);
      incomeTax += basicRate * 0.2;
      if (basicRate > 0) incomeTaxBreakdown.push({ band: 'Basic Rate', range: '£12,571 - £50,270', rate: 20, amount: basicRate * 0.2 });
      if (taxableProfit > 50270 - personalAllowance) {
        const higherRate = taxableProfit - (50270 - personalAllowance);
        incomeTax += higherRate * 0.4;
        incomeTaxBreakdown.push({ band: 'Higher Rate', range: 'Above £50,270', rate: 40, amount: higherRate * 0.4 });
      }
    }

    if (profit > 6725) {
      niClass2 = 3.45 * 52; // Class 2: £3.45/week
    } else {
      niClass2 = 0; // No NI if profit ≤ £6,725
    }
    if (profit > 12570) {
      const lowerBand = Math.min(profit - 12570, 50270 - 12570);
      niClass4 += lowerBand * 0.06; // Class 4: 6%
      if (lowerBand > 0) niClass4Breakdown.push({ band: 'Lower Band', range: '£12,571 - £50,270', rate: 6, amount: lowerBand * 0.06 });
      if (profit > 50270) {
        const upperBand = profit - 50270;
        niClass4 += upperBand * 0.02; // Class 4: 2%
        niClass4Breakdown.push({ band: 'Upper Band', range: 'Above £50,270', rate: 2, amount: upperBand * 0.02 });
      }
    }

    const niTotal = niClass2 + niClass4;
    const net = profit - incomeTax - niTotal;
    const paymentOnAccount = incomeTax + niTotal > 1000 ? (incomeTax + niTotal) / 2 : 0;
    const monthlyNet = net / 12;

    setResult({
      profit: parseFloat(profit.toFixed(2)),
      personalAllowance,
      taxableProfit: parseFloat(taxableProfit.toFixed(2)),
      incomeTaxBreakdown,
      incomeTax: parseFloat(incomeTax.toFixed(2)),
      niClass2: parseFloat(niClass2.toFixed(2)),
      niClass4Breakdown,
      niClass4: parseFloat(niClass4.toFixed(2)),
      niTotal: parseFloat(niTotal.toFixed(2)),
      net: parseFloat(net.toFixed(2)),
      paymentOnAccount: parseFloat(paymentOnAccount.toFixed(2)),
      monthlyNet: parseFloat(monthlyNet.toFixed(2)),
    });
    trackEvent('Calculate', 'Self-Employed Tax', `${grossIncome}, ${allowableExpenses}`);
  }, [income, expenses, trackEvent]);

  useEffect(() => {
    if (income) calculateTax();
    else setResult(null);
  }, [income, expenses, calculateTax]);

  const resetForm = useCallback(() => {
    setIncome('20,000');
    setExpenses('5,000');
    setResult(null);
    setError('');
    trackEvent('Reset', 'Self-Employed Tax');
  }, [trackEvent]);

  const handleFocus = (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (val === '20,000' || val === '5,000') setter('');
  };

  const handleBlur = (val: string, setter: React.Dispatch<React.SetStateAction<string>>, defaultVal: string) => {
    if (!val) setter(defaultVal);
    else setter(formatNumber(val));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(rawValue)) setter(formatNumber(rawValue));
  };

  return (
    <>
      <Head>
        <title>Self-Employed Tax Calculator - ToolHubX | Free UK Tax Tool</title>
        <meta
          name="description"
          content="Calculate your self-employed taxes instantly with ToolHubX. Estimate Income Tax and National Insurance for sole traders in the UK, free and easy."
        />
        <meta
          name="keywords"
          content="self-employed tax calculator, sole trader tax, UK tax tool, calculate income tax, national insurance calculator, ToolHubX"
        />
        <link rel="canonical" href="https://www.toolhubx.uk/tools/self-employed-tax-calculator" />
      </Head>
      <div className="container relative min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-100 p-2 text-center z-10 shadow-lg">
          <i className="fas fa-cookie-bite mr-2"></i>We use cookies to improve your experience.{' '}
          <a href="/privacy" className="text-blue-500 hover:underline">Learn More</a> |{' '}
          <button className="text-blue-500 hover:underline" onClick={(e) => e.currentTarget.parentElement?.remove()}>
            Accept
          </button>
        </div>
        <div className="mb-8 bg-gray-700 p-4 rounded text-center text-gray-100 shadow-md">
          <p><i className="fas fa-ad mr-2"></i>Ad Space - Support ToolHubX!</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-grow"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            <i className="fas fa-calculator mr-2 text-blue-500"></i>Self-Employed Tax Calculator
          </h1>
          <p className="mb-8 text-gray-300 text-base leading-relaxed">
            Estimate your taxes as a self-employed sole trader in the UK for 2024/25. Enter your income and expenses to see a detailed breakdown of your tax obligations, based on HMRC’s Self Assessment process—free and easy!
          </p>
          <div className="space-y-10">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-100"><i className="fas fa-info-circle mr-2 text-blue-500"></i>How to Use This Tool</h2>
              <div className="text-gray-400 text-sm space-y-4">
                <p className="leading-relaxed">
                  As a sole trader—whether you’re a freelancer, contractor, or small business owner—you must file a Self Assessment tax return (SA100) with HMRC annually if your self-employed income exceeds £1,000. This tool helps you estimate your taxes and prepare for filing, covering all income levels from low earners to high earners.
                </p>
                <ul className="list-disc pl-5 space-y-3">
                  <li><i className="fas fa-pound-sign mr-2 text-blue-500"></i><strong>Gross Income:</strong> Enter your total earnings (e.g., sales, invoices) before expenses for the tax year (6 April 2024 - 5 April 2025).</li>
                  <li><i className="fas fa-shopping-cart mr-2 text-blue-500"></i><strong>Expenses:</strong> Add allowable business costs (e.g., travel, equipment)—see <a href="https://www.gov.uk/expenses-if-youre-self-employed" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">HMRC’s list</a>.</li>
                  <li><i className="fas fa-play mr-2 text-blue-500"></i><strong>Calculate:</strong> Get an instant annual breakdown of profit, tax, and NI, plus a monthly net income estimate to manage your cash flow.</li>
                  <li><i className="fas fa-file-alt mr-2 text-blue-500"></i><strong>File:</strong> Use these figures in your SA100 form, due 31 Jan (online) or 31 Oct (paper) 2025.</li>
                  <li><i className="fas fa-money-bill-wave mr-2 text-blue-500"></i><strong>Pay:</strong> Tax and NI due 31 Jan 2025, with Payments on Account (50% twice yearly) if over £1,000.</li>
                </ul>
                <Link href="https://www.gov.uk/log-in-file-self-assessment-tax-return" className="text-blue-500 hover:underline inline-block mt-2" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-external-link-alt mr-2"></i>Register or file with HMRC
                </Link>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <label htmlFor="income" className="block text-sm font-medium mb-2 text-gray-100">
                  <i className="fas fa-pound-sign mr-2 text-blue-500"></i>Gross Income (£) <span className="ml-2 text-xs text-gray-500">Total earnings before expenses</span>
                </label>
                <input
                  id="income"
                  type="text"
                  value={income}
                  onChange={(e) => handleChange(e, setIncome)}
                  onFocus={() => handleFocus(income, setIncome)}
                  onBlur={() => handleBlur(income, setIncome, '20,000')}
                  placeholder="e.g., 20,000"
                  className={`w-full p-3 bg-gray-700 text-gray-100 border ${error ? 'border-red-500' : 'border-gray-600'} rounded focus:outline-none focus:border-blue-500 shadow-sm`}
                  aria-describedby={error ? 'tax-error' : undefined}
                />
              </div>
              <div>
                <label htmlFor="expenses" className="block text-sm font-medium mb-2 text-gray-100">
                  <i className="fas fa-shopping-cart mr-2 text-blue-500"></i>Allowable Expenses (£) <span className="ml-2 text-xs text-gray-500">Business costs (e.g., travel, equipment)</span>
                </label>
                <input
                  id="expenses"
                  type="text"
                  value={expenses}
                  onChange={(e) => handleChange(e, setExpenses)}
                  onFocus={() => handleFocus(expenses, setExpenses)}
                  onBlur={() => handleBlur(expenses, setExpenses, '5,000')}
                  placeholder="e.g., 5,000"
                  className={`w-full p-3 bg-gray-700 text-gray-100 border ${error ? 'border-red-500' : 'border-gray-600'} rounded focus:outline-none focus:border-blue-500 shadow-sm`}
                  aria-describedby={error ? 'tax-error' : undefined}
                />
              </div>
              {error && <p id="tax-error" className="mt-4 text-red-500 text-sm"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>}
              {result && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-gray-800 rounded overflow-x-auto mt-10 shadow-md border border-gray-600 relative"
                >
                  <h2 className="text-lg font-semibold mb-4 text-gray-100">
                    <i className="fas fa-table mr-2 text-blue-500"></i>Your Tax Breakdown (2024/25)
                  </h2>
                  <table className="w-full text-sm text-gray-100 border border-gray-600 table-fixed mt-20">
                    <thead>
                      <tr className="bg-gray-700 border-b border-gray-600 sticky top-20 z-10">
                        <th className="w-2/5 p-2 text-left border-r border-gray-600">Category</th>
                        <th className="w-1/5 p-2 text-right border-r border-gray-600">Yearly (£)</th>
                        <th className="w-1/5 p-2 text-right border-r border-gray-600">Monthly (£)</th>
                        <th className="w-1/5 p-2 text-right">Weekly (£)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Profit</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{result.profit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{(result.profit / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right">{(result.profit / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Personal Allowance</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{result.personalAllowance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{(result.personalAllowance / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right">{(result.personalAllowance / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Taxable Profit</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{result.taxableProfit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{(result.taxableProfit / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right">{(result.taxableProfit / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600 font-bold">Income Tax Breakdown</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600"></td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600"></td>
                        <td className="w-1/5 p-2 text-right"></td>
                      </tr>
                      {result.incomeTaxBreakdown.map((band, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="w-2/5 p-2 pl-6 border-r border-gray-600">{band.band} ({band.range})</td>
                          <td className="w-1/5 p-2 text-right border-r border-gray-600 text-red-400">{band.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                          <td className="w-1/5 p-2 text-right border-r border-gray-600 text-red-400">{(band.amount / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                          <td className="w-1/5 p-2 text-right text-red-400">{(band.amount / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Total Income Tax</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-red-400">{result.incomeTax.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-red-400">{(result.incomeTax / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right text-red-400">{(result.incomeTax / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">NI Class 2</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{result.niClass2.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{(result.niClass2 / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right text-yellow-400">{(result.niClass2 / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600 font-bold">NI Class 4 Breakdown</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600"></td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600"></td>
                        <td className="w-1/5 p-2 text-right"></td>
                      </tr>
                      {result.niClass4Breakdown.map((band, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="w-2/5 p-2 pl-6 border-r border-gray-600">{band.band} ({band.range})</td>
                          <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{band.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                          <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{(band.amount / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                          <td className="w-1/5 p-2 text-right text-yellow-400">{(band.amount / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Total NI Class 4</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{result.niClass4.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{(result.niClass4 / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right text-yellow-400">{(result.niClass4 / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Total National Insurance</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{result.niTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-yellow-400">{(result.niTotal / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right text-yellow-400">{(result.niTotal / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600 font-bold">Net Income (Annual)</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-green-400 font-bold">{result.net.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600 text-green-400 font-bold">{(result.net / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right text-green-400 font-bold">{(result.net / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="border-b border-gray-600">
                        <td className="w-2/5 p-2 border-r border-gray-600">Net Income (Monthly)</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{result.monthlyNet.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right border-r border-gray-600">{(result.monthlyNet / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        <td className="w-1/5 p-2 text-right">{(result.monthlyNet / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      {result.paymentOnAccount > 0 && (
                        <tr className="border-b border-gray-600">
                          <td className="w-2/5 p-2 border-r border-gray-600">Payments on Account</td>
                          <td className="w-1/5 p-2 text-right border-r border-gray-600 text-teal-400">{result.paymentOnAccount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                          <td className="w-1/5 p-2 text-right border-r border-gray-600 text-teal-400">{(result.paymentOnAccount / 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                          <td className="w-1/5 p-2 text-right text-teal-400">{(result.paymentOnAccount / 52).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
              <div className="flex flex-col md:flex-row gap-4 items-center mt-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetForm}
                  className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                >
                  <i className="fas fa-undo mr-2"></i>Reset
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="mt-8 bg-gray-700 p-4 rounded text-center text-gray-100 shadow-md">
          <p><i className="fas fa-ad mr-2"></i>Ad Space - Keep ToolHubX Free!</p>
        </div>
      </div>
    </>
  );
}