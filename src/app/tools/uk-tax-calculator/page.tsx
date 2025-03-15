'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { calculateTax, Period, TaxResult } from '@/lib/taxCalculator';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ExcelJS from 'exceljs';
import Link from 'next/link';

// Input Form Component (trimmed outputPeriod)
const InputForm = ({
  taxYear,
  setTaxYear,
  allowancesDeductions,
  setAllowancesDeductions,
  studentLoans,
  setStudentLoans,
  isMarried,
  setIsMarried,
  hoursPerWeek,
  setHoursPerWeek,
  onCalculate,
  onReset,
}: {
  taxYear: string;
  setTaxYear: React.Dispatch<React.SetStateAction<string>>;
  allowancesDeductions: string;
  setAllowancesDeductions: React.Dispatch<React.SetStateAction<string>>;
  studentLoans: string[];
  setStudentLoans: React.Dispatch<React.SetStateAction<string[]>>;
  isMarried: boolean;
  setIsMarried: React.Dispatch<React.SetStateAction<boolean>>;
  hoursPerWeek: string;
  setHoursPerWeek: React.Dispatch<React.SetStateAction<string>>;
  onCalculate: (result: TaxResult | null, error: string) => void;
  onReset: () => void;
}) => {
  const [gross, setGross] = useState<string>('0');
  const [taxCode, setTaxCode] = useState<string>('1257L');
  const [pension, setPension] = useState<string>('0');
  const [isPensionPercent, setIsPensionPercent] = useState<boolean>(true);
  const [isOverPensionAge, setIsOverPensionAge] = useState<boolean>(false);
  const [partnerSalary, setPartnerSalary] = useState<string>('0');
  const [isBlind, setIsBlind] = useState<boolean>(false);
  const [noNI, setNoNI] = useState<boolean>(false);
  const [inputPeriod, setInputPeriod] = useState<Period>('1');

  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/,/g, '')) || 0;
    return num.toLocaleString('en-GB', {
      minimumFractionDigits: value.includes('.') ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };

  const handleNumberInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    if (cleaned.split('.').length > 2) return;
    setter(cleaned ? cleaned : '0');
  };

  const handleFocus = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value === '0') setter('');
  };

  const handleBlur = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(value === '' ? '0' : formatNumber(value));
  };

  const handleStudentLoanChange = (loanType: string) => {
    setStudentLoans((prev) =>
      prev.includes(loanType) ? prev.filter((loan) => loan !== loanType) : [...prev, loanType]
    );
  };

  const calculate = useCallback(() => {
    const grossNum = parseFloat(gross.replace(/,/g, '')) || 0;
    if (grossNum <= 0) return { error: 'Please enter a salary greater than zero.' };

    const pensionNum = parseFloat(pension.replace(/,/g, '')) || 0;
    const hoursNum = parseFloat(hoursPerWeek.replace(/,/g, '')) || 0;
    const allowancesNum = parseFloat(allowancesDeductions.replace(/,/g, '')) || 0;
    const partnerNum = parseFloat(partnerSalary.replace(/,/g, '')) || 0;

    if (pensionNum < 0) return { error: 'Pension contribution cannot be negative.' };
    if (isPensionPercent && pensionNum > 100) return { error: 'Pension percentage cannot exceed 100%.' };
    if (hoursNum <= 0 && inputPeriod === '1950') return { error: 'Hours per week must be positive.' };
    if (allowancesNum < 0) return { error: 'Allowances/Deductions cannot be negative.' };

    const taxResult = calculateTax(
      grossNum,
      taxCode,
      pensionNum,
      isPensionPercent,
      studentLoans,
      taxCode.startsWith('S'),
      taxYear as '2024' | '2025',
      isOverPensionAge,
      isMarried && !taxCode.endsWith('M') && !taxCode.endsWith('N'),
      partnerNum,
      isBlind,
      noNI,
      inputPeriod,
      hoursNum,
      allowancesNum
    );
    return { result: taxResult };
  }, [gross, taxCode, pension, isPensionPercent, studentLoans, taxYear, isOverPensionAge, isMarried, partnerSalary, isBlind, noNI, inputPeriod, hoursPerWeek, allowancesDeductions]);

  useEffect(() => {
    if (gross !== '0') {
      const timeout = setTimeout(() => {
        const { result, error } = calculate();
        onCalculate(result || null, error || '');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [gross, taxCode, pension, isPensionPercent, studentLoans, taxYear, isOverPensionAge, isMarried, partnerSalary, isBlind, noNI, inputPeriod, hoursPerWeek, allowancesDeductions, calculate, onCalculate]);

  const handleResetLocal = () => {
    setGross('0');
    setTaxCode('1257L');
    setPension('0');
    setIsPensionPercent(true);
    setStudentLoans([]);
    setTaxYear('2025');
    setIsOverPensionAge(false);
    setIsMarried(false);
    setPartnerSalary('0');
    setIsBlind(false);
    setNoNI(false);
    setInputPeriod('1');
    setHoursPerWeek('37.5');
    setAllowancesDeductions('0');
    onReset();
  };

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>Tax Year 
            <span className="ml-2 text-xs text-gray-500">Choose the tax year (HMRC updates rates annually).</span>
          </label>
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            aria-label="Select tax year"
          >
            <option value="2024">2024/25</option>
            <option value="2025">2025/26</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-pound-sign mr-2 text-blue-500"></i>Gross Salary (£) 
            <span className="ml-2 text-xs text-gray-500">Your total pay before tax (per HMRC payslip).</span>
          </label>
          <input
            type="text"
            value={gross}
            onChange={(e) => handleNumberInput(e.target.value, setGross)}
            onFocus={() => handleFocus(gross, setGross)}
            onBlur={() => handleBlur(gross, setGross)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="e.g., 30,000"
            aria-label="Enter gross salary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-file-invoice mr-2 text-blue-500"></i>Tax Code 
            <span className="ml-2 text-xs text-gray-500">Your HMRC code (e.g., 1257L = £12,570 allowance).</span>
          </label>
          <input
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="e.g., 1257L"
            aria-label="Enter tax code"
          />
          {taxCode === '1257L' && <p className="text-xs text-gray-400 mt-1">1257L means £12,570 tax-free allowance.</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-piggy-bank mr-2 text-blue-500"></i>Pension Contribution 
            <span className="ml-2 text-xs text-gray-500">Reduces tax; max relief £60,000/year (HMRC).</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pension}
              onChange={(e) => handleNumberInput(e.target.value, setPension)}
              onFocus={() => handleFocus(pension, setPension)}
              onBlur={() => handleBlur(pension, setPension)}
              className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder={isPensionPercent ? "e.g., 8.4" : "e.g., 1,000"}
              aria-label="Enter pension contribution"
            />
            <select
              value={isPensionPercent ? 'percent' : 'fixed'}
              onChange={(e) => setIsPensionPercent(e.target.value === 'percent')}
              className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              aria-label="Select pension type"
            >
              <option value="percent">%</option>
              <option value="fixed">£</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-graduation-cap mr-2 text-blue-500"></i>Student Loan Plans 
            <span className="ml-2 text-xs text-gray-500">Select all that apply; repayments above thresholds (HMRC).</span>
          </label>
          <div className="flex flex-col gap-2">
            {['plan1', 'plan2', 'plan4', 'postgraduate'].map((loanType) => (
              <label key={loanType} className="flex items-center gap-2 text-sm text-gray-100">
                <input
                  type="checkbox"
                  checked={studentLoans.includes(loanType)}
                  onChange={() => handleStudentLoanChange(loanType)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                  aria-label={`Select ${loanType} student loan`}
                />
                {loanType === 'plan1' && 'Plan 1 (Pre-2012)'}
                {loanType === 'plan2' && 'Plan 2 (2012-2023)'}
                {loanType === 'plan4' && 'Plan 4 (Scotland)'}
                {loanType === 'postgraduate' && 'Postgraduate'}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-clock mr-2 text-blue-500"></i>Input Period 
            <span className="ml-2 text-xs text-gray-500">How often you\'re paid (HMRC standard).</span>
          </label>
          <select
            value={inputPeriod}
            onChange={(e) => setInputPeriod(e.target.value as Period)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            aria-label="Select input pay period"
          >
            <option value="1">Yearly</option>
            <option value="12">Monthly</option>
            <option value="13">4-Weekly</option>
            <option value="26">Fortnightly</option>
            <option value="52">Weekly</option>
            <option value="260">Daily</option>
            <option value="1950">Hourly</option>
          </select>
        </div>
        {inputPeriod === '1950' && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-100">
              <i className="fas fa-hourglass-half mr-2 text-blue-500"></i>Hours per Week 
              <span className="ml-2 text-xs text-gray-500">Adjust for part-time or full-time hourly pay.</span>
            </label>
            <input
              type="text"
              value={hoursPerWeek}
              onChange={(e) => handleNumberInput(e.target.value, setHoursPerWeek)}
              onFocus={() => handleFocus(hoursPerWeek, setHoursPerWeek)}
              onBlur={() => handleBlur(hoursPerWeek, setHoursPerWeek)}
              className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder="e.g., 37.5"
              aria-label="Enter hours per week"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-hand-holding-usd mr-2 text-blue-500"></i>Allowances / Deductions (£) 
            <span className="ml-2 text-xs text-gray-500">Reduces taxable income (e.g., work from home £312/year, HMRC).</span>
          </label>
          <input
            type="text"
            value={allowancesDeductions}
            onChange={(e) => handleNumberInput(e.target.value, setAllowancesDeductions)}
            onFocus={() => handleFocus(allowancesDeductions, setAllowancesDeductions)}
            onBlur={() => handleBlur(allowancesDeductions, setAllowancesDeductions)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="e.g., 500"
            aria-label="Enter allowances or deductions"
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isOverPensionAge}
            onChange={(e) => setIsOverPensionAge(e.target.checked)}
            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            aria-label="Over state pension age"
          />
          <label className="text-sm text-gray-100">
            <i className="fas fa-user-clock mr-2 text-blue-500"></i>Over State Pension Age 
            <span className="ml-2 text-xs text-gray-500">No NI if over 66 (HMRC).</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isMarried}
            onChange={(e) => setIsMarried(e.target.checked)}
            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            aria-label="Married or civil partnership"
          />
          <label className="text-sm text-gray-100">
            <i className="fas fa-ring mr-2 text-blue-500"></i>Married/Civil Partnership 
            <span className="ml-2 text-xs text-gray-500">May qualify for £252 allowance (HMRC).</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isBlind}
            onChange={(e) => setIsBlind(e.target.checked)}
            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            aria-label="Blind"
          />
          <label className="text-sm text-gray-100">
            <i className="fas fa-eye-slash mr-2 text-blue-500"></i>Blind 
            <span className="ml-2 text-xs text-gray-500">Extra £3,070 allowance (HMRC).</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={noNI}
            onChange={(e) => setNoNI(e.target.checked)}
            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            aria-label="No National Insurance"
          />
          <label className="text-sm text-gray-100">
            <i className="fas fa-ban mr-2 text-blue-500"></i>No National Insurance 
            <span className="ml-2 text-xs text-gray-500">Exempt from NI (HMRC rules).</span>
          </label>
        </div>
      </div>

      {isMarried && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-user-friends mr-2 text-blue-500"></i>Partner\'s Gross Wage (£) 
            <span className="ml-2 text-xs text-gray-500">Used for Marriage Allowance if below £12,570 (HMRC).</span>
          </label>
          <input
            type="text"
            value={partnerSalary}
            onChange={(e) => handleNumberInput(e.target.value, setPartnerSalary)}
            onFocus={() => handleFocus(partnerSalary, setPartnerSalary)}
            onBlur={() => handleBlur(partnerSalary, setPartnerSalary)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="e.g., 20,000"
            aria-label="Enter partner\'s gross wage"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <button
          onClick={() => {
            const { result, error } = calculate();
            onCalculate(result || null, error || '');
          }}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Calculate tax"
        >
          <i className="fas fa-calculator mr-2"></i>Recalculate
        </button>
        <button
          onClick={handleResetLocal}
          className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Reset form"
        >
          <i className="fas fa-undo mr-2"></i>Reset
        </button>
      </div>
    </>
  );
};

// Results Table Component (multi-period version)
const ResultsTable = ({
  result,
  studentLoans,
  isMarried,
  allowancesDeductions,
  hoursPerWeek,
}: {
  result: TaxResult | null;
  studentLoans: string[];
  isMarried: boolean;
  allowancesDeductions: string;
  hoursPerWeek: string;
}) => {
  const [visiblePeriods, setVisiblePeriods] = useState<string[]>(['Yearly', 'Monthly', 'Weekly', 'Daily']);

  if (!result) return null;

  const periodOptions: Record<string, number> = {
    'Yearly': 1,
    'Monthly': 12,
    '4-Weekly': 13,
    'Fortnightly': 26,
    'Weekly': 52,
    'Daily': 260,
    'Hourly': 1950 * (parseFloat(hoursPerWeek || '37.5') / 37.5),
  };

  const handlePeriodToggle = (period: string) => {
    setVisiblePeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl sticky top-0 bg-gray-800 z-10">
        <i className="fas fa-table mr-2 text-blue-500"></i>Your Payslip Summary
      </h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(periodOptions).map((period) => (
          <label key={period} className="flex items-center gap-1 text-sm text-gray-100">
            <input
              type="checkbox"
              checked={visiblePeriods.includes(period)}
              onChange={() => handlePeriodToggle(period)}
              className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            {period}
          </label>
        ))}
      </div>
      <table className="w-full text-sm text-gray-100 border border-gray-600">
        <thead>
          <tr className="bg-gray-700 border-b border-gray-600 sticky top-8 z-10">
            <th className="p-2 text-left border-r border-gray-600">Category</th>
            <th className="p-2 text-right border-r border-gray-600">%</th>
            {visiblePeriods.map((period) => (
              <th key={period} className="p-2 text-right border-r border-gray-600">{period} (£)</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-money-bill-wave mr-2"></i>Gross Pay</td>
            <td className="p-2 text-right border-r border-gray-600">100%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right border-r border-gray-600">
                {(result.gross / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-shield-alt mr-2"></i>Tax-Free Allowance</td>
            <td className="p-2 text-right border-r border-gray-600">{((result.allowance / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right border-r border-gray-600">
                {(result.allowance / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-balance-scale mr-2"></i>Total Taxable</td>
            <td className="p-2 text-right border-r border-gray-600">{((result.taxable / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right border-r border-gray-600">
                {(result.taxable / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-usd mr-2"></i>Total Tax Due</td>
            <td className="p-2 text-right border-r border-gray-600 text-red-400">{((result.tax / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-red-400 border-r border-gray-600">
                {(result.tax / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          {result.taxBreakdown.map((band, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="p-2 pl-4 border-r border-gray-600"><i className="fas fa-percentage mr-2"></i>{band.band} Rate</td>
              <td className="p-2 text-right border-r border-gray-600 text-red-400">{((band.amount / result.gross) * 100).toFixed(1)}%</td>
              {visiblePeriods.map((period) => (
                <td key={period} className="p-2 text-right text-red-400 border-r border-gray-600">
                  {(band.amount / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              ))}
            </tr>
          ))}
          {studentLoans.length > 0 && (
            <tr className="border-b border-gray-600">
              <td className="p-2 border-r border-gray-600"><i className="fas fa-graduation-cap mr-2"></i>Student Loan{studentLoans.length > 1 ? 's' : ''}</td>
              <td className="p-2 text-right border-r border-gray-600 text-orange-400">{((result.student / result.gross) * 100).toFixed(1)}%</td>
              {visiblePeriods.map((period) => (
                <td key={period} className="p-2 text-right text-orange-400 border-r border-gray-600">
                  {(result.student / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              ))}
            </tr>
          )}
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-id-card mr-2"></i>National Insurance</td>
            <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{((result.ni / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-yellow-400 border-r border-gray-600">
                {(result.ni / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-piggy-bank mr-2"></i>Pension [You]</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{((result.pension / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-purple-400 border-r border-gray-600">
                {(result.pension / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-heart mr-2"></i>Pension [HMRC Relief]</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{((result.hmrcPensionRelief / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-purple-400 border-r border-gray-600">
                {(result.hmrcPensionRelief / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          {isMarried && result.marriageAllowance !== 0 && (
            <tr className="border-b border-gray-600">
              <td className="p-2 border-r border-gray-600"><i className="fas fa-ring mr-2"></i>Marriage Allowance</td>
              <td className="p-2 text-right border-r border-gray-600 text-green-400">{((result.marriageAllowance / result.gross) * 100).toFixed(1)}%</td>
              {visiblePeriods.map((period) => (
                <td key={period} className="p-2 text-right text-green-400 border-r border-gray-600">
                  {(result.marriageAllowance / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              ))}
            </tr>
          )}
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-usd mr-2"></i>Allowances/Deductions</td>
            <td className="p-2 text-right border-r border-gray-600 text-teal-400">{((parseFloat(allowancesDeductions.replace(/,/g, '')) / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-teal-400 border-r border-gray-600">
                {(parseFloat(allowancesDeductions.replace(/,/g, '')) / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600 font-bold"><i className="fas fa-wallet mr-2"></i>Net Pay</td>
            <td className="p-2 text-right border-r border-gray-600 text-green-400 font-bold">{((result.net / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-green-400 font-bold border-r border-gray-600">
                {(result.net / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-building mr-2"></i>Employers NI</td>
            <td className="p-2 text-right border-r border-gray-600 text-gray-400">{((result.employerNI / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-gray-400 border-r border-gray-600">
                {(result.employerNI / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600 font-semibold"><i className="fas fa-exchange-alt mr-2"></i>Net Change from Previous Year</td>
            <td className="p-2 text-right border-r border-gray-600 text-blue-400 font-semibold">{((result.netChange / result.gross) * 100).toFixed(1)}%</td>
            {visiblePeriods.map((period) => (
              <td key={period} className="p-2 text-right text-blue-400 font-semibold border-r border-gray-600">
                {(result.netChange / periodOptions[period]).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Chart Display Component (unchanged, still uses outputPeriod)
const ChartDisplay = ({
  result,
  studentLoans,
  outputPeriod,
  hoursPerWeek,
}: {
  result: TaxResult | null;
  studentLoans: string[];
  outputPeriod: Period;
  hoursPerWeek: string;
}) => {
  const periodFactors: Record<Period, number> = {
    '1': 1,
    '12': 12,
    '13': 13,
    '26': 26,
    '52': 52,
    '260': 260,
    '1950': 1950 * (parseFloat(hoursPerWeek || '37.5') / 37.5),
  };

  const divisor = periodFactors[outputPeriod] || 1;

  const getChartData = () => {
    if (!result) return [];
    return [
      { name: 'Tax', value: result.tax / divisor, fill: '#f87171' },
      { name: 'NI', value: result.ni / divisor, fill: '#facc15' },
      { name: 'Pension', value: result.pension / divisor, fill: '#a78bfa' },
      { name: `Student Loan${studentLoans.length > 1 ? 's' : ''}`, value: studentLoans.length > 0 ? result.student / divisor : 0, fill: '#fb923c' },
      { name: 'Net Pay', value: result.net / divisor, fill: '#4ade80' },
    ].filter(item => item.value > 0);
  };

  if (!result) return null;

  return (
    <div className="p-4 bg-gray-800 rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100 md:text-xl">
          <i className="fas fa-chart-pie mr-2 text-blue-500"></i>Breakdown
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={getChartData()}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name}: £${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          >
            <Cell key="Tax" fill="#f87171" />
            <Cell key="NI" fill="#facc15" />
            <Cell key="Pension" fill="#a78bfa" />
            <Cell key="Student Loans" fill="#fb923c" />
            <Cell key="Net Pay" fill="#4ade80" />
          </Pie>
          <Tooltip formatter={(value) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Export Button Component (unchanged, still uses outputPeriod)
const ExportButton = ({
  result,
  allowancesDeductions,
  studentLoans,
  isMarried,
  outputPeriod,
  hoursPerWeek,
}: {
  result: TaxResult | null;
  allowancesDeductions: string;
  studentLoans: string[];
  isMarried: boolean;
  outputPeriod: Period;
  hoursPerWeek: string;
}) => {
  const periodFactors: Record<Period, number> = {
    '1': 1,
    '12': 12,
    '13': 13,
    '26': 26,
    '52': 52,
    '260': 260,
    '1950': 1950 * (parseFloat(hoursPerWeek || '37.5') / 37.5),
  };

  const divisor = periodFactors[outputPeriod] || 1;
  const periodLabel = outputPeriod === '12' ? 'Monthly' : 
                     outputPeriod === '26' ? 'Fortnightly' : 
                     outputPeriod === '52' ? 'Weekly' : 
                     outputPeriod === '260' ? 'Daily' : 
                     outputPeriod === '1950' ? 'Hourly' : 
                     outputPeriod === '13' ? '4-Weekly' : 'Yearly';

  const exportToExcel = async () => {
    if (!result) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tax Summary');

    worksheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: '%', key: 'percent', width: 10 },
      { header: 'Yearly (£)', key: 'yearly', width: 15 },
      { header: `${periodLabel} (£)`, key: 'period', width: 15 },
    ];

    worksheet.addRows([
      ['Gross Pay', `${((result.gross / result.gross) * 100).toFixed(1)}%`, result.gross, result.gross / divisor],
      ['Tax-Free Allowance', `${((result.allowance / result.gross) * 100).toFixed(1)}%`, result.allowance, result.allowance / divisor],
      ['Total Taxable', `${((result.taxable / result.gross) * 100).toFixed(1)}%`, result.taxable, result.taxable / divisor],
      ['Total Tax Due', `${((result.tax / result.gross) * 100).toFixed(1)}%`, result.tax, result.tax / divisor],
      ...result.taxBreakdown.map(band => [band.band + ' Rate', `${((band.amount / result.gross) * 100).toFixed(1)}%`, band.amount, band.amount / divisor]),
      ...(studentLoans.length > 0 ? [['Student Loan' + (studentLoans.length > 1 ? 's' : ''), `${((result.student / result.gross) * 100).toFixed(1)}%`, result.student, result.student / divisor]] : []),
      ['National Insurance', `${((result.ni / result.gross) * 100).toFixed(1)}%`, result.ni, result.ni / divisor],
      ['Pension [You]', `${((result.pension / result.gross) * 100).toFixed(1)}%`, result.pension, result.pension / divisor],
      ['Pension [HMRC Relief]', `${((result.hmrcPensionRelief / result.gross) * 100).toFixed(1)}%`, result.hmrcPensionRelief, result.hmrcPensionRelief / divisor],
      ...(isMarried && result.marriageAllowance !== 0 ? [['Marriage Allowance', `${((result.marriageAllowance / result.gross) * 100).toFixed(1)}%`, result.marriageAllowance, result.marriageAllowance / divisor]] : []),
      ['Allowances/Deductions', `${((parseFloat(allowancesDeductions.replace(/,/g, '')) / result.gross) * 100).toFixed(1)}%`, parseFloat(allowancesDeductions.replace(/,/g, '')), parseFloat(allowancesDeductions.replace(/,/g, '')) / divisor],
      ['Net Pay', `${((result.net / result.gross) * 100).toFixed(1)}%`, result.net, result.net / divisor],
      ['Employers NI', `${((result.employerNI / result.gross) * 100).toFixed(1)}%`, result.employerNI, result.employerNI / divisor],
      ['Net Change from Previous Year', `${((result.netChange / result.gross) * 100).toFixed(1)}%`, result.netChange, result.netChange / divisor],
    ]);

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell(3).numFmt = '#,##0.00';
        row.getCell(4).numFmt = '#,##0.00';
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ToolHubX_Tax_Summary.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return result ? (
    <button
      onClick={exportToExcel}
      className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      aria-label="Download Excel"
    >
      <i className="fas fa-file-excel mr-2"></i>Download Excel
    </button>
  ) : null;
};

// Glossary Component (unchanged)
const Glossary = () => (
  <div className="mt-6 p-4 bg-gray-800 rounded">
    <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl">
      <i className="fas fa-book mr-2 text-blue-500"></i>Glossary
    </h2>
    <ul className="list-disc pl-5 text-gray-100 text-sm">
      <li><strong><i className="fas fa-money-bill-wave mr-2"></i>Gross Pay</strong>: Total earnings before any deductions.</li>
      <li><strong><i className="fas fa-shield-alt mr-2"></i>Tax-Free Allowance</strong>: Amount you can earn before paying income tax (£12,570 in 2024/25).</li>
      <li><strong><i className="fas fa-balance-scale mr-2"></i>Total Taxable</strong>: Income subject to tax after allowances and deductions.</li>
      <li><strong><i className="fas fa-id-card mr-2"></i>National Insurance (NI)</strong>: Contributions for state benefits, e.g., pension, NHS.</li>
      <li><strong><i className="fas fa-graduation-cap mr-2"></i>Student Loans</strong>: Repayments deducted based on income thresholds.</li>
      <li><strong><i className="fas fa-piggy-bank mr-2"></i>Pension [You]</strong>: Your contribution to a pension scheme.</li>
      <li><strong><i className="fas fa-hand-holding-heart mr-2"></i>Pension [HMRC Relief]</strong>: Tax relief added by HMRC to your pension.</li>
      <li><strong><i className="fas fa-ring mr-2"></i>Marriage Allowance</strong>: Tax break (£252/year) if one partner earns below £12,570.</li>
      <li><strong><i className="fas fa-hand-holding-usd mr-2"></i>Allowances/Deductions</strong>: Amounts reducing taxable income (e.g., work-from-home allowance).</li>
      <li><strong><i className="fas fa-wallet mr-2"></i>Net Pay</strong>: Take-home pay after all deductions.</li>
      <li><strong><i className="fas fa-building mr-2"></i>Employers NI</strong>: NI contributions paid by your employer.</li>
      <li><strong><i className="fas fa-exchange-alt mr-2"></i>Net Change</strong>: Difference in net pay from the previous tax year.</li>
    </ul>
    <p className="mt-4 text-gray-400 text-sm">
      For more details on tax codes, see our <Link href="/tools/uk-tax-calculator/tax-codes" className="text-blue-500 hover:underline">Tax Code Guide</Link>.
    </p>
  </div>
);

// Main Page Component (updated, no outputPeriod)
export default function UKTaxCalculator() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>('2025');
  const [allowancesDeductions, setAllowancesDeductions] = useState<string>('0');
  const [studentLoans, setStudentLoans] = useState<string[]>([]);
  const [isMarried, setIsMarried] = useState<boolean>(false);
  const [hoursPerWeek, setHoursPerWeek] = useState<string>('37.5');

  const handleCalculate = useCallback((newResult: TaxResult | null, newError: string) => {
    setResult(newResult);
    setError(newError);
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return (
    <div className="container relative" suppressHydrationWarning>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-100 p-2 text-center z-10">
        <i className="fas fa-cookie-bite mr-2"></i>We use cookies to improve your experience. 
        <a href="/privacy" className="text-blue-500 hover:underline">Learn More</a> |{' '}
        <button className="text-blue-500 hover:underline" onClick={(e) => e.currentTarget.parentElement?.remove()}>
          Accept
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4 md:text-3xl" suppressHydrationWarning>
        <i className="fas fa-calculator mr-2 text-blue-500"></i>UK Tax Calculator
      </h1>
      <p className="mb-4 text-gray-400 text-sm md:text-base">
        <i className="fas fa-info-circle mr-2 text-blue-500"></i>Calculate your take-home pay for the {taxYear}/{parseInt(taxYear) + 1} tax year. Updates in real-time!
      </p>

      <InputForm
        taxYear={taxYear}
        setTaxYear={setTaxYear}
        allowancesDeductions={allowancesDeductions}
        setAllowancesDeductions={setAllowancesDeductions}
        studentLoans={studentLoans}
        setStudentLoans={setStudentLoans}
        isMarried={isMarried}
        setIsMarried={setIsMarried}
        hoursPerWeek={hoursPerWeek}
        setHoursPerWeek={setHoursPerWeek}
        onCalculate={handleCalculate}
        onReset={handleReset}
      />
      {error && <p className="mt-4 text-red-500 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</p>}
      {result && (
        <div className="mt-6">
          <ResultsTable
            result={result}
            studentLoans={studentLoans}
            isMarried={isMarried}
            allowancesDeductions={allowancesDeductions}
            hoursPerWeek={hoursPerWeek}
          />
          <ChartDisplay
            result={result}
            studentLoans={studentLoans}
            outputPeriod={'1'} // Temporary until refactored
            hoursPerWeek={hoursPerWeek}
          />
          <div className="flex justify-center mt-4">
            <ExportButton
              result={result}
              allowancesDeductions={allowancesDeductions}
              studentLoans={studentLoans}
              isMarried={isMarried}
              outputPeriod={'1'} // Temporary until refactored
              hoursPerWeek={hoursPerWeek}
            />
          </div>
        </div>
      )}

      <Glossary />
    </div>
  );
}