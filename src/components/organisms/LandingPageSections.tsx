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
    <section
      className='relative z-[1] border-border border-y bg-background px-4 py-16 md:py-24'
      id='faq'
    >
      <div className='mx-auto mb-8 max-w-[960px] text-left'>
        <div className='mb-3 font-semibold text-primary text-xs uppercase tracking-[0.18em]'>
          FAQ
        </div>
        <h2 className='font-display font-semibold text-4xl text-foreground leading-[0.98] md:text-6xl'>
          Common questions
        </h2>
        <p className='mt-2 text-muted-foreground text-sm'>
          Using official HMRC rates for {CURRENT_TAX_YEAR_DISPLAY_SHORT} (verified{' '}
          {ratesVerifiedDisplay}).
        </p>
      </div>

      <div className='mx-auto grid max-w-[960px] border-border border-t md:grid-cols-2 md:gap-x-8'>
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className='border-border border-b py-5 transition-colors hover:border-foreground'
          >
            <h3 className='mb-3 font-semibold text-base text-foreground'>{faq.question}</h3>
            <p className='text-muted-foreground text-sm leading-relaxed'>
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
    <section className='border-border border-y bg-background py-5'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='grid gap-3 text-muted-foreground text-sm sm:grid-cols-2 lg:grid-cols-4'>
          <span className='flex items-center gap-2 border-border border-l pl-3'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            HMRC rates verified {ratesVerifiedDisplay}
          </span>
          <span className='flex items-center gap-2 border-border border-l pl-3'>
            <Shield aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            <Link
              href='/privacy'
              className='inline-flex min-h-6 items-center underline underline-offset-2 hover:text-foreground'
            >
              Privacy policy
            </Link>
          </span>
          <span className='flex items-center gap-2 border-border border-l pl-3'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            <Link
              href='/compliance'
              className='inline-flex min-h-6 items-center underline underline-offset-2 hover:text-foreground'
            >
              Compliance
            </Link>
          </span>
          <span className='flex items-center gap-2 border-border border-l pl-3'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
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
