import { Card } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
        'group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl',
        SPACING.P_6
      )}
    >
      <div className={cn('absolute font-bold text-[80px] text-primary/10', 'top-4 right-4')}>
        {step}
      </div>
      <div className='relative'>
        <div
          className={cn(
            'mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-white shadow-lg',
            TYPOGRAPHY.TEXT_2XL
          )}
        >
          {step}
        </div>
        <h3 className={cn('font-bold text-foreground', SPACING.MB_3, TYPOGRAPHY.TEXT_XL)}>
          {title}
        </h3>
        <p className='text-muted-foreground leading-relaxed'>{description}</p>
      </div>
    </Card>
  );
}
