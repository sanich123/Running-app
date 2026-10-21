export interface ActivityStatisticMetric {
  label: string;
  value: string;
}

export interface ActivityStatisticSection {
  title: string;
  metrics: ActivityStatisticMetric[];
}
