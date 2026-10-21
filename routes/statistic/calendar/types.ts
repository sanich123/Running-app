import type { MonthStatisticsResponse } from '@R/runich-api/types';

export interface CalendarStatisticsProps {
  year: string;
  month: string;
  selectedType: string;
  monthStatistics: MonthStatisticsResponse;
}

export type StatisticActivities = { duration: number; distance: number; id: string; sport: string; date: string }[];

interface CalendarDate {
  dateValue: string;
  activities: StatisticActivities;
}

export interface ReducedDatesByDayOfTheWeek {
  sundays: CalendarDate[];
  mondays: CalendarDate[];
  tuesdays: CalendarDate[];
  wednesdays: CalendarDate[];
  thursdays: CalendarDate[];
  fridays: CalendarDate[];
  saturdays: CalendarDate[];
}

export const mapIndexToDayOfWeek = {
  0: 'sundays',
  1: 'mondays',
  2: 'tuesdays',
  3: 'wednesdays',
  4: 'thursdays',
  5: 'fridays',
  6: 'saturdays',
};
export interface CalendarDateProps {
  isTitle: boolean;
  isEmptyCell: boolean;
  dateValue: string;
}

export interface CalendarDateWithActivityProps {
  isWeekend: boolean;
  activities: { sport: string; id: string }[];
}

export interface CalendarGridDay {
  dateValue: string;
  activities: StatisticActivities;
  isEmptyCell: boolean;
  isWeekend: boolean;
}
