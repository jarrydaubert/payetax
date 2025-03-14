'use client';

import React from 'react';
import ToolCard from '@/components/ToolCard';
import Link from 'next/link';

export default function Home() {
  const tools = [
    { slug: 'uk-tax-calculator', title: 'UK Personal Tax Calculator', description: 'Easily calculate your Income Tax and National Insurance Contributions.', icon: 'fa-calculator' },
    { slug: 'limited-company-tax-calculator', title: 'Limited Company Tax Calculator', description: 'Estimate your company’s Corporation Tax and dividends.', icon: 'fa-building' },
    { slug: 'self-employed-tax-calculator', title: 'Self-Employed Tax Calculator', description: 'Compute your tax obligations as a sole trader.', icon: 'fa-user-tie' },
    { slug: 'percentage-calculator', title: 'Percentage Calculator', description: 'Quickly work out percentages for any amount.', icon: 'fa-percentage' },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold mb-4 md:text-3xl text-gray-100 text-center">
        <i className="fas fa-tools mr-2 text-blue-500"></i>Welcome to ToolHubX
      </h1>
      <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
        Free, HMRC-compliant tax calculators to simplify your financial planning. Results are estimates—consult a professional for official filings.
      </p>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} {...tool} />
        ))}
      </div>
      <div className="text-center bg-gray-900 rounded-lg shadow-md mx-auto max-w-[700px] h-[300px] p-6 lg:p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Latest Tax Tips</h2>
        <div className="flex flex-col gap-4 items-center h-[calc(100%-2.5rem)] justify-center">
          <Link
            href="/blog/how-to-estimate-limited-company-taxes"
            className="block w-full max-w-md px-4 py-3 text-blue-500 hover:text-blue-400 bg-gray-800 rounded-md hover:bg-gray-700 transition duration-150 text-base font-medium"
          >
            How to Estimate Your Limited Company Taxes in 5 Minutes
          </Link>
          <Link
            href="/blog/self-employed-taxes-3-step-guide"
            className="block w-full max-w-md px-4 py-3 text-blue-500 hover:text-blue-400 bg-gray-800 rounded-md hover:bg-gray-700 transition duration-150 text-base font-medium"
          >
            Self-Employed Taxes: A 3-Step Guide
          </Link>
          <Link
            href="/blog/understanding-uk-personal-taxes"
            className="block w-full max-w-md px-4 py-3 text-blue-500 hover:text-blue-400 bg-gray-800 rounded-md hover:bg-gray-700 transition duration-150 text-base font-medium"
          >
            Understanding Your UK Personal Taxes in Minutes
          </Link>
        </div>
      </div>
    </div>
  );
}