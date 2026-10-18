export interface HeartRateChartProps {
  activityId: string;
  activityDistance: number;
  sport: string;
}

export type HeartRateChartMetric = 'heartRate' | 'pace' | 'speed' | 'elevation';

export interface HeartRateChartPoint {
  value: number;
  originalValue: number;
  label?: string;
}

export interface HeartRateChartSeries {
  metric: HeartRateChartMetric;
  data: HeartRateChartPoint[];
  minValue: number;
  maxValue: number;
}
