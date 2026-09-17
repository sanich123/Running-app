export interface CurrentWeekStatisticsRequest {
  userId: string;
  firstDay: string;
  lastDay: string;
  timeZone?: string;
}

export interface MonthStatisticsRequest {
  userId: string;
  year: string;
  month: string;
  timeZone?: string;
}
