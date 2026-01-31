'use client';

// src/components/organisms/BlogCarousel.tsx
/**
 * Blog Hero Carousel
 *
 * Netflix-style rotating featured articles carousel with accessibility support.
 * Uses Embla Carousel for touch/swipe support.
 *
 * Accessibility features:
 * - Visible pause/play button
 * - Keyboard navigation (arrows when focused)
 * - ARIA labels on all controls
 * - Respects prefers-reduced-motion
 * - Screen reader announcements via aria-live
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface BlogCarouselProps {
  posts: BlogPost[];
}

export function BlogCarousel({ posts }: BlogCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Autoplay plugin with configuration
  const autoplayRef = useRef(
    Autoplay({
      delay: 8000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      skipSnaps: false,
    },
    prefersReducedMotion ? [] : [autoplayRef.current]
  );

  // Update selected index on scroll
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Navigation handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Pause/play toggle
  const togglePause = useCallback(() => {
    const autoplay = autoplayRef.current;
    if (!autoplay) return;

    if (isPaused) {
      autoplay.play();
    } else {
      autoplay.stop();
    }
    setIsPaused(!isPaused);
    forceUpdate();
  }, [isPaused]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  if (posts.length === 0) return null;

  return (
    <section
      className='relative w-full'
      aria-label='Featured articles carousel'
      aria-roledescription='carousel'
    >
      {/* Screen reader live region for slide changes */}
      <div className='sr-only' aria-live='polite' aria-atomic='true'>
        Slide {selectedIndex + 1} of {posts.length}
      </div>

      {/* Carousel viewport */}
      <section
        ref={emblaRef}
        className='overflow-hidden'
        onKeyDown={handleKeyDown}
        aria-label='Featured articles'
      >
        <div className='flex touch-pan-y'>
          {posts.map((post, index) => (
            <CarouselSlide key={post.slug} post={post} isActive={index === selectedIndex} />
          ))}
        </div>
      </section>

      {/* Controls overlay */}
      <div className='pointer-events-none absolute inset-0 z-20'>
        <div className='pointer-events-auto absolute right-4 bottom-4 flex items-center gap-2 md:right-8 md:bottom-8'>
          {/* Pause/Play button */}
          {!prefersReducedMotion && (
            <button
              type='button'
              onClick={togglePause}
              className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20'
              aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
              aria-pressed={isPaused}
            >
              {isPaused ? (
                <Play className='h-4 w-4 text-white' />
              ) : (
                <Pause className='h-4 w-4 text-white' />
              )}
            </button>
          )}

          {/* Previous button */}
          <button
            type='button'
            onClick={scrollPrev}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20'
            aria-label='Previous slide'
          >
            <ChevronLeft className='h-5 w-5 text-white' />
          </button>

          {/* Next button */}
          <button
            type='button'
            onClick={scrollNext}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20'
            aria-label='Next slide'
          >
            <ChevronRight className='h-5 w-5 text-white' />
          </button>
        </div>

        {/* Dot indicators */}
        <div className='pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-8'>
          {posts.map((post, index) => (
            <button
              key={post.slug}
              type='button'
              onClick={() => scrollTo(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === selectedIndex ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}: ${post.title}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CarouselSlideProps {
  post: BlogPost;
  isActive: boolean;
}

function CarouselSlide({ post, isActive }: CarouselSlideProps) {
  const categoryKey = (post.category as CategoryKey) || 'tax-basics';
  const categoryConfig = BLOG_CATEGORIES[categoryKey] ?? BLOG_CATEGORIES['tax-basics'];

  return (
    <article
      className='relative min-w-0 flex-[0_0_100%]'
      aria-hidden={!isActive}
      aria-roledescription='slide'
    >
      {/* Gradient background based on category color */}
      <div
        className='relative aspect-[4/3] min-h-[300px] md:aspect-auto md:h-[50vh] md:max-h-[450px] md:min-h-[350px]'
        style={{
          background: `linear-gradient(135deg, ${categoryConfig.color}15 0%, ${categoryConfig.color}05 50%, #0f172a 100%)`,
        }}
      >
        {/* Subtle glow effect */}
        <div
          className='absolute top-1/4 right-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl'
          style={{ backgroundColor: categoryConfig.color }}
        />
        {/* Subtle pattern overlay */}
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03)_0%,transparent_50%)]' />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent' />

        {/* Content */}
        <div className='absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16'>
          <div className='max-w-3xl'>
            {/* Category badge */}
            <span
              className='mb-3 inline-block rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-wider'
              style={{
                backgroundColor: categoryConfig.color,
                color: categoryConfig.textColor,
              }}
            >
              {categoryConfig.label}
            </span>

            {/* Title */}
            <h2 className='mb-3 font-bold font-display text-2xl text-white tracking-tight md:text-3xl lg:text-4xl'>
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className='mb-4 line-clamp-2 text-slate-300 text-sm md:text-base lg:line-clamp-3'>
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className='flex items-center gap-4 text-slate-400 text-xs md:text-sm'>
              <span>{post.readTime}</span>
              <span>•</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </div>
          </div>
        </div>

        {/* Full-area link overlay - covers content but not controls */}
        <Link
          href={`/blog/${post.slug}`}
          className='absolute inset-0 z-10'
          aria-label={`Read article: ${post.title}`}
          tabIndex={isActive ? 0 : -1}
        >
          <span className='sr-only'>Read article</span>
        </Link>
      </div>
    </article>
  );
}

export default BlogCarousel;
