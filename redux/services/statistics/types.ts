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
