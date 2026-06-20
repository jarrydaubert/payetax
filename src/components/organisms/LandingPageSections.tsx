// src/components/organisms/LandingPageSections.tsx
// Landing page sections: Proof Strip and FAQ
// Server Component - no hooks/state/effects, maximizes SEO/LCP

import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  CURRENT_TAX_YEAR_DISPLAY_SHORT,
  formatIsoDateForDisplay,
  RATES_LAST_VERIFIED,
} from '@/constants/freshness';
import { TOOLS } from '@/constants/pages/toolsData';
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
    question: 'How accurate is this compared to my payslip?',
    answer:
      "PayeTax uses the official HMRC tax tables your employer's payroll runs on, so the annual figures line up. Small differences usually come from pay-period timing, benefits in kind, or employer-specific deductions we can't see.",
    links: [{ label: 'HMRC income tax rates', href: HMRC_INCOME_TAX_RATES_URL, external: true }],
  },
  {
    question: 'Does it support Scottish tax rates?',
    answer:
      'Yes. Choose Scotland as your region and the calculator applies the Scottish income tax bands set by the Scottish Parliament, which differ from the rest of the UK.',
    links: [
      {
        label: 'Revenue Scotland tax rates',
        href: REVENUE_SCOTLAND_INCOME_TAX_URL,
        external: true,
      },
    ],
  },
  {
    question: 'Does it work for self-employed or contractors?',
    answer:
      "No - PayeTax models PAYE for employees. Self-employed income is taxed through Self Assessment, which works differently. Our blog has guides, or use HMRC's Self Assessment tools directly.",
  },
  {
    question: 'What does the calculation include?',
    answer:
      'Income tax by band, National Insurance, student loan repayments across all five plans, and pension contributions with tax relief - broken down across every pay period.',
  },
  {
    question: 'Can I use it offline?',
    answer:
      'Yes. Install PayeTax as an app and it keeps working from cache when your connection drops.',
    links: [{ label: 'Install guide', href: '/install', external: false }],
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
        <div className='flex flex-col items-center gap-x-8 gap-y-2.5 text-center text-muted-foreground text-sm sm:flex-row sm:flex-wrap sm:justify-center'>
          <span className='flex items-center gap-2'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            HMRC rates verified {ratesVerifiedDisplay}
          </span>
          <span className='flex items-center gap-2'>
            <Shield aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            <Link
              href='/privacy'
              className='inline-flex min-h-6 items-center underline underline-offset-2 hover:text-foreground'
            >
              Privacy policy
            </Link>
          </span>
          <span className='flex items-center gap-2'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            <Link
              href='/compliance'
              className='inline-flex min-h-6 items-center underline underline-offset-2 hover:text-foreground'
            >
              Compliance
            </Link>
          </span>
          <span className='flex items-center gap-2'>
            <CheckCircle aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
            All UK regions, 5 student loan plans, pensions
          </span>
        </div>
      </div>
    </section>
  );
}

export function ToolsDirectory() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for anchor navigation
    <section className='relative z-[1] bg-background px-4 py-16 md:py-24' id='tools'>
      <div className='mx-auto mb-8 max-w-[960px] text-left'>
        <div className='mb-3 font-semibold text-primary text-xs uppercase tracking-[0.18em]'>
          More tools
        </div>
        <h2 className='font-display font-semibold text-4xl text-foreground leading-[0.98] md:text-6xl'>
          Go deeper than take-home
        </h2>
        <p className='mt-2 text-muted-foreground text-sm'>
          Specialised UK tax tools, built on the same official HMRC rates as the calculator above.
        </p>
      </div>

      <div className='mx-auto grid max-w-[960px] gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href as Route}
            data-testid={`home-tool-${tool.href.split('/').pop()}`}
            className='group block h-full'
          >
            <Card className='flex h-full flex-col rounded-sm border-border bg-card p-5 transition-colors hover:border-primary/55'>
              <div className='mb-2 flex items-center gap-2'>
                <tool.icon aria-hidden='true' className='size-4 flex-shrink-0 text-primary' />
                <h3 className='font-display font-semibold text-foreground text-lg group-hover:text-primary'>
                  {tool.title}
                </h3>
              </div>
              <p className='text-muted-foreground text-sm leading-relaxed'>{tool.description}</p>
              <span className='mt-4 inline-flex items-center gap-1 font-medium text-primary text-sm'>
                Open tool
                <ArrowRight className='size-4' aria-hidden='true' />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function LandingPageSections() {
  return (
    <>
      <ProofStrip />
      <ToolsDirectory />
      <FAQSection />
    </>
  );
}
