// src/app/about/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calculator, Shield, Zap, Heart } from 'lucide-react';
import PageContainer from '@/components/ui/PageContainer';
import ContentSection from '@/components/ui/ContentSection';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About - ToolHubX UK Tax Calculator',
  description: 'Learn about ToolHubX - the simple, accurate UK tax calculator built for taxpayers.',
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <PageContainer maxWidth="4xl" includeNavbarSpacing={false}>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calculator
          </Link>
          <h1 className="text-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            About ToolHubX
          </h1>
          <p className="text-white">
            Simple, accurate UK tax calculations for everyone
          </p>
        </div>

        {/* Mission */}
        <ContentSection
          title="Our Mission"
          icon={<Heart className="h-5 w-5" />}
          glass
          className="mb-8 border-l-4 border-l-primary"
        >
          <p className="text-white/90 text-large">
            We believe UK tax calculations should be simple, accurate, and accessible to everyone. 
            No accounts, no personal data required - just honest, reliable tax calculations using 
            official HMRC rates.
          </p>
        </ContentSection>

        {/* Features */}
        <ContentSection
          title="Why Choose ToolHubX?"
          icon={<Calculator className="h-5 w-5" />}
          glass
          className="mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Privacy First</h4>
                  <p className="text-small text-white">
                    Your calculations stay on your device. We never see your personal data.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Always Current</h4>
                  <p className="text-small text-white">
                    Uses the latest HMRC rates and thresholds for accurate calculations.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Calculator className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Comprehensive</h4>
                  <p className="text-small text-white">
                    Income tax, National Insurance, student loans, and pension contributions.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Heart className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Free Forever</h4>
                  <p className="text-small text-white">
                    No hidden costs, no premium features. Just free tax calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Technical */}
        <ContentSection
          title="Built for You"
          glass
          className="mb-8"
        >
          <p className="text-white/90 mb-4">
            ToolHubX is built by developers who understand the frustration of complex tax calculations. 
            We use modern web technology to provide fast, reliable calculations that work on any device.
          </p>
          <div className="glass p-4 rounded-lg">
            <p className="text-small text-white">
              <strong>Technical:</strong> Built with Next.js, TypeScript, and love. All calculations 
              happen in your browser for maximum privacy and speed.
            </p>
          </div>
        </ContentSection>

        {/* Contact */}
        <ContentSection
          title="Get in Touch"
          glass
          className="mb-8 border-l-4 border-l-blue-500"
        >
          <p className="text-white/90 mb-4">
            Questions, suggestions, or just want to say hello? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              href="mailto:support@toolhubx.uk?subject=ToolHubX%20-%20Hello"
              variant="primary"
              external
              leftIcon={<Heart className="h-4 w-4" />}
            >
              Say Hello
            </Button>
            <Button
              href="/feedback"
              variant="outline"
            >
              Send Feedback
            </Button>
          </div>
        </ContentSection>

        {/* Footer */}
        <div className="text-center py-6 border-t border-white/20">
          <p className="text-small text-white/90">
            Made with ❤️ for UK taxpayers
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
