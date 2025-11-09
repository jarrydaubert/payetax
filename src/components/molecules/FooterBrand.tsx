// src/components/molecules/FooterBrand.tsx
'use client';

import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface FooterBrandProps {
  currentYear: number;
}

/**
 * Footer brand and copyright molecule
 *
 * Displays the PayeTax brand name and copyright notice.
 * Keeps copyright year centralized in parent component.
 *
 * @param currentYear - Current year for copyright notice
 */
export function FooterBrand({ currentYear }: FooterBrandProps) {
  return (
    <div className={SPACING.SPACE_Y_2}>
      <span className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_BASE)}>PayeTax</span>
      <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
        © {currentYear} PayeTax. All rights reserved.
      </p>
    </div>
  );
}
