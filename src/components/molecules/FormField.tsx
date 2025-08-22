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
      <div className="flex justify-between items-baseline mb-1.5">
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium flex items-center',
            error ? 'text-destructive' : 'text-foreground'
          )}
        >
          {label}
          {required && showRequired && <span className="text-destructive ml-1 text-xs">*</span>}

          {tooltip && (
            <div className="relative ml-1.5">
              <button
                type="button"
                aria-label="Show more information"
                className="text-foreground/50 hover:text-foreground/80 focus:outline-none focus:text-foreground transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info size={14} />
              </button>

              {showTooltip && (
                <div className="absolute z-50 left-0 top-full mt-1 w-64 p-3 text-xs bg-glass backdrop-blur-glass rounded-md shadow-glass animate-fade-in">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </label>
      </div>

      {/* Description text */}
      {description && !error && <p className="mb-1.5 text-xs text-foreground/70">{description}</p>}

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
        <p className="mt-2 text-xs text-destructive flex items-center animate-fade-in">
          <AlertCircle size={12} className="mr-1 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
