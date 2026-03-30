// src/components/organisms/LandingPageSections.tsx
// Landing page sections: How It Works, Proof Strip, Features, Director Spotlight, FAQ, Newsletter
// Server Component - no hooks/state/effects, maximizes SEO/LCP

import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { Button } from '@/components/ui/button';
import {
  CURRENT_TAX_YEAR_DISPLAY_SHORT,
  formatIsoDateForDisplay,
  RATES_LAST_VERIFIED,
} from '@/constants/freshness';
import { HMRC_INCOME_TAX_RATES_URL, REVENUE_SCOTLAND_INCOME_TAX_URL } from '@/constants/sources';

// ============================================================================
// Types for content arrays (enables type safety and JSON-LD generation)
// ============================================================================

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
  links?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
}

// ============================================================================
// Content Data
// ============================================================================

const features: Feature[] = [
  {
    icon: '📈',
    title: 'Know Where Every Pound Goes',
    description:
      'Full breakdown by tax band, National Insurance, student loans, and pension — so you can budget with confidence.',
  },
  {
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    title: 'Accurate for All UK Regions',
    description:
      'Scottish, Welsh, and English rates built in. Select your region and get the right numbers instantly.',
  },
  {
    icon: '🎓',
    title: 'See Your Real Take-Home After Loans',
    description:
      'Student loan Plans 1, 2, 4, 5, and Postgraduate all supported. Know exactly what lands in your account.',
  },
  {
    icon: '💰',
    title: 'Spot Your Pension Tax Savings',
    description:
      'See how much pension contributions could save you in tax — including salary sacrifice schemes.',
  },
];

const steps: Step[] = [
  {
    number: 1,
    title: 'Enter your salary',
    description: 'Type your annual, monthly, or weekly salary. Choose your tax year and region.',
  },
  {
    number: 2,
    title: 'Add your details',
    description: 'Optionally add your tax code, student loan plan, and pension contributions.',
  },
  {
    number: 3,
    title: 'See your take-home',
    description: 'Get an instant breakdown of your take-home pay with all deductions explained.',
  },
];

export const faqs: FAQ[] = [
  {
    question: 'Is PayeTax free to use?',
    answer:
      'Yes, PayeTax is completely free with no signup required. All features are available at no cost.',
  },
  {
    question: 'How accurate is this compared to my payslip?',
    answer:
      "PayeTax uses official HMRC tax tables — the same rates your employer's payroll system uses. Differences can come from pay period timing, benefits in kind, or employer-specific deductions.",
    links: [{ label: 'HMRC income tax rates', href: HMRC_INCOME_TAX_RATES_URL, external: true }],
  },
  {
    question: 'Does PayeTax support Scottish tax rates?',
    answer:
      'Yes, PayeTax fully supports Scottish income tax rates. Scottish residents pay different rates set by the Scottish Parliament — select Scotland as your region.',
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
      'Your salary is yours alone. All calculations happen locally in your browser — nothing is sent to our servers, stored, or shared.',
  },
  {
    question: 'What deductions are included?',
    answer:
      'PayeTax calculates income tax (by band), National Insurance contributions, student loan repayments (all plan types), and pension contributions with tax relief.',
  },
  {
    question: 'Can I use PayeTax offline?',
    answer:
      'Yes. You can install PayeTax as an app and continue using cached pages and tools when your connection drops. Visit /install for setup steps.',
  },
];

// ============================================================================
// Section Components
// ============================================================================

export function FeaturesSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for anchor navigation
    <section className='features-section' id='features'>
      <div className='section-header'>
        <div className='section-label'>Features</div>
        <h2 className='section-title'>
          Everything you need to <span className='text-gradient-brand'>understand your pay</span>
        </h2>
      </div>

      <div className='features-grid'>
        {features.map((feature) => (
          <div key={feature.title} className='feature-card'>
            {/* Emoji is decorative - screen readers should skip it */}
            <div className='feature-icon' aria-hidden='true'>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className='how-section'>
      <div className='section-header'>
        <div className='section-label'>How It Works</div>
        <h2 className='section-title'>
          Three steps to <span className='text-gradient-brand'>clarity</span>
        </h2>
      </div>

      <div className='steps-grid'>
        {steps.map((step) => (
          <div key={step.number} className='step-card'>
            <div className='step-number'>{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

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
    <section className='py-8'>
      <div className='container mx-auto max-w-4xl px-4'>
        <div className='flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-muted-foreground text-sm'>
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

export function DirectorSpotlight() {
  return (
    <section className='relative z-[1] px-4 py-24 sm:px-8'>
      <div className='mx-auto max-w-3xl text-center'>
        <div className='section-label'>For Directors</div>
        <h2 className='section-title mb-4'>
          Find your optimal <span className='text-gradient-brand'>salary and dividend split</span>
        </h2>
        <p className='mx-auto mb-8 max-w-2xl text-muted-foreground'>
          Director Intelligence calculates the most tax-efficient way to extract income from your
          company — comparing all-salary, balanced, and all-dividend strategies with corporation tax
          and National Insurance factored in.
        </p>
        <Button asChild size='touch' variant='brandOutline' className='group rounded-xl px-8'>
          <Link href='/tools/director-guide'>
            Open Director Intelligence
            <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default function LandingPageSections() {
  return (
    <>
      <HowItWorksSection />
      <ProofStrip />
      <FeaturesSection />
      <DirectorSpotlight />
      <FAQSection />
      <div className='container mx-auto max-w-4xl px-4 py-10'>
        <NewsletterCTA
          title='Get TaxInsights by Email'
          description='HMRC updates, practical tax-saving tips, and important deadlines for UK employees and directors.'
        />
      </div>
    </>
  );
}
