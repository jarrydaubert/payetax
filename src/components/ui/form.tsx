// src/components/ui/form.tsx
'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  tooltip?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  tooltip,
  required,
  children,
  className,
}: FormFieldProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('space-y-2', className)}
    >
      <div className='flex items-center justify-between'>
        <Label htmlFor={htmlFor} className='flex items-center gap-1.5'>
          {label}
          {required && <span className='text-destructive text-sm'>*</span>}
          {tooltip && (
            <div className='relative'>
              <button
                type='button'
                className='text-muted-foreground transition-colors hover:text-foreground'
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info className='h-3.5 w-3.5' />
              </button>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='absolute top-full left-0 z-50 mt-1.5 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground text-xs shadow-lg'
                >
                  {tooltip}
                </motion.div>
              )}
            </div>
          )}
        </Label>
      </div>
      {description && !error && <p className='text-muted-foreground text-sm'>{description}</p>}
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-destructive text-sm'
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
