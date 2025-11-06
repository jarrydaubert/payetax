// src/components/molecules/SimpleHero.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { GlowButton } from '@/components/ui/GlowButton';
import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn } from '@/lib/utils';

interface SimpleHeroProps {
  className?: string;
  onScrollToCalculator?: () => void;
  /** Enable subtle parallax effect on scroll (default: true) */
  enableParallax?: boolean;
}

export default function SimpleHero({
  className,
  onScrollToCalculator,
  enableParallax = true,
}: SimpleHeroProps) {
  const shouldReduceMotion = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax effect: Content moves up slightly as user scrolls down
  // Only active if motion is enabled and parallax is requested
  const { scrollY } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollY, [0, 500], [0, shouldReduceMotion || !enableParallax ? 0 : -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Accessibility landmark for skip-to-content link
    <section
      id='main-content'
      ref={sectionRef}
      className={cn(
        'relative flex items-center justify-center py-16 md:min-h-screen md:py-20',
        className
      )}
    >
      {/* Content with parallax effect */}
      <motion.div
        style={shouldReduceMotion || !enableParallax ? {} : { y, opacity }}
        className='relative z-10 mx-auto max-w-5xl px-2 text-center sm:px-4'
      >
        {/* Heading - No animation for LCP optimization */}
        {/* IMPORTANT: Uses TEXT_4XL for hero headline (responsive: text-4xl sm:text-5xl md:text-6xl)
            Maintains responsive scaling while using design token base size */}
        <h1
          className={cn(
            'mx-auto mb-6 max-w-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl',
            TYPOGRAPHY.TEXT_4XL
          )}
        >
          Free UK PAYE Tax
          <br />
          <span className='text-gradient'>Calculator 2025-2026</span>
        </h1>

        {/* Description */}
        <p className={cn('mx-auto mb-10 max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Calculate your take-home pay instantly. Includes income tax, National Insurance, student
          loans, and pension contributions.
        </p>

        {/* CTA Button with Premium Glow Effect */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { ...ANIMATION_TRANSITIONS.default, delay: 0.2 }
          }
          className='inline-block'
        >
          <GlowButton onClick={onScrollToCalculator} glowColor='primary'>
            <span className={cn('flex items-center', SPACING.GAP_2)}>
              Calculate My Salary
              <ArrowRight
                className={cn(ICON_SIZES.SIZE_4, 'transition-transform group-hover:translate-x-1')}
              />
            </span>
          </GlowButton>
        </motion.div>

        {/* Features */}
        <div
          className={cn(
            'mt-16 flex flex-wrap items-center justify-center text-muted-foreground',
            SPACING.GAP_8,
            TYPOGRAPHY.TEXT_SM
          )}
        >
          {[
            'Accurate Calculations',
            '2025-2026 Tax Year',
            'Scottish Tax Support',
            'Instant Results',
          ].map((feature) => (
            <div key={feature} className={cn('flex items-center', SPACING.GAP_2)}>
              <div className='h-1.5 w-1.5 rounded-full bg-primary' />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
