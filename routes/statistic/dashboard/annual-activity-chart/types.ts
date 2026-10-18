import type { DashboardLabels, DashboardMetric } from '../types';
export interface DashboardChartPoint {
  value: number;
  label: string;
  dataPointRadius?: number;
  dataPointColor?: string;
  onPress?: () => void;
}

export interface AnnualActivityChartProps {
  data: DashboardChartPoint[];
  width: number;
  months: readonly string[];
  selectedMonth: number;
  metric: DashboardMetric;
  selectedValue: number;
  averageValue: number;
  maxValue: number;
  noOfSections: number;
  stepValue: number;
  workoutCount: number;
  labels: DashboardLabels;
  onOpenMonth: (index: number) => void;
}
