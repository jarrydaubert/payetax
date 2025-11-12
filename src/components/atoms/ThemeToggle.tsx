// src/components/ui/ThemeToggle.tsx
'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'inline-flex rounded-lg border border-border bg-muted',
          'gap-0.5',
          SPACING.P_1
        )}
      >
        {options.map(({ value, icon: Icon, label }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setTheme(value)}
                aria-label={`Switch to ${label} mode`}
                aria-pressed={theme === value}
                className={cn(
                  'size-7 transition-all',
                  theme === value
                    ? 'bg-background text-foreground shadow-sm hover:bg-background/90'
                    : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                )}
              >
                <Icon className='size-4' />
                <span className='sr-only'>{label} mode</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className={TYPOGRAPHY.TEXT_XS}>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
