// src/app/privacy/page.tsx

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Cookie,
  Database,
  Globe,
  Info,
  Lock,
  Server,
  Shield,
  Sparkles,
  UserX,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import CallToAction from '@/components/ui/CallToAction';

export const metadata: Metadata = {
  title: 'Privacy Policy - PayeTax UK Tax Calculator',
  description:
    "Simple, transparent privacy policy. We don't store your tax data, don't track you, and use minimal cookies. Privacy-first tax calculations.",
  keywords:
    'privacy policy, data protection, UK tax calculator privacy, GDPR compliant, no data collection',
};

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto max-w-5xl px-4 lg:max-w-6xl'>
        {/* Header */}
        <div className='mb-16'>
          <Link
            href='/'
            className='group mb-8 inline-flex items-center text-purple-400 transition-colors hover:text-purple-300'
          >
            <ArrowLeft className='group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform' />
            Back to Calculator
          </Link>

          <div className='text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-gradient-to-r from-green-500/20 to-blue-500/20 px-4 py-2'>
              <Shield className='h-4 w-4 text-green-400' />
              <span className='font-medium text-green-300 text-sm'>Privacy Policy</span>
            </div>

            <h1 className='mb-6 font-bold text-4xl md:text-6xl'>
              <span className='bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'>
                Your Privacy
              </span>
              <br />
              <span className='text-white'>Comes First</span>
            </h1>

            <p className='mx-auto mb-4 max-w-3xl text-gray-300 text-xl leading-relaxed'>
              We believe in radical transparency about data. Here's exactly what we do and don't do
              with your information.
            </p>

            <div className='inline-flex items-center gap-2 text-gray-300'>
              <Calendar className='h-4 w-4' />
              <span className='text-sm'>Last updated: August 22, 2025</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className='glass-card mb-16 border-green-400 border-l-4 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <CheckCircle className='mx-auto mb-4 h-12 w-12 text-green-400' />
            <h2 className='mb-4 font-bold text-3xl text-white'>The Simple Version</h2>
            <p className='text-gray-300 text-lg'>Everything you need to know in under 30 seconds</p>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <div className='rounded-xl border border-red-400/20 bg-red-500/10 p-6'>
              <h3 className='mb-4 flex items-center gap-2 font-semibold text-red-300 text-xl'>
                <UserX className='h-5 w-5' />
                What We DON'T Do
              </h3>
              <ul className='space-y-3 text-gray-300'>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-400'></div>
                  Store your tax calculations on our servers
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-400'></div>
                  Sell, share, or monetize your data
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-400'></div>
                  Track you across other websites
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-400'></div>
                  Require accounts or personal information
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-400'></div>
                  Use invasive advertising or tracking
                </li>
              </ul>
            </div>

            <div className='rounded-xl border border-green-400/20 bg-green-500/10 p-6'>
              <h3 className='mb-4 flex items-center gap-2 font-semibold text-green-300 text-xl'>
                <CheckCircle className='h-5 w-5' />
                What We DO
              </h3>
              <ul className='space-y-3 text-gray-300'>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-400'></div>
                  Provide completely free tax calculations
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-400'></div>
                  Use anonymous analytics (with your consent)
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-400'></div>
                  Save your preferences locally on your device
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-400'></div>
                  Keep this policy simple and honest
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-400'></div>
                  Respect your choice to decline analytics
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How Your Data Works */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-12 text-center'>
            <Lock className='mx-auto mb-6 h-12 w-12 text-blue-400' />
            <h2 className='mb-6 font-bold text-3xl text-white'>How Your Tax Data Works</h2>
            <p className='mx-auto max-w-3xl text-gray-300 text-xl leading-relaxed'>
              Understanding exactly where your sensitive information goes (spoiler: nowhere)
            </p>
          </div>

          <div className='mb-8 grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400'>
                <Database className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-3 font-semibold text-lg text-white'>Your Device</h3>
              <p className='text-gray-300 text-sm'>
                All calculations happen in your browser. Your salary, tax code, and personal details
                never leave your device.
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-400 to-pink-400'>
                <Server className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-3 font-semibold text-lg text-white'>Our Servers</h3>
              <p className='text-gray-300 text-sm'>
                Only serve the website code. No tax data, no personal information, no calculation
                results are stored here.
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-green-400 to-emerald-400'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-3 font-semibold text-lg text-white'>localStorage</h3>
              <p className='text-gray-300 text-sm'>
                We save your inputs locally for convenience. This data stays on your device and can
                be cleared anytime.
              </p>
            </div>
          </div>

          <div className='rounded-xl border border-blue-400/20 bg-blue-500/10 p-6'>
            <h4 className='mb-3 font-semibold text-blue-300 text-lg'>Technical Details</h4>
            <p className='text-gray-300 text-sm leading-relaxed'>
              We use client-side JavaScript and Web Workers to perform all tax calculations in your
              browser. The calculation engine runs entirely on your device - we literally cannot see
              your tax information even if we wanted to. This is privacy by design, not just policy.
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <Globe className='mx-auto mb-6 h-12 w-12 text-purple-400' />
            <h2 className='mb-6 font-bold text-3xl text-white'>Website Analytics</h2>
            <p className='text-gray-300 text-lg'>
              Anonymous usage data to help us improve (completely optional)
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <div className='rounded-xl border border-green-400/20 bg-green-500/10 p-6'>
              <h4 className='mb-4 font-semibold text-green-300 text-lg'>
                What We See (If You Consent)
              </h4>
              <ul className='space-y-2 text-gray-300 text-sm'>
                <li>• Which pages are most popular</li>
                <li>• General location (city level, not specific address)</li>
                <li>• Device type (mobile, tablet, desktop)</li>
                <li>• How long people spend on the site</li>
                <li>• Which features are used most</li>
                <li>• Basic error reports (no personal data)</li>
              </ul>
            </div>

            <div className='rounded-xl border border-red-400/20 bg-red-500/10 p-6'>
              <h4 className='mb-4 font-semibold text-lg text-red-300'>What We Never See</h4>
              <ul className='space-y-2 text-gray-300 text-sm'>
                <li>• Your tax calculations or results</li>
                <li>• Personal information or data you enter</li>
                <li>• Your exact IP address or identity</li>
                <li>• Your browsing history on other sites</li>
                <li>• Any data that could identify you personally</li>
                <li>• Sensitive financial information</li>
              </ul>
            </div>
          </div>

          <div className='mt-8 rounded-xl border border-purple-400/20 bg-purple-500/10 p-6'>
            <h4 className='mb-3 font-semibold text-lg text-purple-300'>Your Choice</h4>
            <p className='text-gray-300 text-sm leading-relaxed'>
              You can decline analytics entirely via our cookie banner. The calculator works exactly
              the same either way. We use Google Analytics with anonymized IPs and respect Do Not
              Track headers.
            </p>
          </div>
        </div>

        {/* Cookies */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <Cookie className='mx-auto mb-6 h-12 w-12 text-yellow-400' />
            <h2 className='mb-6 font-bold text-3xl text-white'>Cookies We Use</h2>
            <p className='text-gray-300 text-lg'>Minimal, transparent, and under your control</p>
          </div>

          <div className='space-y-6'>
            <div className='flex gap-4'>
              <div className='mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500'>
                <span className='font-bold text-white text-xs'>!</span>
              </div>
              <div>
                <h4 className='mb-2 font-semibold text-lg text-white'>
                  Essential Cookies (Required)
                </h4>
                <p className='mb-3 text-gray-300 text-sm'>
                  These are necessary for the website to function. They remember your cookie
                  preferences and keep the site working properly.
                </p>
                <div className='text-gray-300 text-xs'>
                  Examples: Cookie consent choice, site functionality
                </div>
              </div>
            </div>

            <div className='flex gap-4'>
              <div className='mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500'>
                <span className='font-bold text-white text-xs'>?</span>
              </div>
              <div>
                <h4 className='mb-2 font-semibold text-lg text-white'>
                  Analytics Cookies (Optional)
                </h4>
                <p className='mb-3 text-gray-300 text-sm'>
                  Google Analytics helps us understand how the site is used so we can improve it.
                  You can decline these completely.
                </p>
                <div className='text-gray-300 text-xs'>
                  Examples: Page views, session duration, anonymized usage patterns
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Important Stuff */}
        <div className='mb-16 grid gap-8 md:grid-cols-2'>
          <div className='glass-card p-8'>
            <Info className='mb-4 h-8 w-8 text-cyan-400' />
            <h3 className='mb-4 font-semibold text-white text-xl'>External Links</h3>
            <p className='text-gray-300 text-sm leading-relaxed'>
              We link to official sources like HMRC for tax information and rates. These external
              sites have their own privacy policies that we don't control.
            </p>
          </div>

          <div className='glass-card p-8'>
            <Calendar className='mb-4 h-8 w-8 text-green-400' />
            <h3 className='mb-4 font-semibold text-white text-xl'>Policy Updates</h3>
            <p className='text-gray-300 text-sm leading-relaxed'>
              If we update this policy, we'll change the date at the top and add a notice on the
              site. We'll never make changes that compromise your privacy.
            </p>
          </div>
        </div>

        {/* Contact */}
        <CallToAction variant='contact' className='mt-16 mb-8' />

        {/* Footer */}
        <div className='border-white/20 border-t py-12 text-center'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <Sparkles className='h-5 w-5 text-purple-400' />
            <span className='font-semibold text-lg text-white'>Privacy-First Tax Calculations</span>
          </div>
          <p className='text-gray-300 text-sm'>
            This policy applies to payetax.co.uk and is designed to be clear, honest, and protective
            of your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
