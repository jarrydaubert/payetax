// src/components/organisms/LandingPageSections.tsx
// Landing page sections: Proof Strip and FAQ
// Server Component - no hooks/state/effects, maximizes SEO/LCP

import { CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import {
  CURRENT_TAX_YEAR_DISPLAY_SHORT,
  formatIsoDateForDisplay,
  RATES_LAST_VERIFIED,
} from '@/constants/freshness';
import { HMRC_INCOME_TAX_RATES_URL, REVENUE_SCOTLAND_INCOME_TAX_URL } from '@/constants/sources';

export interface FAQ {
  question: string;
  answer: string;
  links?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
}

export const faqs: FAQ[] = [
  {
    question: 'Is PayeTax free to use?',
    answer:
      'Yes, PayeTax is completely free with no signup required. All features are available at no cost.',
  },
  {
    question: 'How accurate is this compared to my payslip?',
    answer:
      "PayeTax uses official HMRC tax tables - the same rates your employer's payroll system uses. Differences can come from pay period timing, benefits in kind, or employer-specific deductions.",
    links: [{ label: 'HMRC income tax rates', href: HMRC_INCOME_TAX_RATES_URL, external: true }],
  },
  {
    question: 'Does PayeTax support Scottish tax rates?',
    answer:
      'Yes, PayeTax fully supports Scottish income tax rates. Scottish residents pay different rates set by the Scottish Parliament - select Scotland as your region.',
    links: [
      {
        label: 'Revenue Scotland tax rates',
        href: REVENUE_SCOTLAND_INCOME_TAX_URL,
        external: true,
      },
    ],
  },
  {
    question: 'Does this work for self-employed or contractors?',
    answer:
      "PayeTax is built for employees on PAYE. Self-employed? You pay differently via Self Assessment. Check our blog for guides, or use HMRC's Self Assessment tools.",
  },
  {
    question: 'Is my salary data safe?',
    answer:
      'Your salary is yours alone. All calculations happen locally in your browser - nothing is sent to our servers, stored, or shared.',
  },
  {
    question: 'What deductions are included?',
    answer:
      'PayeTax calculates income tax by band, National Insurance contributions, student loan repayments, and pension contributions with tax relief.',
  },
  {
    question: 'Can I use PayeTax offline?',
    answer:
      'Yes. You can install PayeTax as an app and continue using cached pages and tools when your connection drops. Visit /install for setup steps.',
  },
];

export function FAQSection() {
  const ratesVerifiedDisplay = formatIsoDateForDisplay(RATES_LAST_VERIFIED);

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for anchor navigation
    <section className='faq-section' id='faq'>
      <div className='section-header'>
        <div className='section-label'>FAQ</div>
        <h2 className='section-title'>Common questions</h2>
        <p className='mt-2 text-muted-foreground text-sm'>
          Using official HMRC rates for {CURRENT_TAX_YEAR_DISPLAY_SHORT} (verified{' '}
          {ratesVerifiedDisplay}).
        </p>
      </div>

      <div className='faq-list'>
        {faqs.map((faq) => (
          <div key={faq.question} className='faq-item'>
            <h3 className='faq-question'>{faq.question}</h3>
            <p className='faq-answer'>
              {faq.answer}
              {faq.links?.map((link) => (
                <span key={`${faq.question}-${link.href}`}>
                  {' '}
                  <a
                    href={link.href}
                    className='underline underline-offset-2'
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                  .
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProofStrip() {
  const ratesVerifiedDisplay = formatIsoDateForDisplay(RATES_LAST_VERIFIED);

  return (
    <section className='border-border border-y bg-background py-6'>
      <div className='container mx-auto max-w-5xl px-4'>
        <div className='flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-muted-foreground text-sm'>
          <span className='flex items-center gap-2'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-brand-accent' />
            HMRC rates verified {ratesVerifiedDisplay}
          </span>
          <span className='flex items-center gap-2'>
            <Shield aria-hidden='true' className='size-4 flex-shrink-0 text-brand-accent' />
            <Link
              href='/privacy'
              className='inline-flex min-h-6 items-center underline underline-offset-2 hover:text-foreground'
            >
              Privacy policy
            </Link>
          </span>
          <span className='flex items-center gap-2'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-brand-accent' />
            <Link
              href='/compliance'
              className='inline-flex min-h-6 items-center underline underline-offset-2 hover:text-foreground'
            >
              Compliance
            </Link>
          </span>
          <span className='flex items-center gap-2'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-brand-accent' />
            All UK regions, 5 student loan plans, pensions
          </span>
        </div>
      </div>
    </section>
  );
}

export default function LandingPageSections() {
  return (
    <>
      <ProofStrip />
      <FAQSection />
    </>
  );
}
