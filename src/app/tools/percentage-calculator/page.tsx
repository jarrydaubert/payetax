'use client';

// Inline declaration with adjusted types for gtag args to allow undefined
declare global {
  interface Window {
    gtag: (command: string, action: string, options?: { [key: string]: string | number | undefined }) => void;
  }
}

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function PercentageCalculator() {
  const [value, setValue] = useState<string>('50');
  const [percentage, setPercentage] = useState<string>('20');
  const [type, setType] = useState<'portion' | 'increase' | 'decrease' | 'change' | 'find'>('portion');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);

  // GA Event Tracking Function
  const trackEvent = useCallback((action: string, category: string, label?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
  }, []);

  const calculate = useCallback(() => {
    setError('');
    const val = parseFloat(value) || 0;
    const pct = parseFloat(percentage) || 0;

    if (!val || (type !== 'change' && type !== 'find' && !pct)) {
      setError('Please enter valid numbers.');
      setResult('');
      return;
    }

    let calcResult = '';
    if (type === 'portion') {
      calcResult = `${pct}% of ${val} is ${(val * (pct / 100)).toFixed(2)}`;
    } else if (type === 'increase') {
      calcResult = `${val} increased by ${pct}% is ${(val * (1 + pct / 100)).toFixed(2)}`;
    } else if (type === 'decrease') {
      calcResult = `${val} decreased by ${pct}% is ${(val * (1 - pct / 100)).toFixed(2)}`;
    } else if (type === 'change') {
      if (val === 0) {
        setError('Base value cannot be 0 for percentage change.');
        setResult('');
        return;
      }
      calcResult = `Change from ${val} to ${pct} is ${(((pct - val) / val) * 100).toFixed(2)}%`;
    } else if (type === 'find') {
      if (val === 0) {
        setError('Total value cannot be 0 for finding percentage.');
        setResult('');
        return;
      }
      calcResult = `${pct} is ${((pct / val) * 100).toFixed(2)}% of ${val}`;
    }

    setResult(calcResult);
    setHistory((prev) => [calcResult, ...prev.slice(0, 4)]);
    trackEvent('calculate', 'Percentage Calculator', `${type}: ${val}, ${pct}`);
  }, [value, percentage, type, trackEvent]);

  useEffect(() => {
    if (value && (type === 'change' || type === 'find' ? percentage : percentage)) {
      calculate();
    } else {
      setResult('');
    }
  }, [value, percentage, type, calculate]);

  const resetForm = useCallback(() => {
    setValue('');
    setPercentage('');
    setType('portion');
    setResult('');
    setError('');
    setHistory([]);
    trackEvent('reset', 'Percentage Calculator');
  }, [trackEvent]);

  const handleFocus = (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (val === '50' || val === '20') setter('');
  };

  const handleBlur = (val: string, setter: React.Dispatch<React.SetStateAction<string>>, defaultVal: string) => {
    if (!val) setter(defaultVal);
  };

  const handlePreset = (val: string, pct: string, calcType: typeof type) => {
    setValue(val);
    setPercentage(pct);
    setType(calcType);
    trackEvent('preset', 'Percentage Calculator', `${calcType}: ${val}, ${pct}`);
  };

  return (
    <>
      <Head>
        <title>Percentage Calculator - ToolHubX | Free & Instant Percent Calculations</title>
        <meta
          name="description"
          content="Calculate percentages instantly with ToolHubX. Find portions, increases, decreases, changes, or what percent one number is of another—free, real-time, and mobile-friendly."
        />
        <meta name="keywords" content="percentage calculator, percent change, find percentage, calculate increase, decrease calculator, free online tool" />
      </Head>
      <div className="container relative flex flex-col bg-gray-900 text-gray-100">
        {/* Cookie Banner */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-100 p-2 text-center z-10">
          We use cookies to improve your experience. <a href="/privacy" className="text-blue-500 hover:underline">Learn More</a> |{' '}
          <button className="text-blue-500 hover:underline" onClick={(e) => e.currentTarget.parentElement?.remove()}>
            Accept
          </button>
        </div>

        {/* Ad Space Top */}
        <div className="mb-4 bg-gray-700 p-4 rounded text-center text-gray-100">
          <p>Ad Space - Support ToolHubX!</p>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-grow"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Percentage Calculator</h1>
          <p className="mb-4 text-gray-400 text-sm md:text-base">
            Instantly calculate percentages with ToolHubX. Find portions (e.g., 20% of 50), increases, decreases, changes (e.g., from 10 to 15), or what percent one number is of another—updates in real-time, completely free!
          </p>

          {/* Calculator Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="value" className="block text-sm font-medium mb-1 text-gray-100">
                Base Value <span className="ml-2 text-xs text-gray-500">{type === 'find' ? 'Total value for \"X is what % of Y\"' : 'Starting value for percentage'}</span>
              </label>
              <input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => handleFocus(value, setValue)}
                onBlur={() => handleBlur(value, setValue, '50')}
                placeholder="e.g., 50"
                className={`w-full p-2 bg-gray-700 text-gray-100 border ${error ? 'border-red-500' : 'border-gray-600'} rounded focus:outline-none focus:border-blue-500`}
                aria-describedby={error ? 'calc-error' : undefined}
              />
            </div>
            <div>
              <label htmlFor="percentage" className="block text-sm font-medium mb-1 text-gray-100">
                {type === 'change' ? 'New Value' : type === 'find' ? 'Part Value' : 'Percentage'}{' '}
                <span className="ml-2 text-xs text-gray-500">
                  {type === 'change' ? 'New value after change' : type === 'find' ? 'Part of the total' : 'Percentage to apply'}
                </span>
              </label>
              <input
                id="percentage"
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                onFocus={() => handleFocus(percentage, setPercentage)}
                onBlur={() => handleBlur(percentage, setPercentage, '20')}
                placeholder={type === 'change' ? 'e.g., 15' : type === 'find' ? 'e.g., 20' : 'e.g., 20'}
                className={`w-full p-2 bg-gray-700 text-gray-100 border ${error ? 'border-red-500' : 'border-gray-600'} rounded focus:outline-none focus:border-blue-500`}
                aria-describedby={error ? 'calc-error' : undefined}
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-100">
                Calculation Type <span className="ml-2 text-xs text-gray-500">Choose your percentage calculation</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="portion">Portion (X% of Y)</option>
                <option value="increase">Increase (X% more)</option>
                <option value="decrease">Decrease (X% less)</option>
                <option value="change">Change (from X to Y)</option>
                <option value="find">Find % (X is what % of Y)</option>
              </select>
            </div>
            {error && (
              <p id="calc-error" className="mt-4 text-red-500 text-sm">{error}</p>
            )}
            {result && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-800 rounded mt-6"
              >
                <p>{result}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    trackEvent('copy_result', 'Percentage Calculator', result);
                  }}
                  className="mt-2 text-blue-500 hover:underline text-sm"
                >
                  Copy Result
                </button>
              </motion.div>
            )}
            {history.length > 0 && (
              <div className="mt-6 p-4 bg-gray-800 rounded">
                <h3 className="text-lg font-semibold mb-2">Recent Calculations</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  {history.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 items-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetForm}
                className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </motion.button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <h2 className="text-lg font-semibold mb-4">Quick Tips</h2>
            <p className="text-gray-400 text-sm">
              - <strong>Discounts:</strong> Use \&quot;Decrease\&quot; for sales (e.g., 100 decreased by 25% = 75).{' '}
              <span className="text-blue-500 cursor-pointer" onClick={() => handlePreset('100', '25', 'decrease')}>
                Try it
              </span>
              <br />
              - <strong>Grades:</strong> Use \&quot;Find %\&quot; for scores (e.g., 18 out of 20 = 90%).{' '}
              <span className="text-blue-500 cursor-pointer" onClick={() => handlePreset('20', '18', 'find')}>
                Try it
              </span>
              <br />
              - <strong>Growth:</strong> Use \&quot;Change\&quot; for trends (e.g., from 200 to 250 = 25% increase).{' '}
              <span className="text-blue-500 cursor-pointer" onClick={() => handlePreset('200', '250', 'change')}>
                Try it
              </span>
            </p>
          </div>
        </motion.div>

        {/* Ad Space Bottom */}
        <div className="mt-4 bg-gray-700 p-4 rounded text-center text-gray-100">
          <p>Ad Space - Keep ToolHubX Free!</p>
        </div>
      </div>
    </>
  );
}