// src/components/molecules/TaxBreakdownCharts.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

interface TaxBreakdownChartsProps {
  results: TaxCalculationResults;
  className?: string;
}

// Define data structure for pie chart entries
interface PieDataEntry {
  name: string;
  value: number;
  color: string;
  id: string;
  percentage?: number; // Added for direct rendering
}

const TaxBreakdownCharts = ({ results, className = '' }: TaxBreakdownChartsProps) => {
  const [mountedClient, setMountedClient] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Animation state for charts
  const [animate, setAnimate] = useState(false);
  // Screen size state to adjust chart rendering
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle client-side rendering for theme detection
  useEffect(() => {
    setMountedClient(true);
    // Start animation after a short delay
    const timer = setTimeout(() => setAnimate(true), 300);

    // Check screen size for responsive adjustments
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Initialize and add listener
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Early return if no valid results
  if (!results || results.grossSalary.annually <= 0) {
    return null;
  }

  // Define enhanced color schemes with more variety including reds and oranges
  const colorSchemes = {
    light: {
      takehome: 'hsla(221, 83%, 53%, 0.9)', // blue-500 with alpha
      incomeTax: 'hsla(0, 83%, 53%, 0.8)', // Red for income tax
      ni: 'hsla(250, 92%, 86%, 0.9)', // Purple for NI
      pension: 'hsla(160, 92%, 56%, 0.9)', // Green for pension
      studentLoan: 'hsla(30, 95%, 65%, 0.95)', // Stronger orange for student loan
    },
    dark: {
      takehome: 'hsla(221, 83%, 53%, 0.9)', // Keep blue for take-home
      incomeTax: 'hsla(0, 83%, 53%, 0.8)', // Red for income tax
      ni: 'hsla(250, 72%, 75%, 0.9)', // Purple for NI
      pension: 'hsla(160, 72%, 45%, 0.9)', // Green for pension
      studentLoan: 'hsla(30, 95%, 55%, 0.95)', // Stronger orange for student loan
    },
  };

  const colors = isDarkMode ? colorSchemes.dark : colorSchemes.light;

  // Calculate deductions data for the income breakdown pie chart
  // Only include items that have values > 0
  const pieData: PieDataEntry[] = useMemo(() => {
    const data: PieDataEntry[] = [];
    const totalGross = results.grossSalary.annually;

    // Always include net pay
    data.push({
      id: 'take-home',
      name: 'Take-Home Pay',
      value: results.netPay.annually,
      color: colors.takehome,
      percentage: (results.netPay.annually / totalGross) * 100,
    });

    // Add income tax if applicable
    if (results.incomeTax.annually > 0) {
      data.push({
        id: 'income-tax',
        name: 'Income Tax',
        value: results.incomeTax.annually,
        color: colors.incomeTax,
        percentage: (results.incomeTax.annually / totalGross) * 100,
      });
    }

    // Add National Insurance if applicable
    if (results.nationalInsurance.annually > 0) {
      data.push({
        id: 'national-insurance',
        name: 'National Insurance',
        value: results.nationalInsurance.annually,
        color: colors.ni,
        percentage: (results.nationalInsurance.annually / totalGross) * 100,
      });
    }

    // Add Pension Contribution if applicable
    if (results.pensionContribution.annually > 0) {
      data.push({
        id: 'pension',
        name: 'Pension',
        value: results.pensionContribution.annually,
        color: colors.pension,
        percentage: (results.pensionContribution.annually / totalGross) * 100,
      });
    }

    // Add Student Loan if applicable
    if (results.studentLoan.annually > 0) {
      data.push({
        id: 'student-loan',
        name: 'Student Loan',
        value: results.studentLoan.annually,
        color: colors.studentLoan,
        percentage: (results.studentLoan.annually / totalGross) * 100,
      });
    }

    return data;
  }, [results, colors]);

  // Calculate tax breakdown data for the second pie chart
  const taxBreakdownData = useMemo(() => {
    const data: PieDataEntry[] = [];
    const totalTaxBurden =
      results.incomeTax.annually +
      results.nationalInsurance.annually +
      results.studentLoan.annually;

    // Only show this chart if there are taxes to pay
    if (totalTaxBurden <= 0) return [];

    // Add income tax
    if (results.incomeTax.annually > 0) {
      data.push({
        id: 'income-tax',
        name: 'Income Tax',
        value: results.incomeTax.annually,
        color: isDarkMode ? 'hsla(0, 80%, 60%, 0.95)' : 'hsla(0, 90%, 65%, 0.95)', // Red for tax
        percentage: (results.incomeTax.annually / totalTaxBurden) * 100,
      });
    }

    // Add National Insurance
    if (results.nationalInsurance.annually > 0) {
      data.push({
        id: 'national-insurance',
        name: 'National Insurance',
        value: results.nationalInsurance.annually,
        color: isDarkMode ? 'hsla(270, 70%, 60%, 0.9)' : 'hsla(270, 90%, 70%, 0.9)', // Purple for NI
        percentage: (results.nationalInsurance.annually / totalTaxBurden) * 100,
      });
    }

    // Add Student Loan
    if (results.studentLoan.annually > 0) {
      data.push({
        id: 'student-loan',
        name: 'Student Loan',
        value: results.studentLoan.annually,
        color: isDarkMode ? 'hsla(30, 85%, 50%, 0.95)' : 'hsla(30, 95%, 60%, 0.95)', // Orange for student loan
        percentage: (results.studentLoan.annually / totalTaxBurden) * 100,
      });
    }

    return data;
  }, [results, isDarkMode]);

  // Enhanced active shape for pie charts - using more specific type
  // biome-ignore lint/suspicious/noExplicitAny: Recharts expects this specific type
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy - 20}
          dy={8}
          textAnchor="middle"
          fill="currentColor"
          fontSize={14}
          fontWeight="bold"
        >
          {payload.name}
        </text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill="currentColor" fontSize={12}>
          {formatCurrency(value, 0)}
        </text>
        <text
          x={cx}
          y={cy + 25}
          textAnchor="middle"
          fill="currentColor"
          fontSize={12}
          fontWeight="bold"
        >
          {(percent * 100).toFixed(1)}%
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          fillOpacity={0.8}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 5}
          outerRadius={innerRadius - 1}
          fill={fill}
        />
      </g>
    );
  };

  // Custom label renderer for direct values on pie segments
  // biome-ignore lint/suspicious/noExplicitAny: Recharts expects this specific type
  const renderCustomLabel = (props: any) => {
    const RADIAN = Math.PI / 180;

    // Safe access to properties with number type assertion and default values
    const cx = props.cx ? Number(props.cx) : 0;
    const cy = props.cy ? Number(props.cy) : 0;
    const midAngle = props.midAngle || 0;
    const innerRadius = props.innerRadius ? Number(props.innerRadius) : 0;
    const outerRadius = props.outerRadius ? Number(props.outerRadius) : 0;
    const percent = props.percent || 0;
    const index = props.index;

    // Skip label if segment is too small or on small screens
    if (!props.payload || percent < 0.05 || isSmallScreen) return null;

    // Calculate positioning for the label
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Get data from our enhanced dataset
    const data = index !== undefined && pieData[index] ? pieData[index] : null;

    // Determine text content - keep minimal for space constraints
    const percentText = data?.percentage ? `${data.percentage.toFixed(0)}%` : '';

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
      >
        {percentText}
      </text>
    );
  };

  // Calculate total deductions for summary
  const totalDeductions =
    results.incomeTax.annually +
    results.nationalInsurance.annually +
    results.pensionContribution.annually +
    results.studentLoan.annually;

  // Don't render until after client-side mount (for theme detection)
  if (!mountedClient) {
    return (
      <div className="h-72 md:h-80 flex items-center justify-center">
        <div className="glass-card-l2 w-full max-w-md h-60 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Only show tax breakdown if there are taxes
  const showTaxBreakdown = taxBreakdownData.length > 0;

  return (
    <div
      className={cn(
        `grid grid-cols-1 ${showTaxBreakdown ? 'md:grid-cols-2' : ''} gap-6 ${className} ${animate ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`
      )}
    >
      {/* Income Breakdown Pie Chart with enhanced glassmorphic styling */}
      <div className="glass-card-l2 backdrop-blur-glass relative overflow-hidden border border-glass">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 -z-10" />

        <div className="p-4 md:p-6">
          <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <div className="h-3 w-3 rounded-full bg-gradient-primary opacity-50 mr-2" />
            Income Breakdown
          </h3>

          {/* Chart Summary - Mobile friendly cards with glassmorphic styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
            <div className="glass-card-l3 backdrop-blur-glass-sm p-3 rounded-lg border border-glass shadow-glass-sm">
              <div className="text-foreground/70">Gross Salary</div>
              <div className="text-lg font-semibold mt-1 text-foreground">
                {formatCurrency(results.grossSalary.annually, 0)}
              </div>
            </div>
            <div className="glass-card-l3 backdrop-blur-glass-sm p-3 rounded-lg border border-glass shadow-glass-sm">
              <div className="text-foreground/70">Total Deductions</div>
              <div className="text-lg font-semibold mt-1 text-foreground">
                {formatCurrency(totalDeductions, 0)}
              </div>
            </div>
          </div>

          {/* Responsive chart container - adapts to screen size */}
          <div className="h-64 sm:h-72 md:h-80 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isSmallScreen ? 50 : 60}
                  outerRadius={isSmallScreen ? 80 : 90}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  stroke="rgba(var(--background), 0.1)"
                  strokeWidth={2}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`income-${entry.id}`}
                      fill={entry.color}
                      opacity={animate ? 1 : 0}
                      style={{
                        transition: `opacity 500ms ease-in ${index * 100}ms, 
                                   transform 500ms ease-in ${index * 100}ms`,
                        transformOrigin: 'center',
                        transform: animate ? 'scale(1)' : 'scale(0.8)',
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                      }}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span className="text-foreground/90">{value}</span>}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tax Breakdown Chart - Only show if there are taxes to display */}
      {showTaxBreakdown && (
        <div className="glass-card-l2 backdrop-blur-glass relative overflow-hidden border border-glass">
          {/* Enhanced gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 -z-10" />

          <div className="p-4 md:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <div className="h-3 w-3 rounded-full bg-gradient-secondary opacity-50 mr-2" />
              Tax Breakdown
            </h3>

            {/* Chart Summary - Mobile friendly cards with glassmorphic styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
              <div className="glass-card-l3 backdrop-blur-glass-sm p-3 rounded-lg border border-glass shadow-glass-sm">
                <div className="text-foreground/70">Total Tax Burden</div>
                <div className="text-lg font-semibold mt-1 text-foreground">
                  {formatCurrency(
                    results.incomeTax.annually +
                      results.nationalInsurance.annually +
                      results.studentLoan.annually,
                    0
                  )}
                </div>
              </div>
              <div className="glass-card-l3 backdrop-blur-glass-sm p-3 rounded-lg border border-glass shadow-glass-sm">
                <div className="text-foreground/70">Effective Tax Rate</div>
                <div className="text-lg font-semibold mt-1 text-foreground">
                  {(
                    ((results.incomeTax.annually +
                      results.nationalInsurance.annually +
                      results.studentLoan.annually) /
                      results.grossSalary.annually) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>

            {/* Responsive chart container - adapts to screen size */}
            <div className="h-64 sm:h-72 md:h-80 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    activeShape={renderActiveShape}
                    data={taxBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isSmallScreen ? 50 : 60}
                    outerRadius={isSmallScreen ? 80 : 90}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={800}
                    stroke="rgba(var(--background), 0.1)"
                    strokeWidth={2}
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {taxBreakdownData.map((entry, index) => (
                      <Cell
                        key={`tax-${entry.id}`}
                        fill={entry.color}
                        opacity={animate ? 1 : 0}
                        style={{
                          transition: `opacity 500ms ease-in ${500 + index * 100}ms, 
                                     transform 500ms ease-in ${500 + index * 100}ms`,
                          transformOrigin: 'center',
                          transform: animate ? 'scale(1)' : 'scale(0.8)',
                          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                        }}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span className="text-foreground/90">{value}</span>}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxBreakdownCharts;
