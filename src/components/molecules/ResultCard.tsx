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
  default: {
    card: '',
    icon: 'text-primary',
  },
  success: {
    card: '',
    icon: 'text-green-600 dark:text-green-400',
  },
  warning: {
    card: '',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    card: '',
    icon: 'text-blue-600 dark:text-blue-400',
  },
};

export function ResultCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
  delay = 0,
}: ResultCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      <Card className={cn('border-primary/20 p-4', styles.card)}>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-muted-foreground text-sm'>{label}</p>
            {Icon && <Icon className={cn('size-4', styles.icon)} />}
          </div>
          <p className='font-bold text-2xl text-foreground'>{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}
