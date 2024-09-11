export type CalendarStatisticsProps = {
  year: string;
  month: string;
  activities: StatisticActivities;
};

export type StatisticActivities = { duration: number; distance: number; id: string; sport: string; date: string }[];
