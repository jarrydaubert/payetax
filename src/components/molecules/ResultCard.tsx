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
  default: 'border-border bg-card',
  success: 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10',
  warning: 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10',
  info: 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
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
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn('group', className)}
    >
      <Card className={cn('relative overflow-hidden p-4', variantStyles[variant])}>
        {/* Shimmer effect on hover */}
        <motion.div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent'
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />

        <div className='relative space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-muted-foreground text-sm'>{label}</p>
            {Icon && (
              <Icon className='h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground' />
            )}
          </div>
          <p className='font-bold text-2xl text-foreground'>{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}
