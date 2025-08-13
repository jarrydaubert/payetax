// src/types/chartTypes.ts
/**
 * Type definitions for chart components used in the application
 */

// Common chart props for rendering points
export interface ChartPoint {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  midAngle?: number;
  fill?: string;
  stroke?: string;
  dataKey?: string;
  value?: number;
  percent?: number;
  index?: number;
  name?: string;
  payload?: ChartPayload;
}

// Chart data payload
export interface ChartPayload {
  name: string;
  value: number;
  color?: string;
  fill?: string;
  [key: string]: unknown;
}

// PieChart active shape props
export interface PieChartActiveShapeProps extends ChartPoint {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: ChartPayload;
  percent: number;
  value: number;
}

// Pie chart custom label props
export interface PieChartLabelProps extends ChartPoint {
  viewBox?: {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
  };
  index?: number;
  payload?: ChartPayload;
}
