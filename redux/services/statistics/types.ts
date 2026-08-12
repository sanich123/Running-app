export type {
  MonthActivityResponse,
  MonthStatisticsResponse,
  StatisticMetricResponse,
  YearStatisticsResponse,
} from '@R/runich-api/types';

export interface CurrentWeekStatisticsRequest {
  userId: string;
  firstDay: string;
  lastDay: string;
}

export interface MonthStatisticsRequest {
  userId: string;
  year: string;
  month: string;
}
