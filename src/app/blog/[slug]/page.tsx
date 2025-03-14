'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const blogPosts = [
  {
    slug: 'how-to-estimate-limited-company-taxes',
    title: 'How to Estimate Your Limited Company Taxes in 5 Minutes',
    content: (
      <>
        <p>Running a limited company in the UK means juggling Corporation Tax, National Insurance Contributions (NICs), and possibly VAT if your turnover exceeds £90,000. Sound daunting? It doesn’t have to be. With ToolHubX’s free <Link href="/tools/limited-company-tax-calculator" className="text-blue-500 hover:underline">Limited Company Tax Calculator</Link>, you can estimate your taxes in five minutes—here’s how.</p>
        <p>First, gather your company’s annual turnover—say, £50,000. Subtract allowable expenses like office costs (£5,000). Set a director’s salary—£12,570 aligns with the 2025/26 Personal Allowance for tax efficiency. Then, decide on dividends, maybe £10,000 from profits. Plug these into the calculator: £50,000 turnover, £5,000 expenses, £12,570 salary, £10,000 dividends, and a 20% VAT rate (if applicable). Hit {"Calculate"} and get:</p>
        <ul className="list-disc pl-5">
          <li><strong>Corporation Tax:</strong> £6,586 (20% of £32,930 profit).</li>
          <li><strong>Employer NICs:</strong> £1,135 (15% above £5,000).</li>
          <li><strong>Dividend Tax:</strong> £90 (9% above £900 allowance).</li>
          <li><strong>Net Profit:</strong> £24,119 after taxes.</li>
        </ul>
        <p>These figures use HMRC’s 2025/26 rates, giving you a solid estimate—though not a replacement for professional advice. Try it at <Link href="/tools/limited-company-tax-calculator" className="text-blue-500 hover:underline">toolhubx.uk</Link> and email <a href="mailto:support@toolhubx.uk" className="text-blue-500 hover:underline">support@toolhubx.uk</a> with questions!</p>
      </>
    ),
  },
  {
    slug: 'self-employed-taxes-3-step-guide',
    title: 'Self-Employed Taxes: A 3-Step Guide',
    content: (
      <>
        <p>As a self-employed sole trader, taxes like Income Tax and National Insurance Contributions (NICs) can feel tricky. ToolHubX’s free <Link href="/tools/self-employed-tax-calculator" className="text-blue-500 hover:underline">Self-Employed Tax Calculator</Link> makes it a breeze—here’s a 3-step guide.</p>
        <p><strong>Step 1:</strong> Calculate profit—total income minus expenses. Earn £40,000 and spend £8,000 on costs (e.g., travel)? That’s £32,000 profit. <strong>Step 2:</strong> Apply tax rates. For 2025/26, £12,570 is tax-free (Personal Allowance), so £19,430 is taxable at 20% (£3,886). Add NICs: Class 2 (£179.40/year) and Class 4 (9% on £19,430, £1,748.70). Total tax: £5,814.10. <strong>Step 3:</strong> Check your take-home—£32,000 - £5,814.10 = £26,185.90.</p>
        <p>Enter £40,000 income and £8,000 expenses into the calculator, click {"Calculate"}, and see the breakdown instantly. It’s HMRC-compliant for estimates—not official filings—so consult an accountant for the real deal. Test it at <Link href="/tools/self-employed-tax-calculator" className="text-blue-500 hover:underline">toolhubx.uk</Link> and reach out to <a href="mailto:support@toolhubx.uk" className="text-blue-500 hover:underline">support@toolhubx.uk</a> for feedback!</p>
      </>
    ),
  },
  {
    slug: 'understanding-uk-personal-taxes',
    title: 'Understanding Your UK Personal Taxes in Minutes',
    content: (
      <>
        <p>Paying personal taxes in the UK involves Income Tax and National Insurance Contributions (NICs)—but how much do you owe? ToolHubX’s free <Link href="/tools/uk-tax-calculator" className="text-blue-500 hover:underline">UK Personal Tax Calculator</Link> gives you an answer fast—here’s the rundown.</p>
        <p>Say you earn £35,000 annually. For 2025/26, the Personal Allowance is £12,570, leaving £22,430 taxable. Income Tax at 20% is £4,486. NICs kick in above £9,100 at 12% (£3,159.60 on £26,330), dropping to 2% above £50,270 (none here). Total tax: £7,645.60, netting £27,354.40 after tax.</p>
        <p>Input £35,000 into the calculator, hit {"Calculate"}, and get this breakdown in seconds. It’s built with HMRC’s latest rates for quick estimates—not a substitute for professional advice. Try it at <Link href="/tools/uk-tax-calculator" className="text-blue-500 hover:underline">toolhubx.uk</Link>, and let us know your thoughts at <a href="mailto:support@toolhubx.uk" className="text-blue-500 hover:underline">support@toolhubx.uk</a>!</p>
      </>
    ),
  },
];

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-800 text-gray-100">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold mb-6 md:text-3xl text-gray-100">{post.title}</h1>
        <article className="prose prose-invert prose-lg prose-gray max-w-none space-y-6">
          {post.content}
        </article>
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}