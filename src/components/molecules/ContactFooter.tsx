/**
 * ContactFooter Component
 *
 * Displays a contact section with title, description, and contact links.
 * Used across about, privacy, compliance pages for consistent contact CTAs.
 *
 * @module components/molecules/ContactFooter
 */

import type { Route } from 'next';
import Link from 'next/link';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import type { ContactLinkData } from '@/lib/validation/pageDataValidation';

/**
 * Contact link interface extending validated ContactLinkData
 */
export interface ContactLink extends ContactLinkData {
  // All properties from ContactLinkData
}

/**
 * ContactFooter component props
 */
export interface ContactFooterProps {
  /** Optional title (defaults to "Get in Touch") */
  title?: string;
  /** Optional description */
  description?: string;
  /** Array of contact links */
  links: ContactLink[];
  /** Optional custom className */
  className?: string;
  /** Center content (default: true) */
  centered?: boolean;
}

/**
 * ContactFooter Component
 *
 * Displays a contact section footer with links.
 * Typically used at bottom of content pages.
 *
 * @example Basic usage
 * ```tsx
 * <ContactFooter
 *   links={[
 *     { text: 'support@example.com', href: 'mailto:support@example.com', type: 'email' },
 *     { text: 'Feedback Form', href: '/feedback', type: 'link' },
 *   ]}
 * />
 * ```
 *
 * @example Custom title and description
 * ```tsx
 * <ContactFooter
 *   title="Have Questions?"
 *   description="We're here to help with your tax calculations"
 *   links={contactLinks}
 *   centered={false}
 * />
 * ```
 */
export function ContactFooter({
  title = 'Get in Touch',
  description,
  links,
  className,
  centered = true,
}: ContactFooterProps) {
  const containerClasses = cn('py-16', className);

  const contentClasses = cn('container mx-auto max-w-4xl px-4', centered && 'text-center');

  const linksContainerClasses = cn(
    'flex gap-4',
    centered ? 'flex-col items-center justify-center sm:flex-row sm:gap-6' : 'flex-wrap',
  );

  return (
    <section className={containerClasses}>
      <div className={contentClasses}>
        {/* Title */}
        <h3 className={cn('font-bold text-foreground', SPACING.MB_4, TYPOGRAPHY.TEXT_2XL)}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={cn('text-muted-foreground', SPACING.MB_6, TYPOGRAPHY.TEXT_BASE)}>
            {description}
          </p>
        )}

        {/* Contact Links */}
        <div className={linksContainerClasses}>
          {links.map((link, index) => (
            <ContactLinkItem
              key={`contact-${link.text}-${link.href}`}
              link={link}
              showSeparator={centered && index < links.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Individual contact link item component
 */
interface ContactLinkItemProps {
  link: ContactLink;
  showSeparator: boolean;
}

function ContactLinkItem({ link, showSeparator }: ContactLinkItemProps) {
  const linkClasses = cn(
    'text-primary transition-colors hover:text-primary/80',
    TYPOGRAPHY.TEXT_BASE,
    link.type === 'email' && 'font-mono',
  );

  const content = (
    <>
      <Link href={link.href as Route} className={linkClasses}>
        {link.text}
      </Link>
      {showSeparator && (
        <span className='hidden text-muted-foreground sm:inline' aria-hidden='true'>
          •
        </span>
      )}
    </>
  );

  return content;
}

ContactFooter.displayName = 'ContactFooter';
