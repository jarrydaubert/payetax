// src/components/molecules/HowToStepCard.tsx
import * as React from 'react';
import { Card } from '@/components/ui/card';

export interface HowToStepCardProps {
  step: number;
  title: string;
  description: string;
}

export function HowToStepCard({ step, title, description }: HowToStepCardProps) {
  return (
    <Card className='group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl'>
      <div className='absolute top-4 right-4 font-bold text-[80px] text-primary/10'>{step}</div>
      <div className='relative'>
        <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-2xl text-white shadow-lg'>
          {step}
        </div>
        <h3 className='mb-3 font-bold text-foreground text-xl'>{title}</h3>
        <p className='text-muted-foreground leading-relaxed'>{description}</p>
      </div>
    </Card>
  );
}
