// src/components/molecules/PeriodSelector.tsx
// Modern component for selecting which pay periods to display in results

import { Popover } from '@headlessui/react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export const DISPLAY_PERIODS = [
  { id: 'yearly', label: 'Yearly', description: 'Annual salary and deductions' },
  { id: 'monthly', label: 'Monthly', description: 'Monthly pay (annual ÷ 12)' },
  { id: 'fourWeekly', label: '4-Weekly', description: 'Four-week pay periods (annual ÷ 13)' },
  { id: 'fortnightly', label: 'Fortnightly', description: 'Every two weeks (annual ÷ 26)' },
  { id: 'weekly', label: 'Weekly', description: 'Weekly salary (annual ÷ 52)' },
  { id: 'daily', label: 'Daily', description: 'Working day rate (annual ÷ 260)' },
  { id: 'hourly', label: 'Hourly', description: 'Hourly rate based on your working hours' },
] as const;

export type DisplayPeriod = (typeof DISPLAY_PERIODS)[number]['id'];

interface PeriodSelectorProps {
  /** Selected pay periods */
  selectedPeriods: DisplayPeriod[];
  /** Callback when selected periods change */
  onChange: (periods: DisplayPeriod[]) => void;
  /** Callback when a single period is toggled */
  onToggle?: (period: DisplayPeriod) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show as tabs instead of dropdown */
  showTabs?: boolean;
  /** Maximum number of visible period labels */
  maxVisible?: number;
  /** Label for the selector */
  label?: string;
}

/**
 * Pay period selection component for choosing which time periods to display
 * Can be displayed as either a dropdown or as tabs
 */
const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriods,
  onChange,
  className,
  showTabs = false,
  maxVisible = 3,
  label = 'Pay Periods',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle selection change
  const handlePeriodToggle = (period: DisplayPeriod) => {
    const newSelectedPeriods = selectedPeriods.includes(period)
      ? selectedPeriods.filter((p) => p !== period)
      : [...selectedPeriods, period];

    // Ensure at least one period is selected
    if (newSelectedPeriods.length === 0) {
      return;
    }

    onChange(newSelectedPeriods);
  };

  // Get visible period labels for button text
  const getVisiblePeriodsText = () => {
    if (selectedPeriods.length <= maxVisible) {
      return selectedPeriods
        .map((id) => DISPLAY_PERIODS.find((p) => p.id === id)?.label || id)
        .join(', ');
    }

    const visibleLabels = selectedPeriods
      .slice(0, maxVisible)
      .map((id) => DISPLAY_PERIODS.find((p) => p.id === id)?.label || id);

    return `${visibleLabels.join(', ')} +${selectedPeriods.length - maxVisible} more`;
  };

  // Render tabs if showTabs is true
  if (showTabs) {
    return (
      <fieldset className={cn('flex flex-wrap gap-1', className)} aria-label={label}>
        <legend className="sr-only">{label}</legend>
        {DISPLAY_PERIODS.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => handlePeriodToggle(period.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              selectedPeriods.includes(period.id)
                ? 'bg-primary text-primary-foreground'
                : 'bg-glass-deep hover:bg-glass text-foreground/80'
            )}
            aria-pressed={selectedPeriods.includes(period.id)}
            aria-label={`${period.label} period`}
          >
            {period.label}
          </button>
        ))}
      </fieldset>
    );
  }

  // Render dropdown with improved z-index
  return (
    <Popover className={cn('relative', className)}>
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'inline-flex items-center px-3 py-2 rounded-md transition-colors',
              'border border-glass bg-glass hover:bg-glass-deep',
              'focus:outline-none focus:ring-2 focus:ring-ring text-sm font-medium',
              open && 'ring-2 ring-ring ring-offset-1'
            )}
            aria-label={`Select pay periods, currently: ${getVisiblePeriodsText()}`}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <Calendar className="h-4 w-4 mr-2 text-foreground/70" aria-hidden="true" />
            <span className="max-w-[150px] truncate">{getVisiblePeriodsText()}</span>
            <ChevronDown
              className={cn(
                'ml-2 h-4 w-4 text-foreground/70 transition-transform duration-200',
                open && 'transform rotate-180'
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          {isOpen && (
            <div
              ref={popoverRef}
              className={cn(
                'fixed md:absolute right-0 mt-2 w-56 rounded-md shadow-glass',
                'bg-glass border border-glass animate-fade-in origin-top-right',
                'z-super popover-dropdown' // Use our utility classes
              )}
              style={{
                top: '100%',
                zIndex: 9999, // Inline style for maximum specificity
              }}
            >
              <div className="py-1 divide-y divide-glass">
                <div className="px-3 py-2">
                  <h3 className="text-sm font-medium text-foreground">{label}</h3>
                  <p className="text-xs text-foreground/70 mt-1">
                    Select which pay periods to display in results
                  </p>
                </div>

                <ul className="py-1" aria-multiselectable="true">
                  {DISPLAY_PERIODS.map((period) => (
                    <li
                      key={period.id}
                      className="px-2"
                      aria-selected={selectedPeriods.includes(period.id)}
                    >
                      <button
                        type="button"
                        className={cn(
                          'w-full text-left px-2 py-2 text-sm flex items-center justify-between rounded-md',
                          'hover:bg-glass-deep transition-colors',
                          'focus:outline-none focus:bg-glass-deep'
                        )}
                        onClick={() => handlePeriodToggle(period.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{period.label}</span>
                          <span className="text-xs text-foreground/70">{period.description}</span>
                        </div>
                        {selectedPeriods.includes(period.id) && (
                          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="px-3 py-2 text-right">
                  <span className="text-xs text-foreground/70">
                    {selectedPeriods.length} selected
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Popover>
  );
};

export default PeriodSelector;
