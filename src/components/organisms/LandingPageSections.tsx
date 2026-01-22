// src/components/organisms/LandingPageSections.tsx
// Landing page sections: Features, How It Works, FAQ, Final CTA
// Matches payetax-web design system

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: '📈',
    title: 'Complete Breakdown',
    description:
      'See exactly where your money goes - income tax by band, National Insurance, student loans, and pension contributions.',
  },
  {
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    title: 'England & Scotland',
    description:
      'Accurate calculations for both English and Scottish tax rates. Scotland has different income tax bands - we handle both.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description:
      'All calculations happen in your browser. Your salary data is never sent to our servers or stored anywhere.',
  },
  {
    icon: '🎓',
    title: 'Student Loans',
    description:
      'Support for all student loan plan types - Plan 1, Plan 2, Plan 4, Plan 5, and Postgraduate loans with correct thresholds.',
  },
  {
    icon: '💰',
    title: 'Pension Relief',
    description:
      'Calculate pension contributions and see your tax relief. Supports both salary sacrifice and relief at source schemes.',
  },
  {
    icon: '📊',
    title: 'Visual Charts',
    description:
      'Interactive charts show your tax breakdown at a glance. Understand your finances visually with clear graphics.',
  },
];

const steps = [
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
    title: 'See your results',
    description: 'Get an instant breakdown of your take-home pay with all deductions explained.',
  },
];

export const faqs = [
  {
    question: 'Is PayeTax free to use?',
    answer:
      'Yes, PayeTax is completely free with no signup required. All features are available at no cost.',
  },
  {
    question: 'How accurate is this compared to my payslip?',
    answer:
      'PayeTax uses the same HMRC tax tables your employer uses, so results should match your payslip closely. Small differences may occur due to cumulative tax calculations, benefits in kind, or employer-specific deductions not included here.',
  },
  {
    question: 'Does PayeTax support Scottish tax rates?',
    answer:
      'Yes, PayeTax fully supports Scottish income tax rates. Scottish residents pay different rates set by the Scottish Parliament - just select Scotland as your region.',
  },
  {
    question: 'Does this work for self-employed or contractors?',
    answer:
      'PayeTax is designed for PAYE employees. Self-employed individuals pay tax differently (via Self Assessment) with different NI classes and payment schedules. We recommend using HMRC tools for self-employment calculations.',
  },
  {
    question: 'Is my salary data safe?',
    answer:
      'All calculations happen entirely in your browser. Your salary and personal data are never sent to our servers, stored, or shared with anyone.',
  },
  {
    question: 'What deductions are included?',
    answer:
      'PayeTax calculates income tax (by band), National Insurance contributions, student loan repayments (all plan types), and pension contributions with tax relief.',
  },
];

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
            <div className='feature-icon'>{feature.icon}</div>
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
        Ready to see your <span className='text-gradient-new'>real take-home pay</span>?
      </h2>
      <p>Free, instant, and accurate - no signup required.</p>
      <Link
        href='#tax-calculator'
        className='group inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(6,182,212,0.3)]'
        style={{
          background: 'var(--brand-gradient-new)',
          color: 'var(--bg-deep)',
          fontSize: '1rem',
        }}
      >
        Open Calculator
        <ArrowRight className='h-[18px] w-[18px] transition-transform group-hover:translate-x-1' />
      </Link>
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
