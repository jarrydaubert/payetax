/**
 * Glow Button Component
 *
 * Premium button with gradient glow effect inspired by Vercel's design.
 * Features:
 * - Background blur gradient that intensifies on hover (opacity-75 to opacity-100)
 * - Smooth 500ms transition for glow effect
 * - Scale animations on hover and tap
 * - Dark button with white text
 *
 * Technique: Absolute positioned gradient with blur + relative button on top
 * The -inset-1 makes the glow extend 4px beyond the button edges
 *
 * @example
 * ```tsx
 * <GlowButton href="/calculator" glowColor="primary">
 *   Calculate Your Tax
 * </GlowButton>
 *
 * <GlowButton onClick={handleClick} glowColor="success">
 *   Submit
 * </GlowButton>
 * ```
 */
'use client';

import { motion, useAnimate } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import type React from 'react';
import { useCallback } from 'react';

interface GlowButtonProps {
  children: React.ReactNode;
  href?: Route | (string & {});
  onClick?: () => void;
  className?: string;
  glowColor?: 'primary' | 'accent' | 'success';
}

const glowColorMap = {
  primary: 'from-blue-500 via-purple-500 to-pink-500',
  accent: 'from-cyan-400 via-blue-500 to-purple-600',
  success: 'from-green-400 via-emerald-500 to-teal-500',
};

export function GlowButton({
  children,
  href,
  onClick,
  className = '',
  glowColor = 'primary',
}: GlowButtonProps) {
  // PAYTAX-75 Phase 2: useAnimate() for imperative click animation
  const [scope, animate] = useAnimate();

  // Satisfying click animation sequence
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Call onClick immediately for functionality
    if (onClick) {
      onClick();
    }

    // Then run satisfying animation in background (non-blocking)
    if (scope.current) {
      const runAnimation = async () => {
        await animate(scope.current, { scale: 0.95 }, { duration: 0.1 });
        await animate(scope.current, { scale: 1.05 }, { duration: 0.15, type: 'spring', stiffness: 400 });
        await animate(scope.current, { scale: 1 }, { duration: 0.2, type: 'spring', damping: 15 });
      };
      runAnimation();
    }
  }, [onClick, animate, scope]);
  // Handle link rendering
  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    const linkContent = (
      <div className='group relative'>
        {/* Background glow - blur effect that intensifies on hover */}
        <div
          className={`-inset-1 absolute rounded-lg bg-gradient-to-r ${glowColorMap[glowColor]} opacity-75 blur transition duration-500 group-hover:opacity-100`}
        />

        {/* Button with motion animations */}
        <motion.div
          className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-background px-5 py-2.5 font-medium text-foreground text-sm transition-all duration-300 ${className}
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    );

    if (isExternal) {
      return (
        <a href={href} className='inline-block'>
          {linkContent}
        </a>
      );
    }

    return (
      <Link href={href as Route} className='inline-block'>
        {linkContent}
      </Link>
    );
  }

  return (
    <div className='group relative inline-block'>
      {/* Background glow - blur effect that intensifies on hover */}
      <div
        className={`-inset-1 absolute rounded-lg bg-gradient-to-r ${glowColorMap[glowColor]} opacity-75 blur transition duration-500 group-hover:opacity-100`}
      />

      {/* Button with motion animations + useAnimate() sequence */}
      <motion.button
        ref={scope}
        type='button'
        onClick={handleClick}
        className={`relative flex items-center justify-center gap-2 rounded-lg bg-background px-5 py-2.5 font-medium text-foreground text-sm transition-all duration-300 ${className}
        `}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.button>
    </div>
  );
}
