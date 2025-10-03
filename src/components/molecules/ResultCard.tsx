// src/components/molecules/ResultCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: 'border-border/50 bg-secondary/60 backdrop-blur-md',
  success:
    'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md',
  warning:
    'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md',
  info: 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md',
};

export function ResultCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
  delay = 0,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      <Card className={cn('p-4', variantStyles[variant])}>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-muted-foreground text-sm'>{label}</p>
            {Icon && <Icon className='h-4 w-4 text-muted-foreground' />}
          </div>
          <p className='font-bold text-2xl text-foreground'>{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}
