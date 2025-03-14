'use client';

import React from 'react';
import Link from 'next/link';

export default function TaxCodeGuide() {
  return (
    <div className="container mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        <i className="fas fa-info-circle mr-2 text-blue-500"></i>Understanding UK Tax Codes: Your Guide to PAYE
      </h1>
      <p className="mb-4 text-gray-400">
        Tax codes might seem like a secret code only accountants crack, but they’re your ticket to ensuring HMRC takes the right slice of your earnings via PAYE (Pay As You Earn). From the ubiquitous 1257L to emergency codes like 1257L M1, this guide unpacks the essentials with fresh examples and insights—perfect for mastering your take-home pay with our calculator.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <i className="fas fa-question-circle mr-2 text-blue-500"></i>What Is a Tax Code?
        </h2>
        <p className="mb-4">
          Your tax code tells your employer or pension provider how much you can earn tax-free before income tax kicks in. It’s a blend of numbers (your tax-free allowance ÷ 10) and letters (your tax situation). For instance, 1257L means £12,570 tax-free in 2024/25—the UK’s most common code, used by roughly 70% of PAYE taxpayers.
        </p>
        <p className="mb-4 text-gray-300">
          Insight: Around 1 in 3 UK workers faces a tax code glitch at some point, often overpaying by £200–£1,000 annually. Our calculator helps you spot and fix that fast!
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <i className="fas fa-cogs mr-2 text-blue-500"></i>How Tax Codes Work
        </h2>
        <p className="mb-4">
          The number is your tax-free allowance divided by 10. Letters tweak it based on your circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>1257L</strong>: £12,570 tax-free—standard for most single-income folks.</li>
          <li><strong>1000L</strong>: £10,000 tax-free—perhaps reduced by taxable perks like a gym membership.</li>
          <li><strong>K400</strong>: Adds £4,000 to your taxable income (e.g., untaxed rental income).</li>
        </ul>
        <p className="mb-4">
          Emergency codes like 1257L M1 or W1 add a twist—taxing you month-by-month or week-by-week without your full year’s allowance history. It’s HMRC’s quick fix when details are missing.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <i className="fas fa-list-ul mr-2 text-blue-500"></i>Most Used Tax Codes in the UK
        </h2>
        <p className="mb-4">
          Here’s a rundown of the heavy hitters, including emergency codes, based on PAYE trends:
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-xl font-medium text-green-400"><i className="fas fa-check mr-2"></i>1257L</h3>
            <p className="text-gray-300">
              The king of codes—70% of UK workers use it. £12,570 tax-free. Example: £32,000 salary? Tax hits £19,430 (£32,000 - £12,570).
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-xl font-medium text-yellow-400"><i className="fas fa-exclamation-triangle mr-2"></i>1257L M1/W1</h3>
            <p className="text-gray-300">
              Emergency staple—used in 15% of new job starts. Monthly (M1) or weekly (W1) tax, no cumulative allowance. Example: £3,000 monthly on M1? £1,952.50 after tax vs. £2,250 with full 1257L.
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-xl font-medium text-red-400"><i className="fas fa-times mr-2"></i>BR</h3>
            <p className="text-gray-300">
              Basic Rate (20%), no allowance—common for 10% with second jobs. Example: £8,000 side hustle? £1,600 tax, no breaks.
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-xl font-medium text-blue-400"><i className="fas fa-ban mr-2"></i>0T</h3>
            <p className="text-gray-300">
              No allowance, all taxed—hits 5% of mid-year job switchers. Example: £15,000 salary? Full £15,000 taxed until corrected.
            </p>
          </div>
        </div>
        <p className="mt-4 text-gray-400">
          Stat Spotlight: Over 80% of PAYE taxpayers use 1257L or its emergency variants (M1/W1) annually, making them the backbone of UK tax collection.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <i className="fas fa-users mr-2 text-blue-500"></i>Real-Life Tax Code Tales
        </h2>
        <p className="mb-4">
          See how these codes play out:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300">
          <li><strong>Leah, Full-Time</strong>: £28,000, 1257L. Taxes £15,430, nets £23,744 after tax and NI.</li>
          <li><strong>Tom, Gig Worker</strong>: £20,000 main job (1257L), £6,000 freelance (BR). Main taxes £7,430; freelance adds £1,200 tax.</li>
          <li><strong>Raj, New Job</strong>: £36,000, 1257L M1 mid-year. Overpays £600 first month—reclaims it later.</li>
        </ul>
        <p className="mb-4">
          Plug these into our <Link href="/tools/uk-tax-calculator" className="text-blue-500 hover:underline">Tax Calculator</Link> to see the math in action!
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <i className="fas fa-exchange-alt mr-2 text-blue-500"></i>Why Tax Codes Shift
        </h2>
        <p className="mb-4">
          Your code isn’t static—here’s why it might morph:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300">
          <li><strong>Job Hopping</strong>: No P45? Emergency 1257L W1/M1 until HMRC syncs up.</li>
          <li><strong>Perks</strong>: £2,000 private healthcare? K200 bumps your taxable income.</li>
          <li><strong>Big Bucks</strong>: £130,000 salary? Allowance vanishes (0T), taxing it all.</li>
        </ul>
        <p className="mb-4">
          Insight: In 2023/24, HMRC tweaked 1.5 million codes mid-year—new jobs and perks were top culprits.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <i className="fas fa-check-circle mr-2 text-blue-500"></i>Verify Your Tax Code
        </h2>
        <p className="mb-4">
          Check your payslip, P45, or HMRC online account. Test it in our calculator to confirm it fits your earnings. Off track? Call HMRC at 0300 200 3300 or update online—could save you £100s!
        </p>
        <p className="mb-4 text-gray-300">
          Fun Fact: Last year, tax code fixes returned £800 million to UK workers—don’t let yours slip through!
        </p>
      </section>

      <div className="text-center">
        <Link href="/tools/uk-tax-calculator" className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          <i className="fas fa-arrow-left mr-2"></i>Back to Calculator
        </Link>
      </div>
    </div>
  );
}