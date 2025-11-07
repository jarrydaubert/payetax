/**
 * Animation design tokens for consistent motion design
 *
 * Centralized animation values for durations, easings, and common variants.
 * Ensures consistency across the application and aligns with design system.
 *
 * @module constants/animationTokens
 */

import type { Transition, Variants } from 'framer-motion';

/**
 * Standard animation durations in seconds
 * Based on Material Design motion guidelines
 */
export const ANIMATION_DURATIONS = {
  /** Very fast animations (100ms) - micro-interactions */
  INSTANT: 0.1,
  /** Fast animations (200ms) - button feedback, small elements */
  FAST: 0.2,
  /** Normal animations (300ms) - most UI transitions */
  NORMAL: 0.3,
  /** Slow animations (500ms) - large elements, page transitions */
  SLOW: 0.5,
  /** Very slow animations (800ms) - emphasis, special effects */
  SLOWER: 0.8,
} as const;

/**
 * Standard easing curves for natural motion
 * Uses cubic-bezier values compatible with Framer Motion
 */
export const ANIMATION_EASINGS = {
  /** Default easing (Material Design standard) - balanced acceleration/deceleration */
  DEFAULT: [0.4, 0, 0.2, 1] as const,
  /** Smooth easing - gentle deceleration, good for content reveals */
  SMOOTH: [0.4, 0, 0.6, 1] as const,
  /** Sharp easing - quick exit, less entrance */
  SHARP: [0.4, 0, 1, 1] as const,
  /** Ease-out - starts fast, ends slow */
  EASE_OUT: [0, 0, 0.2, 1] as const,
  /** Ease-in - starts slow, ends fast */
  EASE_IN: [0.4, 0, 1, 1] as const,
} as const;

/**
 * Spring animation configurations for natural bouncy motion
 */
export const ANIMATION_SPRINGS = {
  /** Standard spring - balanced stiffness and damping */
  DEFAULT: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  /** Gentle spring - soft, subtle bounce */
  GENTLE: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  /** Bouncy spring - emphasized bounce effect */
  BOUNCY: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
  },
  /** Stiff spring - quick, minimal bounce */
  STIFF: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 40,
  },
} as const;

/**
 * Reusable animation variants for common patterns
 * Can be applied directly to motion components via variants prop
 */
export const ANIMATION_VARIANTS = {
  /** Simple fade in/out */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } satisfies Variants,

  /** Fade in with upward slide */
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } satisfies Variants,

  /** Fade in with downward slide */
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  } satisfies Variants,

  /** Fade in with scale */
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  } satisfies Variants,

  /** Slide in from left */
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  } satisfies Variants,

  /** Slide in from right */
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  } satisfies Variants,

  /** Pop in effect with scale and slight bounce */
  popIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  } satisfies Variants,
} as const;

/**
 * Stagger configurations for sequential animations
 */
export const ANIMATION_STAGGER = {
  /** Fast stagger - 50ms between items */
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0,
  },

  /** Normal stagger - 100ms between items */
  normal: {
    staggerChildren: 0.1,
    delayChildren: 0,
  },

  /** Slow stagger - 150ms between items */
  slow: {
    staggerChildren: 0.15,
    delayChildren: 0,
  },
} as const;

/**
 * Container variants for staggered children animations
 * Apply to parent container, children will animate sequentially
 *
 * @example
 * ```typescript
 * <motion.div variants={ANIMATION_CONTAINER_VARIANTS.staggerFast} initial="hidden" animate="show">
 *   <motion.div variants={ANIMATION_VARIANTS.fadeInUp}>Child 1</motion.div>
 *   <motion.div variants={ANIMATION_VARIANTS.fadeInUp}>Child 2</motion.div>
 * </motion.div>
 * ```
 */
export const ANIMATION_CONTAINER_VARIANTS = {
  /** Fast stagger - 50ms between children */
  staggerFast: {
    hidden: {},
    show: {
      transition: ANIMATION_STAGGER.fast,
    },
  } satisfies Variants,

  /** Normal stagger - 100ms between children */
  staggerNormal: {
    hidden: {},
    show: {
      transition: ANIMATION_STAGGER.normal,
    },
  } satisfies Variants,

  /** Slow stagger - 150ms between children */
  staggerSlow: {
    hidden: {},
    show: {
      transition: ANIMATION_STAGGER.slow,
    },
  } satisfies Variants,
} as const;

/**
 * Standard gesture animations for interactive elements
 */
export const ANIMATION_GESTURES = {
  /** Standard hover effect - slight scale up */
  hover: {
    scale: 1.05,
    transition: { duration: ANIMATION_DURATIONS.FAST },
  },

  /** Gentle hover effect - minimal scale */
  hoverGentle: {
    scale: 1.02,
    transition: { duration: ANIMATION_DURATIONS.FAST },
  },

  /** Strong hover effect - emphasized scale */
  hoverStrong: {
    scale: 1.1,
    transition: { duration: ANIMATION_DURATIONS.FAST },
  },

  /** Standard tap effect - scale down */
  tap: {
    scale: 0.95,
  },

  /** Gentle tap effect - minimal scale down */
  tapGentle: {
    scale: 0.98,
  },

  /** Strong tap effect - emphasized press */
  tapStrong: {
    scale: 0.9,
  },
} as const;

/**
 * Standard transitions combining duration and easing
 */
export const ANIMATION_TRANSITIONS = {
  /** Default transition - normal speed, smooth easing */
  default: {
    duration: ANIMATION_DURATIONS.NORMAL,
    ease: ANIMATION_EASINGS.DEFAULT,
  } satisfies Transition,

  /** Fast transition - quick feedback */
  fast: {
    duration: ANIMATION_DURATIONS.FAST,
    ease: ANIMATION_EASINGS.DEFAULT,
  } satisfies Transition,

  /** Slow transition - emphasis */
  slow: {
    duration: ANIMATION_DURATIONS.SLOW,
    ease: ANIMATION_EASINGS.SMOOTH,
  } satisfies Transition,

  /** Spring transition - bouncy feel */
  spring: ANIMATION_SPRINGS.DEFAULT,

  /** Layout transition - optimized for layout animations */
  layout: {
    duration: ANIMATION_DURATIONS.NORMAL,
    ease: ANIMATION_EASINGS.SMOOTH,
    layout: true,
  } satisfies Transition & { layout: boolean },
} as const;

/**
 * Helper to create transition with reduced motion support
 *
 * @param shouldReduceMotion - Whether to reduce/disable animation
 * @param transition - The transition configuration to use
 * @returns Modified transition respecting motion preferences
 *
 * @example
 * ```typescript
 * const transition = getAccessibleTransition(prefersReducedMotion, ANIMATION_TRANSITIONS.default);
 * ```
 */
export function getAccessibleTransition(
  shouldReduceMotion: boolean,
  transition: Transition
): Transition {
  if (shouldReduceMotion) {
    return { duration: 0 };
  }
  return transition;
}

/**
 * Helper to get accessible animation props
 *
 * @param shouldReduceMotion - Whether to reduce/disable animation
 * @returns Empty object if motion should be reduced, otherwise undefined
 *
 * @example
 * ```typescript
 * <motion.div
 *   initial={getAccessibleAnimation(prefersReducedMotion, { opacity: 0 })}
 *   animate={getAccessibleAnimation(prefersReducedMotion, { opacity: 1 })}
 * />
 * ```
 */
export function getAccessibleAnimation<T>(
  shouldReduceMotion: boolean,
  animation: T
): T | Record<string, never> {
  if (shouldReduceMotion) {
    return {};
  }
  return animation;
}
