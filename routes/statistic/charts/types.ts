export type MonthMetrics = Record<string, { totalDistance: number; totalDuration: number; totalItems: number }>;

interface ChartBarComponent {
  value: number;
  label: string;
  topLabelComponent: () => void;
}

export interface AccumulatorValues {
  totalDuration: ChartBarComponent[];
  totalDistance: ChartBarComponent[];
  totalActivities: ChartBarComponent[];
}

export enum ChooseMetricsBtnsValues {
  duration = 'duration',
  amount = 'amount',
  distance = 'distance',
}

export interface BarChartWrapperProps {
  metricsArr?: { value: number; label: string }[];
  year: number;
  title: string;
}
