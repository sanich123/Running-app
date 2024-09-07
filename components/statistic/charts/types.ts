export type MonthMetrics = {
  [key: string]: { totalDistance: number; totalDuration: number; medianSpeed: number; items: number };
};

export type ChartBarComponent = {
  value: number;
  label: string;
  topLabelComponent: () => void;
};

export type AccumulatorValues = {
  totalDurationArr: ChartBarComponent[];
  totalDistanceArr: ChartBarComponent[];
  totalMedianSpeedArr: ChartBarComponent[];
  totalActivitiesArr: ChartBarComponent[];
};
