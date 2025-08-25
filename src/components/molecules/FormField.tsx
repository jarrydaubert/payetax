// src/components/molecules/FormField.tsx

import { AlertCircle, Info } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  showRequired?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
  tooltip?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  description,
  required = false,
  showRequired = true,
  error,
  className,
  children,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={cn('mb-5', className)}>
      {/* Label with required indicator and tooltip */}
      <div className='mb-1.5 flex items-baseline justify-between'>
        <label
          htmlFor={id}
          className={cn(
            'block flex items-center font-medium text-sm',
            error ? 'text-destructive' : 'text-foreground'
          )}
        >
          {label}
          {required && showRequired && <span className='ml-1 text-destructive text-xs'>*</span>}

          {tooltip && (
            <div className='relative ml-1.5'>
              <button
                type='button'
                aria-label='Show more information'
                className='text-foreground/50 transition-colors hover:text-foreground/80 focus:text-foreground focus:outline-none'
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info size={14} />
              </button>

              {showTooltip && (
                <div className='absolute top-full left-0 z-50 mt-1 w-64 animate-fade-in rounded-md bg-glass p-3 text-xs shadow-glass backdrop-blur-glass'>
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </label>
      </div>

      {/* Description text */}
      {description && !error && <p className='mb-1.5 text-foreground/70 text-xs'>{description}</p>}

      {/* Input wrapper with error styling */}
      <div
        className={cn(
          error ? 'ring-1 ring-destructive/50' : '',
          'rounded-md transition-all duration-200'
        )}
      >
        {children}
      </div>

      {/* Error message */}
      {error && (
        <p className='mt-2 flex animate-fade-in items-center text-destructive text-xs'>
          <AlertCircle size={12} className='mr-1 flex-shrink-0' />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
