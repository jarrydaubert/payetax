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

/**
 * Props for the PageHeader component
 */
interface PageHeaderProps {
  /** Page title displayed as the main heading */
  title: string;
  /** Optional page description displayed below the title */
  description?: string;
  /** Optional back link URL */
  backLink?: string;
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
          className="inline-flex items-center mb-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm transition-all duration-300"
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
            className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span className="border-b border-transparent group-hover:border-current transition-all duration-300">
            {backLinkText}
          </span>
        </Link>
      )}

      {/* Title and actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1
          className={cn(
            'text-3xl font-bold',
            gradientTitle 
              ? 'bg-gradient-to-r from-[hsl(270,100%,80%)] to-[hsl(200,100%,70%)] bg-clip-text text-transparent'
              : 'text-gray-900 dark:text-white'
          )}
          style={gradientTitle ? {
            backgroundImage: 'linear-gradient(135deg, hsl(270, 100%, 80%) 0%, hsl(200, 100%, 70%) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          } : undefined}
        >
          {title}
        </h1>
        {actions && (
          <div className="flex items-center space-x-3" role="toolbar" aria-label="Page actions">
            {actions}
          </div>
        )}
      </div>

      {/* Optional description */}
      {description && (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl">{description}</p>
      )}
    </header>
  );
};

export default PageHeader;
