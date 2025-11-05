/**
 * TaxBadge Component
 *
 * Displays tax band indicators with consistent styling.
 * Extracted as part of PAYTAX-90 atomic design refactoring.
 *
 * @example
 * ```tsx
 * <TaxBadge band="basic" /> // "Basic Rate" badge
 * <TaxBadge band="higher" /> // "Higher Rate" badge
 * <TaxBadge band="additional" /> // "Additional Rate" badge
 * <TaxBadge band="basic" customLabel="20% Band" /> // Custom label
 * ```
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TaxBadgeProps {
  /** The tax band to display */
  band: 'basic' | 'higher' | 'additional' | 'starter' | 'intermediate' | 'advanced' | 'top';
  /** Custom label to override default */
  customLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show rate percentage (default: false) */
  showRate?: boolean;
}

/**
 * UK Tax Band Configuration
 */
const TAX_BAND_CONFIG = {
  basic: {
    label: 'Basic Rate',
    rate: '20%',
    variant: 'default' as const,
  },
  higher: {
    label: 'Higher Rate',
    rate: '40%',
    variant: 'secondary' as const,
  },
  additional: {
    label: 'Additional Rate',
    rate: '45%',
    variant: 'destructive' as const,
  },
  // Scottish bands
  starter: {
    label: 'Starter Rate',
    rate: '19%',
    variant: 'default' as const,
  },
  intermediate: {
    label: 'Intermediate Rate',
    rate: '21%',
    variant: 'secondary' as const,
  },
  advanced: {
    label: 'Advanced Rate',
    rate: '45%',
    variant: 'destructive' as const,
  },
  top: {
    label: 'Top Rate',
    rate: '48%',
    variant: 'destructive' as const,
  },
};

/**
 * Displays a tax band badge with appropriate styling
 */
export function TaxBadge({
  band,
  customLabel,
  className,
  showRate = false,
}: TaxBadgeProps): React.ReactElement {
  const config = TAX_BAND_CONFIG[band];
  const label = customLabel || config.label;
  const displayText = showRate ? `${label} (${config.rate})` : label;

  return (
    <Badge variant={config.variant} className={cn('font-medium', className)}>
      {displayText}
    </Badge>
  );
}

export default TaxBadge;
