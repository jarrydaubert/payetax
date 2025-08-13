/**
 * src/components/ui/ContentSection.tsx
 *
 * A reusable content section component with consistent styling
 * Used across about, privacy, and feedback pages to provide
 * a consistent layout and visual hierarchy.
 */

'use client';

import type React from 'react';
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
 * @example
 * ```tsx
 * <ContentSection
 *   title="About Us"
 *   description="Learn more about our company"
 *   icon={<Info className="h-5 w-5" />}
 *   glass
 * >
 *   <p>Content goes here...</p>
 * </ContentSection>
 * ```
 *
 * @param props Component props
 * @returns A styled content section component
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
      className={cn(
        'mb-8',
        glass ? 'bg-white/60 dark:bg-gray-800/60 p-6 rounded-lg shadow-sm' : '',
        animationClass,
        className
      )}
      aria-labelledby={title ? `${id || ''}-title` : undefined}
    >
      {/* Section header if title is provided */}
      {title && (
        <div className="flex items-start mb-4">
          {/* Optional icon */}
          {icon && (
            <div className="mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0">{icon}</div>
          )}

          <div>
            {/* Title with proper heading level for accessibility */}
            <h2
              id={title ? `${id || ''}-title` : undefined}
              className={cn('text-xl font-semibold text-gray-900 dark:text-white', titleClassName)}
            >
              {title}
            </h2>

            {/* Optional description */}
            {description && (
              <p className={cn('mt-1 text-gray-600 dark:text-gray-400', descriptionClassName)}>
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Section content */}
      <div
        className={cn('', contentClassName)}
        aria-describedby={description ? `${id || ''}-description` : undefined}
      >
        {children}
      </div>
    </section>
  );
};

export default ContentSection;
