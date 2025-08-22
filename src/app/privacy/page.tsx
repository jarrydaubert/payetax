// src/app/privacy/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Cookie, Mail, CheckCircle, Info } from 'lucide-react';
import PageContainer from '@/components/ui/PageContainer';
import ContentSection from '@/components/ui/ContentSection';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Privacy Policy - ToolHubX UK Tax Calculator',
  description: 'Simple, honest privacy policy. We don\'t store your tax data and use minimal cookies for analytics.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-20"> {/* Add top padding to clear fixed navbar */}
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
          Privacy Policy
        </h1>
        <p className="text-white">
          Last updated: August 20, 2025 • Simple, honest privacy
        </p>
      </div>

      {/* Quick Summary */}
      <ContentSection
        title="The Simple Version"
        icon={<CheckCircle className="h-5 w-5" />}
        glass
        className="mb-8 border-l-4 border-l-green-500"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-white mb-3 text-green-700 dark:text-green-400">
              ✅ What We DON'T Do
            </h3>
            <ul className="space-y-1 text-small text-white/90">
              <li>• Store your tax calculations</li>
              <li>• Sell your data</li>
              <li>• Track you across websites</li>
              <li>• Require accounts or personal info</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-blue-700 dark:text-blue-400">
              ℹ️ What We DO
            </h3>
            <ul className="space-y-1 text-small text-white/90">
              <li>• Anonymous site analytics (optional)</li>
              <li>• Save your inputs locally (your device)</li>
              <li>• Provide free tax calculations</li>
              <li>• Keep this policy simple</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      {/* Your Data */}
      <ContentSection
        title="Your Tax Data"
        icon={<Eye className="h-5 w-5" />}
        glass
        className="mb-8"
      >
        <p className="text-white/90 mb-4">
          <strong>We never see your tax information.</strong> All calculations happen in your browser, 
          not on our servers. Your salary, pension contributions, and personal details stay on your device.
        </p>
        <div className="glass p-4 rounded-lg">
          <p className="text-small text-white">
            <strong>Technical note:</strong> We use localStorage to save your inputs between visits 
            for convenience. This is stored on your device and can be cleared anytime in your browser settings.
          </p>
        </div>
      </ContentSection>

      {/* Analytics */}
      <ContentSection
        title="Website Analytics"
        icon={<Cookie className="h-5 w-5" />}
        glass
        className="mb-8"
      >
        <p className="text-white/90 mb-4">
          We use Google Analytics to understand how people use our site. You can decline this 
          via our cookie banner. When enabled, we see:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass p-4 rounded-lg border border-blue-500/20">
            <h4 className="font-medium text-white mb-2">What we see:</h4>
            <ul className="text-small text-white space-y-1">
              <li>• Popular pages</li>
              <li>• General location (e.g., "London")</li>
              <li>• Device type (mobile/desktop)</li>
              <li>• Visit duration</li>
            </ul>
          </div>
          <div className="glass p-4 rounded-lg border border-red-500/20">
            <h4 className="font-medium text-white mb-2">What we don't see:</h4>
            <ul className="text-small text-white space-y-1">
              <li>• Your calculations</li>
              <li>• Personal information</li>
              <li>• Exact IP address</li>
              <li>• Who you are</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      {/* Cookies */}
      <ContentSection
        title="Cookies We Use"
        icon={<Cookie className="h-5 w-5" />}
        glass
        className="mb-8"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-white">Essential Cookies</h4>
              <p className="text-small text-white">
                Required for the site to work (like your dark/light mode preference). 
                These can't be disabled.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-white">Analytics Cookies</h4>
              <p className="text-small text-white">
                Google Analytics to help us improve the site. You can decline these 
                via our cookie banner.
              </p>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* External Links */}
      <ContentSection
        title="External Links"
        icon={<Info className="h-5 w-5" />}
        glass
        className="mb-8"
      >
        <p className="text-white/90">
          We link to official sources like HMRC for tax information. Those sites have 
          their own privacy policies we don't control.
        </p>
      </ContentSection>

      {/* Updates */}
      <ContentSection
        title="Policy Updates"
        icon={<Shield className="h-5 w-5" />}
        glass
        className="mb-8"
      >
        <p className="text-white/90">
          If we change this policy, we'll update the date at the top. For major changes, 
          we'll add a notice on the site.
        </p>
      </ContentSection>

      {/* Contact */}
      <ContentSection
        title="Questions?"
        icon={<Mail className="h-5 w-5" />}
        glass
        className="mb-8 border-l-4 border-l-primary"
      >
        <p className="text-white/90 mb-4">
          Questions about privacy or how we handle data? We're happy to help:
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            href="mailto:support@toolhubx.uk"
            variant="primary"
            external
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Email Us
          </Button>
          <Button
            href="/feedback"
            variant="outline"
          >
            Use Feedback Form
          </Button>
        </div>
      </ContentSection>

      {/* Footer */}
      <div className="text-center py-6 border-t border-foreground/10">
        <p className="text-caption text-white/90">
          This policy applies to toolhubx.uk and is designed to be clear and honest.
        </p>
      </div>
          </PageContainer>
    </div>
  );
}
