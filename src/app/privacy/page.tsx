// src/app/privacy/page.tsx

import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { robotoFlex } from '@/app/fonts';

// Generate metadata for privacy policy page
export const metadata: Metadata = {
  title: 'Privacy & Cookie Policy - ToolHubX',
  description:
    'Privacy and cookie policy for ToolHubX UK Tax Calculator. Learn how we handle your data and use cookies on our website.',
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense
      fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}
    >
      <div className={`${robotoFlex.variable} font-sans`}>
        {/* Aurora gradient background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          {/* Header Section with Glass Effect */}
          <div className="glass-card mb-8">
            <div className="glass-card-inner">
              <Link
                href="/"
                className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calculator
              </Link>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Privacy & Cookies
              </h1>
              <p className="text-muted-foreground">
                Last updated: April 4, 2025 • Simple, honest privacy
              </p>
            </div>
          </div>

          {/* Main Content with Glass Cards */}
          <div className="space-y-6">
            {/* Quick Summary Card */}
            <div className="glass-card bg-gradient-to-r from-green-500/5 to-blue-500/5">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  The Simple Version
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">✅ What We DON'T Do:</h3>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Store your tax information</li>
                      <li>• Sell your data</li>
                      <li>• Track you across websites</li>
                      <li>• Require personal details</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">📊 What We DO:</h3>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Calculate taxes in your browser</li>
                      <li>• Use Google Analytics (anonymous)</li>
                      <li>• Remember your theme preference</li>
                      <li>• Keep your data on your device</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Data Section */}
            <div className="glass-card">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your Tax Data Stays Private
                </h2>
                <p className="text-muted-foreground mb-4">
                  Everything you enter into our calculator stays on your device. We don't see your salary, 
                  pension contributions, or any personal information. The calculations happen in your browser, 
                  not on our servers.
                </p>
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Technical note:</strong> We use localStorage to save your inputs between visits 
                    for convenience. This is stored locally on your device and can be cleared anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="glass-card">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Anonymous Website Stats
                </h2>
                <p className="text-muted-foreground mb-4">
                  We use Google Analytics to understand how people use our site, but we've configured 
                  it to be privacy-friendly:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">What we see:</h3>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Which pages are popular</li>
                      <li>• Rough location (like "London")</li>
                      <li>• Device type (mobile/desktop)</li>
                      <li>• How long people stay</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">What we don't see:</h3>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Your exact IP address</li>
                      <li>• Personal information</li>
                      <li>• What you calculated</li>
                      <li>• Who you are</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies Section */}
            <div className="glass-card">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Cookies We Use
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Essential Cookies</h3>
                      <p className="text-muted-foreground text-sm">
                        Required for the site to work (like remembering your dark/light mode preference).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Analytics Cookies</h3>
                      <p className="text-muted-foreground text-sm">
                        Google Analytics to help us improve the site. You can decline these.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    You can control cookies through our banner when you first visit, or by 
                    clearing them in your browser settings anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="glass-card">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  External Links
                </h2>
                <p className="text-muted-foreground">
                  Our site might link to other websites (like HMRC for official tax info). 
                  Those sites have their own privacy policies, which we don't control.
                </p>
              </div>
            </div>

            {/* Updates */}
            <div className="glass-card">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Policy Updates
                </h2>
                <p className="text-muted-foreground">
                  If we change this policy, we'll update the date at the top and post the 
                  new version here. For major changes, we might add a notice on the site.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="glass-card bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="glass-card-inner">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Questions?
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about privacy or how we handle data, we're happy to help:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:support@toolhubx.uk"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    Email Us
                  </a>
                  <Link
                    href="/feedback"
                    className="inline-flex items-center px-4 py-2 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors duration-200"
                  >
                    Use Feedback Form
                  </Link>
                </div>
              </div>
            </div>

            {/* Legal Footer */}
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">
                This privacy policy applies to toolhubx.uk and is designed to be clear and honest about our practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
