// src/components/molecules/Footer.tsx

'use client';

import { Twitter } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Footer molecule component
 *
 * IMPORTANT: This is a MOLECULE - it does NOT own the <footer> semantic tag.
 * The parent TEMPLATE (Layout.tsx) must wrap this in <footer></footer>.
 *
 * Uses design tokens: TEXT_BASE for brand, TEXT_SM for links, TEXT_XS for meta info
 * Icon uses SIZE_4 for Twitter icon
 * Spacing uses GAP_4 and GAP_6 for link groups and sections
 */
interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  // Fix hydration mismatch by using static year
  const currentYear = 2025;

  return (
    <div
      className={cn('mt-auto min-h-[140px] md:min-h-[120px]', className)}
      style={{ contain: 'layout' }}
    >
      {/* Subtle separator line */}
      <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

      {/* Main footer content */}
      <div className='glass py-8'>
        <div className='container mx-auto max-w-7xl px-2 sm:px-4'>
          <div className='flex flex-col items-center gap-6 text-center md:text-left'>
            {/* Top row: Brand and resources */}
            <div
              className={cn(
                'flex w-full flex-col items-center justify-between md:flex-row',
                SPACING.GAP_4
              )}
            >
              {/* Brand and copyright */}
              <div className={SPACING.SPACE_Y_2}>
                <span className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_BASE)}>
                  PayeTax
                </span>
                <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                  © {currentYear} PayeTax. All rights reserved.
                </p>
              </div>

              {/* Helpful Resources */}
              <div className={SPACING.SPACE_Y_2}>
                <p
                  className={cn(
                    'font-medium text-muted-foreground uppercase tracking-wide',
                    TYPOGRAPHY.TEXT_XS
                  )}
                >
                  Helpful Resources
                </p>
                <div
                  className={cn(
                    'flex flex-wrap items-center justify-center md:justify-end',
                    SPACING.GAP_4
                  )}
                >
                  <a
                    href='https://www.gov.uk/topic/personal-tax/income-tax'
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'text-muted-foreground transition-colors hover:text-primary',
                      TYPOGRAPHY.TEXT_SM
                    )}
                  >
                    HMRC / Gov.UK
                  </a>
                  <Link
                    href='/blog/uk-tax-calculator-2025-complete-guide'
                    className={cn(
                      'text-muted-foreground transition-colors hover:text-primary',
                      TYPOGRAPHY.TEXT_SM
                    )}
                  >
                    Calculator Guide
                  </Link>
                  <Link
                    href='/blog/how-much-tax-will-i-pay-uk-2025'
                    className={cn(
                      'text-muted-foreground transition-colors hover:text-primary',
                      TYPOGRAPHY.TEXT_SM
                    )}
                  >
                    Tax Examples
                  </Link>
                  <a
                    href='https://businessdebtline.org/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'text-muted-foreground transition-colors hover:text-primary',
                      TYPOGRAPHY.TEXT_SM
                    )}
                  >
                    Business Debtline
                  </a>
                  <a
                    href='https://www.moneyhelper.org.uk'
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'text-muted-foreground transition-colors hover:text-primary',
                      TYPOGRAPHY.TEXT_SM
                    )}
                  >
                    Money Helper
                  </a>
                </div>
              </div>
            </div>

            {/* Quick links and theme toggle */}
            <div className={cn('flex flex-wrap items-center justify-center', SPACING.GAP_6)}>
              <Link
                href='/about'
                className={cn(
                  '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  TYPOGRAPHY.TEXT_SM
                )}
              >
                About
              </Link>
              <Link
                href='/blog'
                className={cn(
                  '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  TYPOGRAPHY.TEXT_SM
                )}
              >
                Blog
              </Link>
              <Link
                href='/compliance'
                className={cn(
                  '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  TYPOGRAPHY.TEXT_SM
                )}
              >
                Compliance
              </Link>
              <Link
                href='/privacy'
                className={cn(
                  '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  TYPOGRAPHY.TEXT_SM
                )}
              >
                Privacy
              </Link>
              <a
                href='mailto:support@payetax.co.uk'
                className={cn(
                  '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  TYPOGRAPHY.TEXT_SM
                )}
              >
                Contact
              </a>
              <a
                href='https://www.buymeacoffee.com/payetax'
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  TYPOGRAPHY.TEXT_SM
                )}
                aria-label='Support PayeTax'
              >
                Support Us ☕
              </a>
              <a
                href='https://x.com/PayeTaxUK'
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  '-mx-3 flex items-center px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
                  SPACING.GAP_1_5,
                  TYPOGRAPHY.TEXT_SM
                )}
                aria-label='X: @PayeTaxUK'
              >
                <Twitter className={ICON_SIZES.SIZE_4} />
                @PayeTaxUK
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
