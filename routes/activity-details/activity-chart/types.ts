import type { LANGUAGES } from '@const/enums';

export interface ActivityChartProps {
  activityId: string;
  activityDistance: number;
  sport: string;
  maxHeartRate?: number | null;
  profileRestingHeartRate?: string | null;
  profileMaximumHeartRate?: string | null;
  profileAge?: string | null;
  canViewHeartRate?: boolean;
  canViewElevation?: boolean;
  canViewPace?: boolean;
}

export type ActivityChartMetric = 'heartRate' | 'pace' | 'speed' | 'elevation';
export type HeartRateZone = 1 | 2 | 3 | 4 | 5;
export type HeartRateZoneBasis = 'heartRateReserve' | 'age' | 'activityMaximum';

export type HeartRateZoneSettings =
  | { basis: 'heartRateReserve'; maximumHeartRate: number; restingHeartRate: number }
  | { basis: 'age' | 'activityMaximum'; maximumHeartRate: number };

export interface ActivityChartPoint {
  originalValue: number;
  elapsedMilliseconds: number;
  label?: string;
}

export interface ActivityChartSeries {
  metric: ActivityChartMetric;
  data: ActivityChartPoint[];
  minValue: number;
  maxValue: number;
}

export interface ActivityTimeChartProps {
  chartSeries: ActivityChartSeries[];
  zoneSettings: HeartRateZoneSettings;
  language: LANGUAGES;
}
