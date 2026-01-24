/**
 * CompetitorCard Component
 *
 * Displays a competitor summary card with key information.
 * Used on /best-uk-tax-calculators and index pages.
 *
 * @module components/molecules/CompetitorCard
 */

import { ArrowRight, Star } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { TrackedAffiliateLink } from '@/components/atoms/TrackedAffiliateLink';
import { Badge } from '@/components/atoms/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/atoms/ui/card';
import { ICON_SIZES, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import type { Competitor } from '@/data/competitors';
import { cn } from '@/lib/utils';

export interface CompetitorCardProps {
  /** Competitor data */
  competitor: Competitor;
  /** Show PayeTax advantages */
  showAdvantages?: boolean;
  /** Show link to detailed comparison */
  showCompareLink?: boolean;
  /** Link variant (alternatives or vs) */
  linkVariant?: 'alternatives' | 'vs';
  /** Highlight as featured/recommended */
  featured?: boolean;
  /** Optional custom className */
  className?: string;
}

/**
 * CompetitorCard Component
 *
 * @example
 * ```tsx
 * <CompetitorCard
 *   competitor={govUkCompetitor}
 *   showAdvantages
 *   showCompareLink
 *   linkVariant="alternatives"
 * />
 * ```
 */
export function CompetitorCard({
  competitor,
  showAdvantages = false,
  showCompareLink = true,
  linkVariant = 'alternatives',
  featured = false,
  className,
}: CompetitorCardProps) {
  const compareUrl =
    linkVariant === 'vs'
      ? (`/vs/${competitor.slug}` as Route)
      : (`/alternatives/${competitor.slug}` as Route);

  return (
    <Card
      className={cn(
        'h-full transition-all duration-300 hover:shadow-lg',
        featured && 'ring-2 ring-primary',
        className
      )}
    >
      <CardHeader>
        <div className={cn('flex items-start justify-between', SPACING.GAP_3)}>
          <div>
            <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>
              {competitor.name}
            </h3>
            <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MT_1)}>
              {competitor.description}
            </p>
          </div>
          {featured && (
            <Badge variant='default' className='shrink-0'>
              <Star className={cn(ICON_SIZES.SIZE_3_5, 'mr-1')} />
              Top Pick
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={SPACING.SPACE_Y_4}>
        {/* Strengths */}
        <div>
          <h4 className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
            Strengths
          </h4>
          <ul className={cn(SPACING.SPACE_Y_1)}>
            {competitor.strengths.slice(0, 3).map((strength) => (
              <li key={strength} className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                <span className='mr-2 text-green-600 dark:text-green-400'>+</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div>
          <h4 className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
            Limitations
          </h4>
          <ul className={cn(SPACING.SPACE_Y_1)}>
            {competitor.weaknesses.slice(0, 3).map((weakness) => (
              <li key={weakness} className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                <span className='mr-2 text-amber-600 dark:text-amber-400'>-</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        {/* PayeTax Advantages */}
        {showAdvantages && (
          <div className={cn(SURFACES.BG_GRADIENT_PRIMARY, 'rounded-lg', SPACING.P_4)}>
            <h4 className={cn('font-semibold text-primary', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
              Why PayeTax is Better
            </h4>
            <ul className={cn(SPACING.SPACE_Y_1)}>
              {competitor.payeTaxAdvantages.slice(0, 3).map((advantage) => (
                <li key={advantage} className={cn('text-foreground', TYPOGRAPHY.TEXT_SM)}>
                  <span className='mr-2 text-primary'>✓</span>
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        <div className={cn('flex flex-wrap items-center', SPACING.GAP_4, SPACING.PT_4)}>
          {showCompareLink && (
            <Link
              href={compareUrl}
              className={cn(
                'inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80',
                TYPOGRAPHY.TEXT_SM,
                SPACING.GAP_1
              )}
            >
              Full comparison
              <ArrowRight className={ICON_SIZES.SIZE_4} />
            </Link>
          )}
          <TrackedAffiliateLink
            competitor={competitor}
            pageType='hub'
            className={cn(
              'inline-flex items-center text-muted-foreground transition-colors hover:text-foreground',
              TYPOGRAPHY.TEXT_SM,
              SPACING.GAP_1
            )}
          >
            Visit site
          </TrackedAffiliateLink>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * PayeTax highlight card for comparison pages
 */
export interface PayeTaxCardProps {
  className?: string;
}

export function PayeTaxCard({ className }: PayeTaxCardProps) {
  return (
    <Card
      className={cn(
        'h-full border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5',
        className
      )}
    >
      <CardHeader>
        <div className={cn('flex items-start justify-between', SPACING.GAP_3)}>
          <div>
            <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_XL)}>PayeTax</h3>
            <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MT_1)}>
              Modern, privacy-first UK tax calculator with What-If scenarios
            </p>
          </div>
          <Badge className='shrink-0 bg-primary text-primary-foreground'>
            <Star className={cn(ICON_SIZES.SIZE_3_5, 'mr-1')} />
            Recommended
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={SPACING.SPACE_Y_4}>
        <div>
          <h4 className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_SM, SPACING.MB_2)}>
            Why Choose PayeTax
          </h4>
          <ul className={cn(SPACING.SPACE_Y_1)}>
            <li className={cn('text-foreground', TYPOGRAPHY.TEXT_SM)}>
              <span className='mr-2 text-primary'>✓</span>
              What-If salary comparison (unique feature)
            </li>
            <li className={cn('text-foreground', TYPOGRAPHY.TEXT_SM)}>
              <span className='mr-2 text-primary'>✓</span>
              100% ad-free, privacy-first
            </li>
            <li className={cn('text-foreground', TYPOGRAPHY.TEXT_SM)}>
              <span className='mr-2 text-primary'>✓</span>
              Modern mobile-first design
            </li>
            <li className={cn('text-foreground', TYPOGRAPHY.TEXT_SM)}>
              <span className='mr-2 text-primary'>✓</span>3 historic tax years included
            </li>
            <li className={cn('text-foreground', TYPOGRAPHY.TEXT_SM)}>
              <span className='mr-2 text-primary'>✓</span>
              Instant real-time calculations
            </li>
          </ul>
        </div>

        <div className={SPACING.PT_4}>
          <Link
            href='/'
            className={cn(
              'inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80',
              TYPOGRAPHY.TEXT_SM,
              SPACING.GAP_1
            )}
          >
            Try PayeTax now
            <ArrowRight className={ICON_SIZES.SIZE_4} />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

CompetitorCard.displayName = 'CompetitorCard';
PayeTaxCard.displayName = 'PayeTaxCard';
