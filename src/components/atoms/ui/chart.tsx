'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

// Chart color system matching our tax calculator theme
const CHART_COLORS = {
  employment: 'hsl(210 100% 50%)', // Blue - Employment income
  other: 'hsl(280 70% 60%)', // Purple - Other income
  incomeTax: 'hsl(0 72% 51%)', // Red - Income tax
  ni: 'hsl(38 92% 50%)', // Amber - National Insurance
  studentLoan: 'hsl(33 100% 50%)', // Orange - Student loan
  pension: 'hsl(280 70% 60%)', // Purple - Pension
  netPay: 'hsl(142 71% 45%)', // Green - Net pay
};

// Format Configuration
const ChartContext = React.createContext<{
  config: Record<string, { label: string; color?: string; icon?: React.ComponentType }>;
} | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

interface ChartContainerProps extends React.ComponentProps<'div'> {
  config: Record<string, { label: string; color?: string; icon?: React.ComponentType }>;
  children: React.ReactNode;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          className={cn('flex aspect-auto h-[250px] w-full justify-center text-xs', className)}
          {...props}
        >
          {children}
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

// Tooltip Components
const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    name?: string;
    dataKey?: string;
    color?: string;
    payload?: Record<string, unknown>;
    fill?: string;
  }>;
  label?: string | number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  nameKey?: string;
  labelKey?: string;
  className?: string;
  labelClassName?: string;
  labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode;
  formatter?: (
    value: number | string,
    name: string,
    item: unknown,
    index: number,
    payload: unknown[]
  ) => React.ReactNode;
  color?: string;
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || 'value'}`;
      const itemConfig = config[key];
      const value =
        !labelKey && typeof label === 'string'
          ? config[label]?.label || label
          : itemConfig?.label || item.name;

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!(active && payload?.length)) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {tooltipLabel}
        <div className='grid gap-1.5'>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = config[key];
            const indicatorColor =
              color ||
              (item.payload && 'fill' in item.payload ? item.payload.fill : undefined) ||
              item.color;

            return (
              <div
                key={`${item.dataKey}-${index}`}
                className='flex w-full items-center gap-2 text-xs'
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      'h-2.5 w-2.5 shrink-0 rounded-[2px]',
                      indicator === 'dot' && 'rounded-full',
                      indicator === 'line' && 'w-1'
                    )}
                    style={{
                      backgroundColor: indicatorColor as string | undefined,
                    }}
                  />
                )}
                <div className='flex flex-1 justify-between gap-2 leading-none'>
                  <span className='text-muted-foreground'>{itemConfig?.label || item.name}</span>
                  <span className='font-medium font-mono text-foreground tabular-nums'>
                    {formatter
                      ? formatter(item.value || 0, item.name || '', item, index, payload)
                      : item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

// Legend Components
const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends React.ComponentProps<'div'> {
  payload?: Array<{ value: string; type?: string; color?: string }>;
  nameKey?: string;
  hideIcon?: boolean;
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, hideIcon = false, payload, nameKey }, ref) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div ref={ref} className={cn('flex items-center justify-center gap-4 text-xs', className)}>
        {payload.map((item) => {
          // Type assertion for payload items from recharts library
          const dataKey = 'dataKey' in item ? (item.dataKey as string) : undefined;
          const key = `${nameKey || item.value || dataKey || 'value'}`;
          const itemConfig = config[key];

          return (
            <div
              key={item.value}
              className='flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
            >
              {!hideIcon && (
                <div
                  className='h-2 w-2 shrink-0 rounded-[2px]'
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.icon && <itemConfig.icon />}
              <span className='text-muted-foreground'>{itemConfig?.label || item.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = 'ChartLegendContent';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartContext,
  useChart,
  CHART_COLORS,
};
