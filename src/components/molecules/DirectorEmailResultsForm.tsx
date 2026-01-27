// src/components/molecules/DirectorEmailResultsForm.tsx
'use client';

import { Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ICON_SIZES } from '@/constants/designTokens';
import type { StrategyResult } from '@/lib/tax/strategyComparison';
import { cn } from '@/lib/utils';

interface DirectorEmailResultsFormProps {
  grossProfit: number;
  strategy: StrategyResult;
  taxYear?: string;
  className?: string;
}

export function DirectorEmailResultsForm({
  grossProfit,
  strategy,
  taxYear,
  className,
}: DirectorEmailResultsFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.includes('@')) {
      toast.error('Please enter a valid email address');
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
            grossProfit,
            strategy,
          },
          taxYear,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setIsSent(true);
      toast.success('Results sent!', {
        description: `Check your inbox at ${email}`,
      });
    } catch {
      toast.error('Failed to send email', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg border border-emerald/20 bg-emerald/10 px-4 py-3 text-emerald text-sm',
          className
        )}
      >
        <Mail className={ICON_SIZES.SIZE_4} />
        <span>Results sent to {email}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <div className='relative flex-1'>
        <Mail
          className={cn(
            'absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground',
            ICON_SIZES.SIZE_4
          )}
        />
        <Input
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='pl-10'
          disabled={isLoading}
          aria-label='Email address for director results'
        />
      </div>
      <Button type='submit' disabled={isLoading || !email} variant='outline'>
        {isLoading ? (
          <span className='animate-pulse'>Sending...</span>
        ) : (
          <>
            <Send className={cn('mr-2', ICON_SIZES.SIZE_4)} />
            Email Results
          </>
        )}
      </Button>
    </form>
  );
}
