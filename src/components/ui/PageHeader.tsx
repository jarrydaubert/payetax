// src/components/ui/PageHeader.tsx
/**
 * Standard page header component with consistent styling
 *
 * Provides a consistent header layout for pages including title,
 * description, back link, and optional action buttons.
 * UPDATED: Now uses ToolHubX gradient theme instead of blue
 *
 * @module components/ui/PageHeader
 */

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/routes';

/**
 * Props for the PageHeader component
 */
interface PageHeaderProps {
  /** Page title displayed as the main heading */
  title: string;
  /** Optional page description displayed below the title */
  description?: string;
  /** Optional back link URL */
  backLink?: Route;
  /** Optional back link text (defaults to "Back to Calculator") */
  backLinkText?: string;
  /** Optional actions to display in the header */
  actions?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to use gradient styling for the title */
  gradientTitle?: boolean;
  /** ID for the header for accessibility purposes */
  id?: string;
}

/**
 * Standard page header with consistent styling
 * Used across about, privacy, feedback and other pages
 * NOW USES: ToolHubX purple/cyan gradient theme
 *
 * @param props Component properties
 * @returns PageHeader component
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backLink,
  backLinkText = 'Back to Calculator',
  actions,
  className,
  gradientTitle = true,
  id,
}): React.ReactElement => {
  return (
    <header className={cn('mb-8', className)} id={id}>
      {/* Back link with arrow icon if provided - Updated to gradient theme */}
      {backLink && (
        <Link
          href={backLink}
          className='group mb-6 inline-flex items-center rounded-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          style={{
            color: 'hsl(270, 100%, 70%)', // Purple from your gradient
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'hsl(200, 100%, 70%)'; // Cyan from your gradient
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'hsl(270, 100%, 70%)'; // Back to purple
          }}
          aria-label={`Return to ${backLinkText}`}
        >
          <ArrowLeft
            className='group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform'
            aria-hidden='true'
          />
          <span className='border-transparent border-b transition-all duration-300 group-hover:border-current'>
            {backLinkText}
          </span>
        </Link>
      )}

      {/* Title and actions row */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h1
          className={cn(
            'font-bold text-3xl',
            gradientTitle
              ? 'bg-gradient-to-r from-[hsl(270,100%,80%)] to-[hsl(200,100%,70%)] bg-clip-text text-transparent'
              : 'text-gray-900 dark:text-white'
          )}
          style={
            gradientTitle
              ? {
                  backgroundImage:
                    'linear-gradient(135deg, hsl(270, 100%, 80%) 0%, hsl(200, 100%, 70%) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }
              : undefined
          }
        >
          {title}
        </h1>
        {actions && (
          <div className='flex items-center space-x-3' role='toolbar' aria-label='Page actions'>
            {actions}
          </div>
        )}
      </div>

      {/* Optional description */}
      {description && (
        <p className='mt-4 max-w-3xl text-gray-600 text-lg dark:text-gray-400'>{description}</p>
      )}
    </header>
  );
};

export default PageHeader;
