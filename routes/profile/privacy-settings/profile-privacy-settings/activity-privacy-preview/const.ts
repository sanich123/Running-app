import { ACTIVITY_CHART_METRIC_COLORS } from '../../../../activity-details/activity-chart/utils';

export const ACTIVITY_PREVIEW_METRIC_COLORS = {
  heartRate: ACTIVITY_CHART_METRIC_COLORS.heartRate,
  elevation: ACTIVITY_CHART_METRIC_COLORS.elevation,
  pace: ACTIVITY_CHART_METRIC_COLORS.pace,
} as const;

export const ACTIVITY_PREVIEW_HEART_RATE_ZONES = [
  { zone: 5, percentage: '0 %', duration: '00:00', color: '#EB5757' },
  { zone: 4, percentage: '1 %', duration: '00:31', color: '#F2994A' },
  { zone: 3, percentage: '26 %', duration: '13:59', color: '#F2C94C' },
  { zone: 2, percentage: '46 %', duration: '24:54', color: '#42C477' },
  { zone: 1, percentage: '27 %', duration: '14:16', color: '#58BCEB' },
] as const;
