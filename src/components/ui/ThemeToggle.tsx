// src/components/ui/ThemeToggle.tsx
'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const labels = {
    light: 'Light mode',
    dark: 'Dark mode',
    system: 'System preference',
  };

  const Icon = icons[theme];

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            onClick={cycleTheme}
            aria-label={`Current theme: ${labels[theme]}. Click to cycle themes.`}
            aria-live='polite'
            className='h-9 w-9'
          >
            <Icon className='h-5 w-5 transition-all' />
            <span className='sr-only'>{labels[theme]} (click to cycle)</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <p className='text-sm'>
            Theme: <span className='font-semibold'>{theme}</span>
          </p>
          <p className='text-muted-foreground text-xs'>Click to cycle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
