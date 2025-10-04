// src/app/privacy/page.tsx
'use client';

import {
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
import CallToAction from '@/components/ui/CallToAction';

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto max-w-5xl px-4 lg:max-w-6xl'>
        {/* Header */}
        <div className='mb-16'>
          <div className='text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2'>
              <Shield className='h-4 w-4 text-green-500' />
              <span className='font-medium text-green-500 text-sm'>Privacy Policy</span>
            </div>

            <h1 className='mb-6 font-bold text-4xl md:text-6xl'>
              <span className='bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'>
                Your Privacy
              </span>
              <br />
              <span className='text-foreground'>Comes First</span>
            </h1>

            <p className='mx-auto mb-4 max-w-3xl text-muted-foreground text-xl leading-relaxed'>
              Radical transparency about your data. Here's exactly what we do and don't do with your
              information.
            </p>

            <div className='inline-flex items-center gap-2 text-muted-foreground'>
              <Calendar className='h-4 w-4' />
              <span className='text-sm'>Last updated: October 3, 2025</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className='glass-card mb-16 border-green-500 border-l-4 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <CheckCircle className='mx-auto mb-4 h-12 w-12 text-green-500' />
            <h2 className='mb-4 font-bold text-3xl text-foreground'>The 30-Second Version</h2>
            <p className='text-lg text-muted-foreground'>Everything you need to know at a glance</p>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <div className='rounded-xl border border-red-500/20 bg-red-500/5 p-6'>
              <h3 className='mb-4 flex items-center gap-2 font-semibold text-foreground text-xl'>
                <UserX className='h-5 w-5 text-red-500' />
                What We DON'T Do
              </h3>
              <ul className='space-y-3 text-muted-foreground'>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-500'></div>
                  Store your tax calculations on servers
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-500'></div>
                  Sell, share, or monetize your data
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-500'></div>
                  Track you across other websites
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-500'></div>
                  Require accounts or personal info
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-500'></div>
                  Use invasive advertising or tracking
                </li>
              </ul>
            </div>

            <div className='rounded-xl border border-green-500/20 bg-green-500/5 p-6'>
              <h3 className='mb-4 flex items-center gap-2 font-semibold text-foreground text-xl'>
                <CheckCircle className='h-5 w-5 text-green-500' />
                What We DO
              </h3>
              <ul className='space-y-3 text-muted-foreground'>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  Provide completely free calculations
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  Use anonymous analytics (with consent)
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  Save preferences locally on your device
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  Keep this policy simple and honest
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  Respect your choice to decline tracking
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How Your Data Works */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-12 text-center'>
            <Lock className='mx-auto mb-6 h-12 w-12 text-blue-500' />
            <h2 className='mb-6 font-bold text-3xl text-foreground'>How Your Tax Data Works</h2>
            <p className='mx-auto max-w-3xl text-muted-foreground text-xl leading-relaxed'>
              Understanding exactly where your sensitive information goes (spoiler: nowhere)
            </p>
          </div>

          <div className='mb-8 grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400'>
                <Database className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-3 font-semibold text-foreground text-lg'>Your Device</h3>
              <p className='text-muted-foreground text-sm'>
                All calculations happen in your browser. Your salary, tax code, and personal details
                never leave your device.
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-400 to-pink-400'>
                <Server className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-3 font-semibold text-foreground text-lg'>Our Servers</h3>
              <p className='text-muted-foreground text-sm'>
                Only serve the website code. No tax data, no personal information, no calculation
                results stored here.
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-green-400 to-emerald-400'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-3 font-semibold text-foreground text-lg'>localStorage</h3>
              <p className='text-muted-foreground text-sm'>
                We save your inputs locally for convenience. This data stays on your device and can
                be cleared anytime.
              </p>
            </div>
          </div>

          <div className='rounded-xl border border-blue-500/20 bg-blue-500/5 p-6'>
            <h4 className='mb-3 font-semibold text-foreground text-lg'>Technical Details</h4>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              We use client-side JavaScript to perform all tax calculations in your browser. The
              calculation engine runs entirely on your device - we literally cannot see your tax
              information even if we wanted to. This is privacy by design, not just policy.
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <Globe className='mx-auto mb-6 h-12 w-12 text-purple-500' />
            <h2 className='mb-6 font-bold text-3xl text-foreground'>Website Analytics</h2>
            <p className='text-lg text-muted-foreground'>
              Anonymous usage data to improve the site (completely optional)
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <div className='rounded-xl border border-green-500/20 bg-green-500/5 p-6'>
              <h4 className='mb-4 font-semibold text-foreground text-lg'>
                What We See (If You Consent)
              </h4>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                <li>• Which pages are most popular</li>
                <li>• General location (city level, not address)</li>
                <li>• Device type (mobile, tablet, desktop)</li>
                <li>• Time spent on the site</li>
                <li>• Which features are used most</li>
                <li>• Basic error reports (no personal data)</li>
              </ul>
            </div>

            <div className='rounded-xl border border-red-500/20 bg-red-500/5 p-6'>
              <h4 className='mb-4 font-semibold text-foreground text-lg'>What We Never See</h4>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                <li>• Your tax calculations or results</li>
                <li>• Personal information you enter</li>
                <li>• Your exact IP address or identity</li>
                <li>• Your browsing history on other sites</li>
                <li>• Data that could identify you personally</li>
                <li>• Sensitive financial information</li>
              </ul>
            </div>
          </div>

          <div className='mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-6'>
            <h4 className='mb-3 font-semibold text-foreground text-lg'>Your Choice</h4>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              You can decline analytics entirely via our cookie banner. The calculator works exactly
              the same either way. We use Google Analytics with anonymized IPs and respect Do Not
              Track headers.
            </p>
          </div>
        </div>

        {/* Cookies */}
        <div className='glass-card mb-16 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <Cookie className='mx-auto mb-6 h-12 w-12 text-yellow-500' />
            <h2 className='mb-6 font-bold text-3xl text-foreground'>Cookies We Use</h2>
            <p className='text-lg text-muted-foreground'>
              Minimal, transparent, and under your control
            </p>
          </div>

          <div className='space-y-6'>
            <div className='flex gap-4'>
              <div className='mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500'>
                <span className='font-bold text-white text-xs'>!</span>
              </div>
              <div>
                <h4 className='mb-2 font-semibold text-foreground text-lg'>
                  Essential Cookies (Required)
                </h4>
                <p className='mb-3 text-muted-foreground text-sm'>
                  These are necessary for the website to function. They remember your cookie
                  preferences and keep the site working properly.
                </p>
                <div className='text-muted-foreground text-xs'>
                  Examples: Cookie consent choice, site functionality
                </div>
              </div>
            </div>

            <div className='flex gap-4'>
              <div className='mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500'>
                <span className='font-bold text-white text-xs'>?</span>
              </div>
              <div>
                <h4 className='mb-2 font-semibold text-foreground text-lg'>
                  Analytics Cookies (Optional)
                </h4>
                <p className='mb-3 text-muted-foreground text-sm'>
                  Google Analytics helps us understand how the site is used so we can improve it.
                  You can decline these completely.
                </p>
                <div className='text-muted-foreground text-xs'>
                  Examples: Page views, session duration, anonymized usage patterns
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Important Stuff */}
        <div className='mb-16 grid gap-8 md:grid-cols-2'>
          <div className='glass-card p-8'>
            <Info className='mb-4 h-8 w-8 text-cyan-500' />
            <h3 className='mb-4 font-semibold text-foreground text-xl'>External Links</h3>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              We link to official sources like HMRC for tax information and rates. These external
              sites have their own privacy policies that we don't control.
            </p>
          </div>

          <div className='glass-card p-8'>
            <Calendar className='mb-4 h-8 w-8 text-green-500' />
            <h3 className='mb-4 font-semibold text-foreground text-xl'>Policy Updates</h3>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              If we update this policy, we'll change the date at the top and add a notice on the
              site. We'll never make changes that compromise your privacy.
            </p>
          </div>
        </div>

        {/* Contact */}
        <CallToAction variant='contact' className='mt-16 mb-8' />

        {/* Footer */}
        <div className='border-border border-t py-12 text-center'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' />
            <span className='font-semibold text-foreground text-lg'>
              Privacy-First Tax Calculations
            </span>
          </div>
          <p className='text-muted-foreground text-sm'>
            This policy applies to payetax.co.uk and is designed to be clear, honest, and protective
            of your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
