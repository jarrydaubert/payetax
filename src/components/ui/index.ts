/**
 * UI Components Barrel Export
 *
 * DEPRECATED: This file exists for backward compatibility only.
 * All components have been reorganized into the atomic design hierarchy:
 * - shadcn/ui primitives → /atoms/ui/*
 * - Custom atoms → /atoms/*
 * - Molecules → /molecules/*
 * - Templates → /templates/*
 * - Organisms → /organisms/*
 *
 * Please update imports to use the new locations:
 * @example
 * // Old (deprecated):
 * import { Button } from '@/components/ui/button';
 *
 * // New (preferred):
 * import { Button } from '@/components/atoms/ui/button';
 *
 * This file will be removed in a future version (Phase 5 of PAYTAX-90).
 * Part of PAYTAX-90 Phase 2: Atomic Design Refactoring
 */

// ============================================================================
// shadcn/ui Components (now in /atoms/ui/)
// ============================================================================

export * from '../atoms/ui/alert';
export * from '../atoms/ui/badge';
export * from '../atoms/ui/button';
export * from '../atoms/ui/card';
export * from '../atoms/ui/chart';
export * from '../atoms/ui/checkbox';
export * from '../atoms/ui/collapsible';
export * from '../atoms/ui/dialog';
export * from '../atoms/ui/input';
export * from '../atoms/ui/kbd';
export * from '../atoms/ui/label';
export * from '../atoms/ui/select';
export * from '../atoms/ui/separator';
export * from '../atoms/ui/table';
export * from '../atoms/ui/textarea';
export * from '../atoms/ui/tooltip';

// ============================================================================
// Custom Atoms (now in /atoms/)
// ============================================================================

export { default as CookieBanner } from '../atoms/CookieBanner';
export * from '../atoms/EmptyState';
export { default as ErrorBoundary } from '../atoms/ErrorBoundary';
export * from '../atoms/Field';
export { GlowButton } from '../atoms/GlowButton';
export { GradientHeading } from '../atoms/GradientHeading';
export { Skeleton } from '../atoms/Skeleton';
export { Spinner } from '../atoms/Spinner';
export { ThemeToggle } from '../atoms/ThemeToggle';

// ============================================================================
// Molecules (now in /molecules/)
// ============================================================================

export { default as CallToAction } from '../molecules/CallToAction';
export { default as ContentSection } from '../molecules/ContentSection';
export { default as SustainabilityBadge } from '../molecules/SustainabilityBadge';

// ============================================================================
// Templates (now in /templates/)
// ============================================================================

export { default as PageContainer } from '../templates/PageContainer';

// ============================================================================
// Organisms (now in /organisms/)
// ============================================================================

export { default as StructuredData } from '../organisms/StructuredData';
