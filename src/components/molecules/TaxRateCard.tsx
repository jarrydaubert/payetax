// src/components/molecules/TaxRateCard.tsx
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface TaxRateItem {
  label: string;
  value: string;
  colorClass?: string;
}

export interface TaxRateCardProps {
  icon: LucideIcon;
  title: string;
  items: TaxRateItem[];
  footerNote?: string;
}

export function TaxRateCard({ icon: Icon, title, items, footerNote }: TaxRateCardProps) {
  return (
    <Card className='group overflow-hidden border-primary/20 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl'>
      <div className='mb-4 flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'>
          <Icon className='size-5 text-white' />
        </div>
        <h3 className='font-bold text-foreground text-lg'>{title}</h3>
      </div>
      <ul className='space-y-3'>
        {items.map((item) => (
          <li key={item.label} className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
            <span className='text-muted-foreground'>{item.label}</span>
            <strong className={item.colorClass || 'text-foreground'}>{item.value}</strong>
          </li>
        ))}
        {footerNote && (
          <li className='pt-1 text-center text-muted-foreground text-xs'>{footerNote}</li>
        )}
      </ul>
    </Card>
  );
}
