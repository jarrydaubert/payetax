import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface HowToStepCardProps {
  step: number;
  title: string;
  description: string;
}

/**
 * How-to step card component
 * Uses design tokens for typography consistency
 */
export function HowToStepCard({ step, title, description }: HowToStepCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-sm border border-primary/25 bg-card transition-colors hover:border-primary/45',
        'p-6',
      )}
    >
      <div className={cn('absolute font-bold text-primary/10', 'text-7xl', 'top-4 right-4')}>
        {step}
      </div>
      <div className='relative'>
        <div
          className={cn(
            'mb-4 flex size-14 items-center justify-center rounded-sm border border-primary/25 bg-background font-mono font-semibold text-primary',
            'text-2xl',
          )}
        >
          {step}
        </div>
        <h3 className={cn('font-display font-semibold text-foreground', 'mb-3', 'text-xl')}>
          {title}
        </h3>
        <p className='text-muted-foreground leading-relaxed'>{description}</p>
      </div>
    </Card>
  );
}
