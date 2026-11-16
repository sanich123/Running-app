export interface StatisticMetricResponse {
  totalDuration: number;
  totalDistance: number;
  totalItems: number;
}

interface YearCategoryMetricResponse extends StatisticMetricResponse {
  totalSteps: number;
  totalCaloriesActive: number;
}

export interface DailyActivityStatisticsResponse {
  duration: number;
  distance: number;
  steps?: number | null;
  caloriesActive?: number | null;
  date: string;
  sport: string;
}

type DailyActivitiesStatisticsResponse = Record<string, DailyActivityStatisticsResponse[]>;

interface MonthActivityResponse {
  duration: number;
  distance: number;
  speed: number;
  date: string;
  id: string;
  sport: string;
}

export interface MonthStatisticsResponse {
  activities: MonthActivityResponse[];
  activitiesReducedBySport: Record<string, StatisticMetricResponse>;
}

export type YearStatisticsResponse = {
  isUserHasActivities: boolean;
} & Record<
  string,
  | boolean
  | (Record<string, YearCategoryStatistics | DailyActivitiesStatisticsResponse> & {
      dailyActivities?: DailyActivitiesStatisticsResponse;
    })
>;

type YearCategoryStatistics = YearCategoryMetricResponse & Record<string, number | YearCategoryMetricResponse>;
