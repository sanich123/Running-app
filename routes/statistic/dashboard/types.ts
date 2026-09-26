import type { MD3Theme } from 'react-native-paper';

export type DashboardMetric = 'distance' | 'duration' | 'activities';
export type DashboardSport = string;
export type DashboardThemeColors = MD3Theme['colors'];

export interface DashboardMetricTotals {
  distance: number;
  duration: number;
  activities: number;
}

export interface DashboardDailyActivity {
  duration: number;
  distance: number;
  date: string;
  sport: string;
}

export type DashboardDailyActivities = Record<string, DashboardDailyActivity[]>;

export interface DashboardYearData {
  totals: DashboardMetricTotals;
  monthly: Record<DashboardMetric, number[]>;
  sports: Record<Exclude<DashboardSport, 'all'>, DashboardMetricTotals>;
  dailyActivities: DashboardDailyActivities;
  activeDays: number;
  bestMonth: number;
}

export interface DashboardLabels {
  yearActivity: string;
  byMonths: string;
  chartHint: string;
  byWorkouts: string;
  distance: string;
  duration: string;
  activities: string;
  activeDays: string;
  peakMonth: string;
  sportDistribution: string;
  allSports: string;
  heatmapHint: string;
  selectedDay: string;
  openMonth: string;
  selectedMonth: string;
  noActivity: string;
  run: string;
  bike: string;
  walk: string;
  workout: string;
  hours: string;
  minutes: string;
  kilometres: string;
}

export interface DashboardSportOption {
  key: DashboardSport;
  icon: string;
}

export interface DashboardHeatmapCell {
  date: Date;
  intensity: number;
  isOutsideYear: boolean;
}

export interface DashboardHeatmapMonth {
  label: string;
  columnSpan: number;
}

export interface DashboardActivityGroup {
  sport: string;
  distance: number;
  duration: number;
  activities: number;
}
