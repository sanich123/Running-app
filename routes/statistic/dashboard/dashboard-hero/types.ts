import type { DashboardLabels, DashboardMetric, DashboardMetricTotals } from '../types';
export interface DashboardHeroProps {
  metric: DashboardMetric;
  metricTotals: DashboardMetricTotals;
  hasSteps: boolean;
  hasCalories: boolean;
  activeDays: number;
  peakMonth: string;
  labels: DashboardLabels;
  onMetricChange: (metric: DashboardMetric) => void;
  isRefreshing?: boolean;
}
