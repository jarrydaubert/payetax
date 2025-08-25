// src/components/molecules/ScrollIndicator.tsx
// A small component to indicate horizontal scrolling is available on mobile

import { ArrowLeftRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScrollIndicatorProps {
  targetRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
  className?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ targetRef, className }) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!targetRef.current) return;

    const checkOverflow = () => {
      const element = targetRef.current;
      if (element) {
        setShowIndicator(element.scrollWidth > element.clientWidth);
      }
    };

    // Check on mount
    checkOverflow();

    // Check on resize
    window.addEventListener('resize', checkOverflow);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [targetRef]);

  if (!showIndicator) return null;

  return (
    <div className={`mb-2 flex items-center justify-center text-gray-500 text-xs ${className}`}>
      <ArrowLeftRight className='mr-1 h-3 w-3' />
      <span>Swipe horizontally to see more</span>
    </div>
  );
};

export default ScrollIndicator;
