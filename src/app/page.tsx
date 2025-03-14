'use client';

import React from 'react';
import ToolCard from '@/components/ToolCard';

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
        Free tools with HMRC-compliant calculations to simplify your tax and financial planning. Results are estimates—consult a professional for official filings.
      </p>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}