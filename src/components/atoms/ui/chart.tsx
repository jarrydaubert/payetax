'use client';

import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  createContext,
  type ElementRef,
  forwardRef,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import * as RechartsPrimitive from 'recharts';

import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Chart color palette matching PayeTax theme
 *
 * Usage: Reference these in your chart config to ensure consistent colors.
 * @example
 * ```ts
 * const chartConfig = {
 *   incomeTax: { label: 'Income Tax', color: CHART_COLORS.incomeTax },
 *   ni: { label: 'National Insurance', color: CHART_COLORS.ni },
 * };
 * ```
 */
export const CHART_COLORS = {
  employment: 'hsl(210 100% 50%)', // Blue - Employment income
  other: 'hsl(280 70% 60%)', // Purple - Other income
  incomeTax: 'hsl(0 72% 51%)', // Red - Income tax
  ni: 'hsl(38 92% 50%)', // Amber - National Insurance
  studentLoan: 'hsl(33 100% 50%)', // Orange - Student loan
  pension: 'hsl(280 70% 60%)', // Purple - Pension
  netPay: 'hsl(142 71% 45%)', // Green - Net pay
} as const;

export type ChartColorKey = keyof typeof CHART_COLORS;

/**
 * Chart series configuration
 *
 * @property label - Display label for the series
 * @property color - Color for the series (use CHART_COLORS values)
 * @property icon - Optional icon component (must accept className prop)
 */
export interface ChartSeriesConfig {
  label: string;
  color?: string;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Chart configuration object
 * Keys should match your data's dataKey values for automatic label/color resolution.
 */
export type ChartConfig = Record<string, ChartSeriesConfig>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = createContext<ChartContextValue | null>(null);

/**
 * Hook to access chart configuration from context
 * @throws Error if used outside ChartContainer
 */
function useChart(): ChartContextValue {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

/**
 * Get config for a data key with fallback to CHART_COLORS
 */
function getSeriesConfig(
  config: ChartConfig,
  key: string | undefined,
): ChartSeriesConfig | undefined {
  if (!key) return undefined;
  const configItem = config[key];
  if (configItem) return configItem;

  // Fallback: check if key matches a CHART_COLORS key
  if (key in CHART_COLORS) {
    return {
      label: key,
      color: CHART_COLORS[key as ChartColorKey],
    };
  }

  return undefined;
}

interface ChartContainerProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Chart configuration mapping dataKey to label/color/icon
   */
  config: ChartConfig;
  children: ReactNode;
}

/**
 * Chart container component
 *
 * Provides chart context and handles responsive sizing.
 *
 * @example
 * ```tsx
 * <ChartContainer
 *   config={{ incomeTax: { label: 'Income Tax', color: CHART_COLORS.incomeTax } }}
 *   role="img"
 *   aria-label="Tax breakdown chart"
 * >
 *   <ResponsiveContainer>
 *     <BarChart data={data}>...</BarChart>
 *   </ResponsiveContainer>
 * </ChartContainer>
 * ```
 */
const ChartContainer = forwardRef<ElementRef<'div'>, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    const contextValue = useMemo(() => ({ config }), [config]);

    return (
      <ChartContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'relative flex aspect-auto h-[250px] w-full justify-center',
            TYPOGRAPHY.TEXT_XS,
            // Landscape optimization: taller charts on mobile landscape
            'landscape:max-md:h-[350px]',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ChartContext.Provider>
    );
  },
);
ChartContainer.displayName = 'ChartContainer';

// Re-export Recharts Tooltip
const ChartTooltip = RechartsPrimitive.Tooltip;

/**
 * Tooltip payload item shape
 * Matches Recharts tooltip payload structure
 */
interface TooltipPayloadItem {
  value?: number | string;
  name?: string;
  dataKey?: string;
  color?: string;
  payload?: Record<string, unknown>;
  fill?: string;
}

/**
 * ChartTooltipContent props
 *
 * Note: Does NOT extend ComponentPropsWithoutRef<'div'> to prevent
 * Recharts internal props (wrapperStyle, chartWidth, etc.) from
 * being spread onto the DOM element and causing React warnings.
 */
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  nameKey?: string;
  labelKey?: string;
  labelClassName?: string;
  labelFormatter?: (value: unknown, payload: TooltipPayloadItem[]) => ReactNode;
  formatter?: (
    value: number | string,
    name: string,
    item: TooltipPayloadItem,
    index: number,
    payload: TooltipPayloadItem[],
  ) => ReactNode;
  color?: string;
  className?: string;
}

/**
 * Resolve indicator color from various sources
 */
function resolveIndicatorColor(
  item: TooltipPayloadItem,
  overrideColor?: string,
): string | undefined {
  if (overrideColor) return overrideColor;

  // Try payload.fill first (common in Recharts)
  if (item.payload && typeof item.payload.fill === 'string') {
    return item.payload.fill;
  }

  // Fall back to item.color
  if (typeof item.color === 'string') return item.color;

  return undefined;
}

/**
 * Chart tooltip content component
 *
 * Renders formatted tooltip with labels and values from chart config.
 * Config keys should match dataKey values for automatic resolution.
 */
const ChartTooltipContent = forwardRef<ElementRef<'div'>, ChartTooltipContentProps>(
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
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const item = payload[0];
      if (!item) return null;

      // Prefer dataKey for stable key lookup
      const key = labelKey || item.dataKey || item.name;
      const itemConfig = getSeriesConfig(config, key);
      const value =
        !labelKey && typeof label === 'string'
          ? (getSeriesConfig(config, label)?.label ?? label)
          : (itemConfig?.label ?? item.name);

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
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 shadow-xl',
          TYPOGRAPHY.TEXT_XS,
          className,
        )}
      >
        {tooltipLabel}
        <div className={cn('grid', SPACING.GAP_1_5)}>
          {payload.map((item, index) => {
            // Prefer dataKey for stable config lookup
            const key = nameKey || item.dataKey || item.name;
            const itemConfig = getSeriesConfig(config, key);
            const indicatorColor = resolveIndicatorColor(item, color);

            return (
              <div
                key={`${item.dataKey ?? item.name ?? index}-${index}`}
                className={cn('flex w-full items-center', SPACING.GAP_2, TYPOGRAPHY.TEXT_XS)}
              >
                {!hideIndicator && indicatorColor && (
                  <div
                    className={cn(
                      'h-2.5 w-2.5 shrink-0 rounded-[2px]',
                      indicator === 'dot' && 'rounded-full',
                      indicator === 'line' && 'w-1',
                    )}
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                <div className={cn('flex flex-1 justify-between leading-none', SPACING.GAP_2)}>
                  <span className='text-muted-foreground'>{itemConfig?.label ?? item.name}</span>
                  <span className='font-medium font-mono text-foreground tabular-nums'>
                    {formatter
                      ? formatter(item.value ?? 0, item.name ?? '', item, index, payload)
                      : item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

// Re-export Recharts Legend
const ChartLegend = RechartsPrimitive.Legend;

/**
 * Legend payload item shape
 * Matches Recharts legend payload structure
 */
interface LegendPayloadItem {
  value: string;
  type?: string;
  color?: string;
  dataKey?: string;
  id?: string;
}

/**
 * ChartLegendContent props
 *
 * Note: Does NOT extend ComponentPropsWithoutRef<'div'> to prevent
 * Recharts internal props (verticalAlign, iconSize, etc.) from
 * being spread onto the DOM element and causing React warnings.
 */
interface ChartLegendContentProps {
  payload?: LegendPayloadItem[];
  nameKey?: string;
  hideIcon?: boolean;
  className?: string;
}

/**
 * Chart legend content component
 *
 * Renders formatted legend with labels from chart config.
 * Config keys should match dataKey values for automatic resolution.
 */
const ChartLegendContent = forwardRef<ElementRef<'div'>, ChartLegendContentProps>(
  ({ className, hideIcon = false, payload, nameKey }, ref) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          SPACING.GAP_4,
          TYPOGRAPHY.TEXT_XS,
          className,
        )}
      >
        {payload.map((item) => {
          // Prefer dataKey for stable config lookup
          const key = nameKey || item.dataKey || item.value;
          const itemConfig = getSeriesConfig(config, key);
          const IconComponent = itemConfig?.icon;

          return (
            <div
              key={item.value}
              className={cn(
                'flex items-center [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
                SPACING.GAP_1_5,
              )}
            >
              {!hideIcon && item.color && (
                <div
                  className='h-2 w-2 shrink-0 rounded-[2px]'
                  style={{ backgroundColor: item.color }}
                />
              )}
              {IconComponent && <IconComponent className='h-3 w-3' />}
              <span className='text-muted-foreground'>{itemConfig?.label ?? item.value}</span>
            </div>
          );
        })}
      </div>
    );
  },
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
};
