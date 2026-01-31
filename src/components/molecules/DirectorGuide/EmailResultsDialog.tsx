// src/components/molecules/DirectorGuide/EmailResultsDialog.tsx
'use client';

import { Mail } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ICON_SIZES } from '@/constants/designTokens';
import type { StrategyComparison } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';

interface EmailResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: StrategyComparison | null;
}

export function EmailResultsDialog({ open, onOpenChange, comparison }: EmailResultsDialogProps) {
  const emailInputId = useId();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!comparison) {
      toast.error('No results to send');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/send-director-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          results: {
            grossProfit: comparison.grossProfit,
            strategies: comparison.strategies,
            recommended: comparison.recommended,
            savingsVsAllSalary: comparison.savingsVsAllSalary,
          },
          taxYear: '2025-26',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success('Results sent!', {
        description: `Check your inbox at ${email}`,
      });
      onOpenChange(false);
      setEmail('');
    } catch {
      toast.error('Failed to send email', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-white/10 bg-[#0f172a] text-slate-100 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-slate-100'>
            <Mail className={ICON_SIZES.SIZE_5} />
            Email Your Results
          </DialogTitle>
          <DialogDescription className='text-slate-400'>
            We&apos;ll send your director pay breakdown to your inbox. Your data goes straight to
            you - we never store it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
          <div className='space-y-2'>
            <label htmlFor={emailInputId} className='font-medium text-slate-300 text-sm'>
              Email address
            </label>
            <div className='relative'>
              <Mail
                className={cn(
                  'absolute top-1/2 left-3 -translate-y-1/2 text-slate-500',
                  ICON_SIZES.SIZE_4,
                )}
              />
              <Input
                id={emailInputId}
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='border-white/10 bg-[#1e293b] pl-10 text-slate-100 placeholder:text-slate-500'
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isLoading || !email}
              className='bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#020617] hover:opacity-90'
            >
              {isLoading ? 'Sending...' : 'Send Results'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
