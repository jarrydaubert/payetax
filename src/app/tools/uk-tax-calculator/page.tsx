'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { calculateTax, Period, TaxResult } from '@/lib/taxCalculator';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ExcelJS from 'exceljs';
import Link from 'next/link';

// Input Form Component
const InputForm = ({
  taxYear,
  setTaxYear,
  allowancesDeductions,
  setAllowancesDeductions,
  studentLoan,
  setStudentLoan,
  isMarried,
  setIsMarried,
  onCalculate,
  onReset,
}: {
  taxYear: string;
  setTaxYear: React.Dispatch<React.SetStateAction<string>>;
  allowancesDeductions: string;
  setAllowancesDeductions: React.Dispatch<React.SetStateAction<string>>;
  studentLoan: string;
  setStudentLoan: React.Dispatch<React.SetStateAction<string>>;
  isMarried: boolean;
  setIsMarried: React.Dispatch<React.SetStateAction<boolean>>;
  onCalculate: (result: TaxResult | null, error: string) => void;
  onReset: () => void;
}) => {
  const [gross, setGross] = useState<string>('0');
  const [taxCode, setTaxCode] = useState<string>('1257L');
  const [pension, setPension] = useState<string>('0');
  const [isPensionPercent, setIsPensionPercent] = useState<boolean>(true);
  const [region, setRegion] = useState<string>('england');
  const [isOverPensionAge, setIsOverPensionAge] = useState<boolean>(false);
  const [partnerSalary, setPartnerSalary] = useState<string>('0');
  const [isBlind, setIsBlind] = useState<boolean>(false);
  const [noNI, setNoNI] = useState<boolean>(false);
  const [period, setPeriod] = useState<Period>('1');
  const [hoursPerWeek, setHoursPerWeek] = useState<string>('37.5');

  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/,/g, '')) || 0;
    return num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const handleNumberInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    setter(cleaned ? formatNumber(cleaned) : '0');
  };

  const handleFocus = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value === '0') setter('');
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
    if (hoursNum <= 0 && period === '1950') return { error: 'Hours per week must be positive.' };
    if (allowancesNum < 0) return { error: 'Allowances/Deductions cannot be negative.' };

    const taxResult = calculateTax(
      grossNum,
      taxCode,
      pensionNum,
      isPensionPercent,
      studentLoan,
      region === 'scotland',
      taxYear as '2024' | '2025',
      isOverPensionAge,
      isMarried,
      partnerNum,
      isBlind,
      noNI,
      period,
      hoursNum,
      allowancesNum
    );
    return { result: taxResult };
  }, [gross, taxCode, pension, isPensionPercent, studentLoan, region, taxYear, isOverPensionAge, isMarried, partnerSalary, isBlind, noNI, period, hoursPerWeek, allowancesDeductions]);

  useEffect(() => {
    if (gross !== '0') {
      const timeout = setTimeout(() => {
        const { result, error } = calculate();
        onCalculate(result || null, error || '');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [gross, taxCode, pension, isPensionPercent, studentLoan, region, taxYear, isOverPensionAge, isMarried, partnerSalary, isBlind, noNI, period, hoursPerWeek, allowancesDeductions, calculate, onCalculate]);

  const handleResetLocal = () => {
    setGross('0');
    setTaxCode('1257L');
    setPension('0');
    setIsPensionPercent(true);
    setStudentLoan('none');
    setRegion('england');
    setTaxYear('2025');
    setIsOverPensionAge(false);
    setIsMarried(false);
    setPartnerSalary('0');
    setIsBlind(false);
    setNoNI(false);
    setPeriod('1');
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
            <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>Tax Region 
            <span className="ml-2 text-xs text-gray-500">Scotland has unique rates; others use UK rates (HMRC).</span>
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            aria-label="Select tax region"
          >
            <option value="england">England</option>
            <option value="wales">Wales</option>
            <option value="northernireland">Northern Ireland</option>
            <option value="scotland">Scotland</option>
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
            onBlur={() => setGross(gross === '' ? '0' : gross)}
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
              onBlur={() => setPension(pension === '' ? '0' : pension)}
              className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder={isPensionPercent ? "e.g., 5" : "e.g., 1,000"}
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
            <i className="fas fa-graduation-cap mr-2 text-blue-500"></i>Student Loan Plan 
            <span className="ml-2 text-xs text-gray-500">Repayments above thresholds (e.g., £27,295 for Plan 2, HMRC).</span>
          </label>
          <select
            value={studentLoan}
            onChange={(e) => setStudentLoan(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            aria-label="Select student loan plan"
          >
            <option value="none">None</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan4">Plan 4</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-100">
            <i className="fas fa-clock mr-2 text-blue-500"></i>Period 
            <span className="ml-2 text-xs text-gray-500">How often you’re paid (HMRC standard).</span>
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            aria-label="Select pay period"
          >
            <option value="1">Yearly</option>
            <option value="12">Monthly</option>
            <option value="13">4-Weekly</option>
            <option value="26">Fortnightly</option>
            <option value="52">Weekly</option>
            <option value="260">Daily</option>
            <option value="1950">Hourly (Full-Time)</option>
          </select>
        </div>
        {period === '1950' && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-100">
              <i className="fas fa-hourglass-half mr-2 text-blue-500"></i>Hours per Week 
              <span className="ml-2 text-xs text-gray-500">Used for hourly pay; 37.5 is full-time (HMRC).</span>
            </label>
            <input
              type="text"
              value={hoursPerWeek}
              onChange={(e) => handleNumberInput(e.target.value, setHoursPerWeek)}
              onFocus={() => handleFocus(hoursPerWeek, setHoursPerWeek)}
              onBlur={() => setHoursPerWeek(hoursPerWeek === '' ? '37.5' : hoursPerWeek)}
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
            onBlur={() => setAllowancesDeductions(allowancesDeductions === '' ? '0' : allowancesDeductions)}
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
            <i className="fas fa-user-friends mr-2 text-blue-500"></i>Partner&apos;s Gross Wage (£) 
            <span className="ml-2 text-xs text-gray-500">Used for Marriage Allowance if below £12,570 (HMRC).</span>
          </label>
          <input
            type="text"
            value={partnerSalary}
            onChange={(e) => handleNumberInput(e.target.value, setPartnerSalary)}
            onFocus={() => handleFocus(partnerSalary, setPartnerSalary)}
            onBlur={() => setPartnerSalary(partnerSalary === '' ? '0' : partnerSalary)}
            className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="e.g., 20,000"
            aria-label="Enter partner's gross wage"
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

// Results Table Component
const ResultsTable = ({
  result,
  studentLoan,
  isMarried,
  allowancesDeductions,
}: {
  result: TaxResult | null;
  studentLoan: string;
  isMarried: boolean;
  allowancesDeductions: string;
}) => {
  if (!result) return null;

  return (
    <div className="p-4 bg-gray-800 rounded overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl sticky top-0 bg-gray-800 z-10">
        <i className="fas fa-table mr-2 text-blue-500"></i>Your Payslip Summary
      </h2>
      <table className="w-full text-sm text-gray-100 border border-gray-600">
        <thead>
          <tr className="bg-gray-700 border-b border-gray-600 sticky top-8 z-10">
            <th className="p-2 text-left border-r border-gray-600">Category</th>
            <th className="p-2 text-right border-r border-gray-600">%</th>
            <th className="p-2 text-right border-r border-gray-600">Yearly (£)</th>
            <th className="p-2 text-right border-r border-gray-600">Monthly (£)</th>
            <th className="p-2 text-right">Weekly (£)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-money-bill-wave mr-2"></i>Gross Pay</td>
            <td className="p-2 text-right border-r border-gray-600">100%</td>
            <td className="p-2 text-right border-r border-gray-600">{result.gross.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600">{(result.gross / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right">{(result.gross / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-shield-alt mr-2"></i>Tax-Free Allowance</td>
            <td className="p-2 text-right border-r border-gray-600">{((result.allowance / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600">{result.allowance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600">{(result.allowance / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right">{(result.allowance / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-balance-scale mr-2"></i>Total Taxable</td>
            <td className="p-2 text-right border-r border-gray-600">{((result.taxable / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600">{result.taxable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600">{(result.taxable / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right">{(result.taxable / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-usd mr-2"></i>Total Tax Due</td>
            <td className="p-2 text-right border-r border-gray-600 text-red-400">{((result.tax / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-red-400">{result.tax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-red-400">{(result.tax / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-red-400">{(result.tax / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          {result.taxBreakdown.map((band, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="p-2 pl-4 border-r border-gray-600"><i className="fas fa-percentage mr-2"></i>{band.band} Rate</td>
              <td className="p-2 text-right border-r border-gray-600 text-red-400">{((band.amount / result.gross) * 100).toFixed(0)}%</td>
              <td className="p-2 text-right border-r border-gray-600 text-red-400">{band.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right border-r border-gray-600 text-red-400">{(band.amount / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right text-red-400">{(band.amount / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {studentLoan !== 'none' && (
            <tr className="border-b border-gray-600">
              <td className="p-2 border-r border-gray-600"><i className="fas fa-graduation-cap mr-2"></i>Student Loan</td>
              <td className="p-2 text-right border-r border-gray-600 text-orange-400">{((result.student / result.gross) * 100).toFixed(0)}%</td>
              <td className="p-2 text-right border-r border-gray-600 text-orange-400">{result.student.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right border-r border-gray-600 text-orange-400">{(result.student / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-orange-400">{(result.student / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          )}
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-id-card mr-2"></i>National Insurance</td>
            <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{((result.ni / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{result.ni.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{(result.ni / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-yellow-400">{(result.ni / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-piggy-bank mr-2"></i>Pension [You]</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{((result.pension / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{result.pension.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{(result.pension / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-purple-400">{(result.pension / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-heart mr-2"></i>Pension [HMRC Relief]</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{((result.hmrcPensionRelief / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{result.hmrcPensionRelief.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-purple-400">{(result.hmrcPensionRelief / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-purple-400">{(result.hmrcPensionRelief / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          {isMarried && result.marriageAllowance !== 0 && (
            <tr className="border-b border-gray-600">
              <td className="p-2 border-r border-gray-600"><i className="fas fa-ring mr-2"></i>Marriage Allowance</td>
              <td className="p-2 text-right border-r border-gray-600 text-green-400">{((result.marriageAllowance / result.gross) * 100).toFixed(0)}%</td>
              <td className="p-2 text-right border-r border-gray-600 text-green-400">{result.marriageAllowance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right border-r border-gray-600 text-green-400">{(result.marriageAllowance / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right text-green-400">{(result.marriageAllowance / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          )}
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-usd mr-2"></i>Allowances/Deductions</td>
            <td className="p-2 text-right border-r border-gray-600 text-teal-400">{((parseFloat(allowancesDeductions.replace(/,/g, '')) / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-teal-400">{allowancesDeductions}</td>
            <td className="p-2 text-right border-r border-gray-600 text-teal-400">{(parseFloat(allowancesDeductions.replace(/,/g, '')) / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-teal-400">{(parseFloat(allowancesDeductions.replace(/,/g, '')) / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600 font-bold"><i className="fas fa-wallet mr-2"></i>Net Pay</td>
            <td className="p-2 text-right border-r border-gray-600 text-green-400 font-bold">{((result.net / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-green-400 font-bold">{result.net.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-green-400 font-bold">{(result.net / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-green-400 font-bold">{(result.net / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-building mr-2"></i>Employers NI</td>
            <td className="p-2 text-right border-r border-gray-600 text-gray-400">{((result.employerNI / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-gray-400">{result.employerNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-gray-400">{(result.employerNI / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-gray-400">{(result.employerNI / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600 font-semibold"><i className="fas fa-exchange-alt mr-2"></i>Net Change from Previous Year</td>
            <td className="p-2 text-right border-r border-gray-600 text-blue-400 font-semibold">{((result.netChange / result.gross) * 100).toFixed(0)}%</td>
            <td className="p-2 text-right border-r border-gray-600 text-blue-400 font-semibold">{result.netChange.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right border-r border-gray-600 text-blue-400 font-semibold">{(result.netChange / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-blue-400 font-semibold">{(result.netChange / 52).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Chart Display Component
const ChartDisplay = ({
  result,
  studentLoan,
}: {
  result: TaxResult | null;
  studentLoan: string;
}) => {
  const [chartPeriod, setChartPeriod] = useState<'yearly' | 'monthly' | 'weekly'>('yearly');

  const getChartData = () => {
    if (!result) return [];
    const divisor = chartPeriod === 'yearly' ? 1 : chartPeriod === 'monthly' ? 12 : 52;
    return [
      { name: 'Tax', value: result.tax / divisor, fill: '#f87171' },
      { name: 'NI', value: result.ni / divisor, fill: '#facc15' },
      { name: 'Pension', value: result.pension / divisor, fill: '#a78bfa' },
      { name: 'Student Loan', value: studentLoan !== 'none' ? result.student / divisor : 0, fill: '#fb923c' },
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
        <select
          value={chartPeriod}
          onChange={(e) => setChartPeriod(e.target.value as 'yearly' | 'monthly' | 'weekly')}
          className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          aria-label="Select chart period"
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
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
            <Cell key="Student Loan" fill="#fb923c" />
            <Cell key="Net Pay" fill="#4ade80" />
          </Pie>
          <Tooltip formatter={(value) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Export Button Component
const ExportButton = ({
  result,
  allowancesDeductions,
  studentLoan,
  isMarried,
}: {
  result: TaxResult | null;
  allowancesDeductions: string;
  studentLoan: string;
  isMarried: boolean;
}) => {
  const exportToExcel = async () => {
    if (!result) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tax Summary');

    worksheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: '%', key: 'percent', width: 10 },
      { header: 'Yearly (£)', key: 'yearly', width: 15 },
      { header: 'Monthly (£)', key: 'monthly', width: 15 },
      { header: 'Weekly (£)', key: 'weekly', width: 15 },
    ];

    worksheet.addRows([
      ['Gross Pay', `${((result.gross / result.gross) * 100).toFixed(0)}%`, result.gross, result.gross / 12, result.gross / 52],
      ['Tax-Free Allowance', `${((result.allowance / result.gross) * 100).toFixed(0)}%`, result.allowance, result.allowance / 12, result.allowance / 52],
      ['Total Taxable', `${((result.taxable / result.gross) * 100).toFixed(0)}%`, result.taxable, result.taxable / 12, result.taxable / 52],
      ['Total Tax Due', `${((result.tax / result.gross) * 100).toFixed(0)}%`, result.tax, result.tax / 12, result.tax / 52],
      ...result.taxBreakdown.map(band => [band.band + ' Rate', `${((band.amount / result.gross) * 100).toFixed(0)}%`, band.amount, band.amount / 12, band.amount / 52]),
      ...(studentLoan !== 'none' ? [['Student Loan', `${((result.student / result.gross) * 100).toFixed(0)}%`, result.student, result.student / 12, result.student / 52]] : []),
      ['National Insurance', `${((result.ni / result.gross) * 100).toFixed(0)}%`, result.ni, result.ni / 12, result.ni / 52],
      ['Pension [You]', `${((result.pension / result.gross) * 100).toFixed(0)}%`, result.pension, result.pension / 12, result.pension / 52],
      ['Pension [HMRC Relief]', `${((result.hmrcPensionRelief / result.gross) * 100).toFixed(0)}%`, result.hmrcPensionRelief, result.hmrcPensionRelief / 12, result.hmrcPensionRelief / 52],
      ...(isMarried && result.marriageAllowance !== 0 ? [['Marriage Allowance', `${((result.marriageAllowance / result.gross) * 100).toFixed(0)}%`, result.marriageAllowance, result.marriageAllowance / 12, result.marriageAllowance / 52]] : []),
      ['Allowances/Deductions', `${((parseFloat(allowancesDeductions.replace(/,/g, '')) / result.gross) * 100).toFixed(0)}%`, parseFloat(allowancesDeductions.replace(/,/g, '')), parseFloat(allowancesDeductions.replace(/,/g, '')) / 12, parseFloat(allowancesDeductions.replace(/,/g, '')) / 52],
      ['Net Pay', `${((result.net / result.gross) * 100).toFixed(0)}%`, result.net, result.net / 12, result.net / 52],
      ['Employers NI', `${((result.employerNI / result.gross) * 100).toFixed(0)}%`, result.employerNI, result.employerNI / 12, result.employerNI / 52],
      ['Net Change from Previous Year', `${((result.netChange / result.gross) * 100).toFixed(0)}%`, result.netChange, result.netChange / 12, result.netChange / 52],
    ]);

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell(3).numFmt = '#,##0.00';
        row.getCell(4).numFmt = '#,##0.00';
        row.getCell(5).numFmt = '#,##0.00';
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

// Glossary Component
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
      <li><strong><i className="fas fa-graduation-cap mr-2"></i>Student Loan</strong>: Repayments deducted based on income thresholds.</li>
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

// Main Page Component
export default function UKTaxCalculator() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>('2025');
  const [allowancesDeductions, setAllowancesDeductions] = useState<string>('0');
  const [studentLoan, setStudentLoan] = useState<string>('none');
  const [isMarried, setIsMarried] = useState<boolean>(false);

  const handleCalculate = useCallback((newResult: TaxResult | null, newError: string) => {
    setResult(newResult);
    setError(newError);
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return (
    <div className="container relative">
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-100 p-2 text-center z-10">
        <i className="fas fa-cookie-bite mr-2"></i>We use cookies to improve your experience. 
        <a href="/privacy" className="text-blue-500 hover:underline">Learn More</a> |{' '}
        <button className="text-blue-500 hover:underline" onClick={(e) => e.currentTarget.parentElement?.remove()}>
          Accept
        </button>
      </div>

      <div className="mb-4 bg-gray-700 p-4 rounded text-center text-gray-100">
        <p><i className="fas fa-ad mr-2"></i>Ad Space - Support ToolHubX!</p>
      </div>

      <h1 className="text-2xl font-bold mb-4 md:text-3xl">
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
        studentLoan={studentLoan}
        setStudentLoan={setStudentLoan}
        isMarried={isMarried}
        setIsMarried={setIsMarried}
        onCalculate={handleCalculate}
        onReset={handleReset}
      />
      {error && <p className="mt-4 text-red-500 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</p>}
      {result && (
        <div className="mt-6">
          <ResultsTable
            result={result}
            studentLoan={studentLoan}
            isMarried={isMarried}
            allowancesDeductions={allowancesDeductions}
          />
          <ChartDisplay
            result={result}
            studentLoan={studentLoan}
          />
          <div className="flex justify-center mt-4">
            <ExportButton
              result={result}
              allowancesDeductions={allowancesDeductions}
              studentLoan={studentLoan}
              isMarried={isMarried}
            />
          </div>
        </div>
      )}

      <Glossary />

      <div className="mt-4 bg-gray-700 p-4 rounded text-center text-gray-100">
        <p><i className="fas fa-ad mr-2"></i>Ad Space - Keep ToolHubX Free!</p>
      </div>
    </div>
  );
}