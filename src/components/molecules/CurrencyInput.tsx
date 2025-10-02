// src/components/molecules/CurrencyInput.tsx
'use client';

import { motion } from 'framer-motion';
import { PoundSterling } from 'lucide-react';
import * as React from 'react';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  tooltip?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  description,
  tooltip,
  required = false,
  placeholder = '0',
  min = 0,
  max,
  className,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value.toString());
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync external value changes
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);

    // Parse and validate
    const numValue = Number.parseFloat(rawValue) || 0;
    if (numValue >= min && (max === undefined || numValue <= max)) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format on blur
    const numValue = Number.parseFloat(displayValue) || 0;
    setDisplayValue(numValue.toString());
  };

  return (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      tooltip={tooltip}
      required={required}
      className={className}
    >
      <div className='relative'>
        <motion.div
          initial={false}
          animate={{ scale: isFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
          className='relative'
        >
          <PoundSterling className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            id={id}
            type='number'
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            className={cn(
              'pl-9',
              'transition-all duration-200',
              isFocused && 'ring-2 ring-primary/20'
            )}
          />
        </motion.div>
      </div>
    </FormField>
  );
}
