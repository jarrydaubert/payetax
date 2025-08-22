// src/components/pages/HomePageContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import { getCurrentTaxYearLabel, getTaxRateDescription } from '@/lib/taxRateDescriptions';
import SimpleHero from '@/components/organisms/SimpleHero';
import CalculatorSection from '@/components/organisms/CalculatorSection';
import Script from 'next/script';

export default function HomePageContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCalculatorFullScreen, setIsCalculatorFullScreen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollToCalculator = () => {
    setIsCalculatorFullScreen(true);
    const calculatorElement = document.getElementById('calculator');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      
      <SimpleHero onScrollToCalculator={handleScrollToCalculator} />

      <section id="calculator">
        <CalculatorSection isFullScreen={isCalculatorFullScreen} />
      </section>

      {/* FAQ Section for SEO - Long-tail keywords and voice search */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-heading font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-large text-white/90">
              Get answers to common UK tax questions
            </p>
          </div>

          <div className="grid gap-6">
            {/* FAQ Items optimized for voice search and long-tail keywords */}
            <div className="glass p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-3 text-large">
                How do I calculate my take-home pay after tax in the UK?
              </h3>
              <p className="text-white/90">
                To calculate your take-home pay, subtract income tax, National Insurance contributions, student loan repayments (if applicable), and pension contributions from your gross salary. Our free UK tax calculator uses the latest HMRC rates for {getCurrentTaxYearLabel()} to give you accurate results instantly.
              </p>
            </div>

            <div className="glass p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-3 text-large">
                What tax rates apply in the UK for 2025-2026?
              </h3>
              <p className="text-white/90">
                {getTaxRateDescription('2025-2026')}
              </p>
            </div>

            <div className="glass p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-3 text-large">
                Is this UK tax calculator free to use?
              </h3>
              <p className="text-white/90">
                Yes, our UK tax calculator is completely free with no registration required. We don't store your personal data and all calculations happen in your browser for maximum privacy. Perfect for PAYE employees, self-employed individuals, and contractors.
              </p>
            </div>

            <div className="glass p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-3 text-large">
                How accurate are the tax calculations?
              </h3>
              <p className="text-white/90">
                Our calculator uses official HMRC tax rates and thresholds for {getCurrentTaxYearLabel()}, making it highly accurate for most situations. However, it provides estimates for guidance only and shouldn't replace professional tax advice for complex circumstances.
              </p>
            </div>

            <div className="glass p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-3 text-large">
                Is this calculator suitable for employed individuals?
              </h3>
              <p className="text-white/90">
                Our calculator is designed specifically for PAYE employees (employed individuals). It calculates income tax, National Insurance, student loan repayments, and pension contributions based on your salary and tax code - perfect for understanding your payslip and take-home pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Structured Data for SEO */}
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do I calculate my take-home pay after tax in the UK?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `To calculate your take-home pay, subtract income tax, National Insurance contributions, student loan repayments (if applicable), and pension contributions from your gross salary. Our free UK tax calculator uses the latest HMRC rates for ${getCurrentTaxYearLabel()} to give you accurate results instantly.`
              }
            },
            {
              "@type": "Question", 
              "name": `What tax rates apply in the UK for ${getCurrentTaxYearLabel()}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": getTaxRateDescription('2025-2026')
              }
            },
            {
              "@type": "Question",
              "name": "Is this UK tax calculator free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our UK tax calculator is completely free with no registration required. We don't store your personal data and all calculations happen in your browser for maximum privacy. Perfect for PAYE employees, self-employed individuals, and contractors."
              }
            },
            {
              "@type": "Question",
              "name": "Can I use this for self-assessment tax calculations?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our calculator works for both PAYE employees and self-employed individuals. It includes National Insurance calculations, student loan repayments, and pension contributions - everything you need for accurate tax planning and self-assessment preparation."
              }
            }
          ]
        })}
      </Script>
    </main>
  );
}
