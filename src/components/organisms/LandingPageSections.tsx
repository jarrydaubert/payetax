// src/components/organisms/LandingPageSections.tsx
// Landing page sections: Features, How It Works, FAQ, Final CTA
// Server Component - no hooks/state/effects, maximizes SEO/LCP

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  },
  {
    question: 'Does PayeTax support Scottish tax rates?',
    answer:
      'Yes, PayeTax fully supports Scottish income tax rates. Scottish residents pay different rates set by the Scottish Parliament — select Scotland as your region.',
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
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for anchor navigation
    <section className='faq-section' id='faq'>
      <div className='section-header'>
        <div className='section-label'>FAQ</div>
        <h2 className='section-title'>Common questions</h2>
      </div>

      <div className='faq-list'>
        {faqs.map((faq) => (
          <div key={faq.question} className='faq-item'>
            <h3 className='faq-question'>{faq.question}</h3>
            <p className='faq-answer'>{faq.answer}</p>
          </div>
        ))}
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
          <ArrowRight className='h-[18px] w-[18px] transition-transform group-hover:translate-x-1' />
        </Link>
      </Button>
    </section>
  );
}

export default function LandingPageSections() {
  return (
    <>
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
