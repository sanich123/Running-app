export type CurrentWeekStatisticsRequest = {
  userId: string;
  firstDay: string;
  lastDay: string;
};

export type MonthStatisticsRequest = {
  userId: string;
  year: string;
  month: string;
};
