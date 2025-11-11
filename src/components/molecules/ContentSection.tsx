// src/components/ui/ContentSection.tsx
/**
 * A reusable content section component with consistent styling
 * Used across about, privacy, and feedback pages to provide
 * a consistent layout and visual hierarchy.
 *
 * Updated to use CSS variables and glass morphism classes instead of inline styles
 */

'use client';

import type React from 'react';
import { COLORS, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Props for the ContentSection component
 */
interface ContentSectionProps {
  /** The content to display within the section */
  children: React.ReactNode;

  /** Optional section title */
  title?: string;

  /** Optional section description */
  description?: string;

  /** Optional icon to display next to the title */
  icon?: React.ReactNode;

  /** Optional additional CSS classes for the entire section */
  className?: string;

  /** Optional CSS classes for the title */
  titleClassName?: string;

  /** Optional CSS classes for the description */
  descriptionClassName?: string;

  /** Optional CSS classes for the content container */
  contentClassName?: string;

  /** Whether to use glass styling (default: false) */
  glass?: boolean;

  /** Optional ID for the section */
  id?: string;

  /** Optional animation class for entrance effects */
  animationClass?: string;
}

/**
 * ContentSection component provides consistent layout and styling
 * for content sections throughout the application.
 *
 * Now uses CSS variables and glass morphism classes for consistency
 */
const ContentSection: React.FC<ContentSectionProps> = ({
  children,
  title,
  description,
  icon,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
  glass = false,
  id,
  animationClass,
}) => {
  return (
    <section
      id={id}
      className={cn('mb-8', glass ? 'glass-card' : '', animationClass, className)}
      aria-labelledby={title ? `${id || ''}-title` : undefined}
    >
      {/* Section header if title is provided */}
      {title && (
        <div className='mb-4 flex items-start'>
          {/* Optional icon using CSS variables for gradient colors */}
          {icon && <div className={cn('mr-3 flex-shrink-0', COLORS.ACCENT_PURPLE)}>{icon}</div>}

          <div>
            {/* Title with proper heading level for accessibility */}
            <h2
              id={title ? `${id || ''}-title` : undefined}
              className={cn(
                'mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-bold text-transparent',
                TYPOGRAPHY.TEXT_2XL,
                titleClassName
              )}
            >
              {title}
            </h2>

            {/* Optional description */}
            {description && (
              <p className={cn('text-muted-foreground leading-relaxed', descriptionClassName)}>
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content container */}
      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </section>
  );
};

export default ContentSection;
