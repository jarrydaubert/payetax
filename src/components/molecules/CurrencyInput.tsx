// src/components/molecules/CurrencyInput.tsx
'use client';

import { PoundSterling } from 'lucide-react';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  inline?: boolean;
  'data-testid'?: string;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  min = 0,
  max,
  className,
  inline = true,
  'data-testid': dataTestId,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Format number with commas
  const formatWithCommas = React.useCallback((num: number): string => {
    if (num === 0) return '';
    return num.toLocaleString('en-GB');
  }, []);

  // Remove commas from string
  const removeCommas = React.useCallback((str: string): string => {
    return str.replace(/,/g, '');
  }, []);

  // Sync external value changes
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : formatWithCommas(value));
    }
  }, [value, isFocused, formatWithCommas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = removeCommas(e.target.value);

    // Only allow numbers
    if (rawValue && !/^\d+$/.test(rawValue)) return;

    // Update display with commas
    setDisplayValue(rawValue ? Number.parseInt(rawValue, 10).toLocaleString('en-GB') : '');

    // Parse and validate
    const numValue = rawValue ? Number.parseInt(rawValue, 10) : 0;
    if (numValue >= min && (max === undefined || numValue <= max)) {
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Clear if zero
    if (value === 0) {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format on blur
    const numValue = removeCommas(displayValue);
    const parsedValue = numValue ? Number.parseInt(numValue, 10) : 0;
    setDisplayValue(parsedValue === 0 ? '' : formatWithCommas(parsedValue));
  };

  if (inline) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Label htmlFor={id} className='min-w-[140px] text-sm'>
          {label}
        </Label>
        <div className='relative flex-1'>
          <PoundSterling className='-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground' />
          <Input
            id={id}
            type='text'
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className='pl-9'
            data-testid={dataTestId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className='relative'>
        <PoundSterling className='-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground' />
        <Input
          id={id}
          type='text'
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className='pl-9'
          data-testid={dataTestId}
        />
      </div>
    </div>
  );
}
