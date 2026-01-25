// src/components/atoms/TrackedCTA.tsx
'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface TrackedCTAProps {
  href: Route | (string & {});
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  icon?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * CTA button atom - pure presentation component
 * Analytics tracking should be handled by the parent via onClick prop
 */
export function TrackedCTA({
  href,
  children,
  className,
  style,
  icon = true,
  onClick,
}: TrackedCTAProps) {
  return (
    <Link href={href as Route} className={className} style={style} onClick={(e) => onClick?.(e)}>
      {children}
      {icon && (
        <ArrowRight className='h-[18px] w-[18px] transition-transform group-hover:translate-x-1' />
      )}
    </Link>
  );
}
