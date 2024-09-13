export type CalendarStatisticsProps = {
  year: string;
  month: string;
  userId: string;
};

export type StatisticActivities = { duration: number; distance: number; id: string; sport: string; date: string }[];
