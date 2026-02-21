// src/components/organisms/LandingPageSections.tsx
// Landing page sections: Features, How It Works, FAQ, Final CTA
// Server Component - no hooks/state/effects, maximizes SEO/LCP

import { ArrowRight } from 'lucide-react';
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
    title: 'See Where Every Pound Goes',
    description:
      'Your full breakdown: tax by band, NI, student loans, pension. Budget with confidence.',
  },
  {
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    title: 'Scottish Rates Supported',
    description:
      'Scottish residents pay different income tax rates set by the Scottish Parliament. Select your region for the right numbers.',
  },
  {
    icon: '🔒',
    title: 'Your Salary Stays Private',
    description:
      'All calculations happen locally in your browser. Your salary is never sent to our servers.',
  },
  {
    icon: '🎓',
    title: 'Student Loans',
    description:
      'All plan types supported — Plan 1, 2, 4, 5, and Postgraduate. See how much comes out each month.',
  },
  {
    icon: '💰',
    title: 'Pension Relief',
    description:
      'See the estimated difference between £0 and £1,000 pension contributions (up to ~£400 at basic rate; varies by circumstances). Supports salary sacrifice schemes.',
  },
  {
    icon: '📊',
    title: 'Understand Your Tax at a Glance',
    description:
      'See your tax breakdown in clear charts. No spreadsheets needed — know where you stand in seconds.',
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
  {
    question: 'How much tax do I pay on £30,000?',
    answer:
      'Use our £30,000 after-tax page to see PAYE deductions and monthly take-home with the same calculator logic.',
    links: [{ label: '£30,000 after tax', href: '/calculator/30000-after-tax' }],
  },
  {
    question: 'How much tax do I pay on £50,000?',
    answer:
      'Use our £50,000 after-tax page to see your income tax, National Insurance, and net pay breakdown.',
    links: [{ label: '£50,000 after tax', href: '/calculator/50000-after-tax' }],
  },
  {
    question: 'What does tax code 1257L mean?',
    answer:
      '1257L is the standard UK tax code for most employees and usually means the standard personal allowance is applied.',
    links: [{ label: 'Tax code decoder', href: '/tools/tax-code-decoder' }],
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
          Everything you need to <span className='text-gradient-new'>understand your pay</span>
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
          Three steps to <span className='text-gradient-new'>clarity</span>
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

export function TrustSection() {
  return (
    <section className='py-10'>
      <div className='container mx-auto max-w-4xl px-4'>
        <div className='mb-4 text-center'>
          <div className='section-label'>Trust</div>
          <h2 className='section-title'>Built for transparent tax calculations</h2>
        </div>
        <div className='grid gap-3 sm:grid-cols-3'>
          <a
            href='/compliance'
            className='rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:bg-muted/40'
          >
            Calculations based on official HMRC rates
          </a>
          <a
            href='/compliance'
            className='rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:bg-muted/40'
          >
            Open methodology and verification trail
          </a>
          <a
            href='/privacy'
            className='rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:bg-muted/40'
          >
            Privacy-first: your salary stays in your browser
          </a>
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  return (
    <section className='final-cta'>
      <h2>
        Stop guessing your take-home. <span className='text-gradient-new'>See it now.</span>
      </h2>
      <p>Free and fast — no signup required.</p>
      <Button asChild size='touch' variant='brandOutline' className='group rounded-xl px-8'>
        <Link href='#tax-calculator'>
          Show My Take Home Pay
          <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </Button>
    </section>
  );
}

export default function LandingPageSections() {
  return (
    <>
      <FeaturesSection />
      <TrustSection />
      <HowItWorksSection />
      <FAQSection />
      <div className='container mx-auto max-w-4xl px-4 py-10'>
        <NewsletterCTA
          title='Get TaxInsights by Email'
          description='HMRC updates, practical tax-saving tips, and important deadlines for UK employees and directors.'
        />
      </div>
      <FinalCTASection />
    </>
  );
}
