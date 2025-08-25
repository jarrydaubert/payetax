// src/components/ui/ImageWithFallback.tsx
/**
 * Enhanced Image component with fallback and progressive loading
 *
 * This component extends Next.js Image with improved error handling,
 * fallback images, and accessibility features for a better user experience.
 *
 * @module components/ui/ImageWithFallback
 */

'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for ImageWithFallback component
 * Extends Next.js ImageProps with additional fallback options
 */
interface ImageWithFallbackProps extends Omit<ImageProps, 'onError' | 'src'> {
  /** Primary image source URL */
  src: string;
  /** Optional fallback image to display if primary image fails to load */
  fallbackSrc?: string;
  /** Optional lower quality version for initial loading */
  lowQualitySrc?: string;
  /** Callback fired when the image successfully loads */
  onLoad?: () => void;
  /** Additional CSS classes for the image */
  className?: string;
  /** CSS classes for the outer container */
  containerClassName?: string;
}

/**
 * Enhanced image component with fallback and progressive loading
 *
 * This component extends Next.js Image with:
 * - Fallback image support for broken images
 * - Low quality image placeholder for progressive loading
 * - Smooth transitions between loading states
 * - Proper accessibility attributes
 * - Container management for layout
 *
 * @param props Component props with fallback and loading options
 * @returns Enhanced image component
 */
export function ImageWithFallback({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  lowQualitySrc,
  alt,
  onLoad,
  className,
  containerClassName,
  ...props
}: ImageWithFallbackProps): React.ReactElement {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  /**
   * Handler for successful image loading
   */
  const handleLoad = (): void => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  /**
   * Handler for image loading errors
   * Falls back to the fallbackSrc if the primary image fails
   */
  const handleError = (): void => {
    setIsError(true);
    if (!imgSrc.includes(fallbackSrc)) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden', // Ensure full width/height
        containerClassName
      )}
      aria-busy={!isLoaded}
    >
      {/* Low quality placeholder image shown during loading */}
      {lowQualitySrc && !isLoaded && !isError && (
        <Image
          src={lowQualitySrc}
          alt=''
          className={cn(
            'absolute inset-0 h-full w-full object-cover opacity-75 blur-md',
            className
          )}
          fill // Match main image layout
          {...props}
          aria-hidden='true'
          priority={false}
          quality={10}
        />
      )}

      {/* Main image with graceful loading/error handling */}
      <Image
        {...props}
        src={imgSrc}
        alt={alt || 'Image'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'h-full w-full transition-opacity duration-500', // Ensure image fills container
          !isLoaded && 'opacity-0',
          isLoaded && 'opacity-100',
          className
        )}
      />

      {/* Accessible loading indicator for screen readers */}
      {!isLoaded && (
        <span className='sr-only' aria-live='polite'>
          Loading image: {alt}
        </span>
      )}

      {/* Accessible error message for screen readers */}
      {isError && (
        <span className='sr-only' aria-live='assertive'>
          Image failed to load: {alt}
        </span>
      )}
    </div>
  );
}

export default ImageWithFallback;
