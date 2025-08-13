/**
 * src/components/ui/FeedbackButton.tsx
 *
 * A fixed-position floating action button that allows users to
 * quickly access the feedback form from anywhere in the application.
 * Primarily used on mobile devices.
 */

'use client';

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { trackSEOAction } from '@/lib/analytics';

/**
 * Props for the FeedbackButton component
 */
interface FeedbackButtonProps {
  /** Additional CSS classes */
  className?: string;

  /** Whether to make the button fixed position */
  fixed?: boolean;

  /** Optional custom label */
  label?: string;
}

/**
 * FeedbackButton component provides a floating action button
 * for users to quickly access the feedback form.
 *
 * @example
 * ```tsx
 * <FeedbackButton fixed={true} />
 * ```
 *
 * @param props Component props
 * @returns Feedback button component
 */
const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  className = '',
  fixed = true,
  label = 'Leave feedback',
}) => {
  // State to track visibility
  const [isVisible, setIsVisible] = useState(true);

  // State to track scroll position
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to potentially hide/show button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 200);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Hide the button after navigating to feedback
  const handleClick = () => {
    setIsVisible(false);
    // Track the action for analytics
    trackSEOAction('external_link', { destination: 'feedback' });
  };

  if (!isVisible) return null;

  return (
    <Link
      href="/feedback"
      onClick={handleClick}
      className={`
        ${fixed ? 'fixed bottom-16 right-4 z-20' : 'relative'} 
        flex items-center justify-center w-12 h-12 rounded-full 
        bg-blue-600 text-white shadow-lg 
        hover:bg-blue-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-all duration-300 ease-in-out
        ${scrolled ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}
        ${className}
      `}
      aria-label={label}
      title={label}
      data-test-id="feedback-button"
    >
      <MessageSquare size={20} aria-hidden="true" />

      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </Link>
  );
};

export default FeedbackButton;
