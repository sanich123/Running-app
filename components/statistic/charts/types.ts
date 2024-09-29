export type MonthMetrics = {
  [key: string]: { totalDistance: number; totalDuration: number; totalItems: number };
};

export type ChartBarComponent = {
  value: number;
  label: string;
  topLabelComponent: () => void;
};

export type AccumulatorValues = {
  totalDuration: ChartBarComponent[];
  totalDistance: ChartBarComponent[];
  totalActivities: ChartBarComponent[];
};

export enum ChooseMetricsBtnsValues {
  duration = 'duration',
  amount = 'amount',
  distance = 'distance',
}

export type BarChartWrapperProps = {
  metricsArr?: { value: number; label: string }[];
  year: number;
  title: string;
};
