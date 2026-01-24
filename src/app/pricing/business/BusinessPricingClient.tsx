// src/app/pricing/business/BusinessPricingClient.tsx
'use client';

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Code2,
  Palette,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { Badge } from '@/components/atoms/ui/badge';
import { Button } from '@/components/atoms/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ICON_SIZES, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaVariant: 'default' | 'outline';
  href: string;
  highlighted?: boolean;
  badge?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Perfect for personal websites and blogs',
    features: [
      'Full tax calculator functionality',
      'Responsive design',
      'Dark mode support',
      'Lazy loading for performance',
      '"Powered by PayeTax" badge',
      'Community support',
    ],
    cta: 'Get Started',
    ctaVariant: 'outline',
    href: '/tools/embed-widget',
  },
  {
    name: 'Professional',
    price: '£49',
    period: '/month',
    description: 'For businesses that want a seamless brand experience',
    features: [
      'Everything in Free, plus:',
      'Remove "Powered by PayeTax" badge',
      'Custom accent color',
      'Priority email support',
      'Usage analytics dashboard',
      'Up to 3 website domains',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default',
    href: 'mailto:support@payetax.co.uk?subject=Professional%20Widget%20Inquiry',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: '£199',
    period: '/month',
    description: 'Full white-label solution for large organizations',
    features: [
      'Everything in Professional, plus:',
      'Complete white-label (your branding)',
      'API access for integrations',
      'Unlimited website domains',
      'Custom tax scenarios',
      'Dedicated account manager',
      '99.9% uptime SLA',
      'Phone support',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline',
    href: 'mailto:support@payetax.co.uk?subject=Enterprise%20Widget%20Inquiry',
  },
];

const USE_CASES = [
  {
    icon: Building2,
    title: 'HR Portals',
    description:
      'Help employees understand their salary package with accurate take-home calculations.',
  },
  {
    icon: Users,
    title: 'Recruitment Agencies',
    description: 'Show candidates their potential take-home pay directly on job listings.',
  },
  {
    icon: Code2,
    title: 'Job Boards',
    description: 'Enhance job listings with instant salary calculations to boost engagement.',
  },
  {
    icon: Sparkles,
    title: 'Finance Websites',
    description: 'Provide value to your audience with an embedded tax calculator.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Can I try before I buy?',
    answer:
      'Absolutely! The Free tier is fully functional with no time limits. For Professional and Enterprise, we offer a 14-day free trial.',
  },
  {
    question: 'How does billing work?',
    answer:
      'We bill monthly via Stripe. Cancel anytime with no penalties. Annual plans with 2 months free are available for Enterprise.',
  },
  {
    question: 'What counts as a "domain"?',
    answer:
      'A domain is a unique website where the widget is embedded. Subdomains (blog.example.com) count as the same domain as the root (example.com).',
  },
  {
    question: 'Can I upgrade or downgrade later?',
    answer:
      "Yes! You can change your plan at any time. When upgrading, you'll be charged the prorated amount. Downgrades take effect at the next billing cycle.",
  },
  {
    question: 'Is the widget GDPR compliant?',
    answer:
      'Yes. All calculations happen client-side in the browser. We collect no personal data from widget users unless they explicitly opt-in to email results.',
  },
  {
    question: 'What support do I get?',
    answer:
      'Free users have access to documentation and community forums. Professional gets priority email support (24hr response). Enterprise includes a dedicated account manager and phone support.',
  },
];

export function BusinessPricingClient() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Building2, text: 'For Business' }}
        title={
          <>
            Widget Pricing for{' '}
            <GradientText variant='brand-full' as='span'>
              Businesses
            </GradientText>
          </>
        }
        subtitle={[
          'Embed the UK tax calculator on your website. Free for everyone, with premium options for businesses that need more.',
        ]}
      />

      {/* Pricing Cards */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <div className='grid gap-8 md:grid-cols-3'>
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  'relative flex flex-col',
                  tier.highlighted && 'scale-105 shadow-lg ring-2 ring-primary'
                )}
              >
                {tier.badge && (
                  <Badge className='absolute -top-3 left-1/2 -translate-x-1/2'>{tier.badge}</Badge>
                )}
                <CardHeader>
                  <CardTitle className={TYPOGRAPHY.TEXT_2XL}>{tier.name}</CardTitle>
                  <div className={cn('flex items-baseline', SPACING.GAP_1)}>
                    <span className={cn('font-bold', TYPOGRAPHY.TEXT_4XL)}>{tier.price}</span>
                    <span className='text-muted-foreground'>{tier.period}</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-1 flex-col'>
                  <ul className={cn('flex-1', SPACING.SPACE_Y_3, SPACING.MB_6)}>
                    {tier.features.map((feature) => (
                      <li key={feature} className='flex items-start gap-2'>
                        <Check
                          className={cn(
                            ICON_SIZES.SIZE_4,
                            'mt-0.5 flex-shrink-0',
                            tier.highlighted ? 'text-primary' : 'text-emerald'
                          )}
                        />
                        <span className={TYPOGRAPHY.TEXT_SM}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={tier.ctaVariant} className='w-full' size='lg'>
                    <Link href={tier.href as Route}>
                      {tier.cta}
                      <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={LAYOUT.SECTION_TINTED_PRIMARY}>
        <div className={LAYOUT.CONTAINER}>
          <div className='flex flex-wrap items-center justify-center gap-8 md:gap-16'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Shield className={ICON_SIZES.SIZE_5} />
              <span className={TYPOGRAPHY.TEXT_SM}>GDPR Compliant</span>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <BadgeCheck className={ICON_SIZES.SIZE_5} />
              <span className={TYPOGRAPHY.TEXT_SM}>HMRC Accurate</span>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Zap className={ICON_SIZES.SIZE_5} />
              <span className={TYPOGRAPHY.TEXT_SM}>99.9% Uptime</span>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Palette className={ICON_SIZES.SIZE_5} />
              <span className={TYPOGRAPHY.TEXT_SM}>Full Customization</span>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER}>
          <SectionHeading
            title='Who Uses PayeTax Widget?'
            subtitle='Trusted by businesses across the UK'
            align='center'
          />
          <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', SPACING.MT_8)}>
            {USE_CASES.map((useCase) => (
              <Card key={useCase.title} className={cn('text-center', SPACING.P_6)}>
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10',
                    SPACING.MB_4
                  )}
                >
                  <useCase.icon className={cn(ICON_SIZES.SIZE_6, 'text-primary')} />
                </div>
                <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  {useCase.title}
                </h3>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                  {useCase.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={LAYOUT.SECTION_TINTED_ACCENT}>
        <div className={LAYOUT.CONTAINER_SM}>
          <SectionHeading
            title='Frequently Asked Questions'
            subtitle='Everything you need to know'
            align='center'
          />
          <div className={cn(SPACING.MT_8, SPACING.SPACE_Y_4)}>
            {FAQ_ITEMS.map((item) => (
              <Card key={item.question} className={SPACING.P_6}>
                <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_LG, SPACING.MB_2)}>
                  {item.question}
                </h3>
                <p className='text-muted-foreground'>{item.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={LAYOUT.SECTION}>
        <div className={LAYOUT.CONTAINER_SM}>
          <Card
            className={cn(
              'border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 text-center',
              SPACING.P_8,
              'md:p-12'
            )}
          >
            <h2 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_3XL, SPACING.MB_4)}>
              Ready to Get Started?
            </h2>
            <p className={cn('mx-auto max-w-xl text-muted-foreground', SPACING.MB_8)}>
              Try the free widget today, or contact us to discuss your business needs. We&apos;re
              here to help you find the right solution.
            </p>
            <div className={cn('flex flex-col justify-center sm:flex-row', SPACING.GAP_4)}>
              <Button asChild size='lg'>
                <Link href={'/tools/embed-widget' as Route}>
                  <Code2 className={cn(ICON_SIZES.SIZE_4, 'mr-2')} />
                  Try Free Widget
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <Link href='mailto:support@payetax.co.uk?subject=Widget%20Inquiry'>
                  Contact Sales
                  <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
