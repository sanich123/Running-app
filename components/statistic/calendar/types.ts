export type CalendarStatisticsProps = {
  year: string;
  month: string;
  userId: string;
};

export type StatisticActivities = { duration: number; distance: number; id: string; sport: string; date: string }[];

export type CalendarDate = { dateValue: string; activities: StatisticActivities };

export type ReducedDatesByDayOfTheWeek = {
  sundays: CalendarDate[];
  mondays: CalendarDate[];
  tuesdays: CalendarDate[];
  wednesdays: CalendarDate[];
  thursdays: CalendarDate[];
  fridays: CalendarDate[];
  saturdays: CalendarDate[];
};

export let REDUCED_DATES_INITIAL_STATE = {
  mondays: [{ dateValue: 'ПН', activities: [] }],
  tuesdays: [{ dateValue: 'ВТ', activities: [] }],
  wednesdays: [{ dateValue: 'СР', activities: [] }],
  thursdays: [{ dateValue: 'ЧТ', activities: [] }],
  fridays: [{ dateValue: 'ПТ', activities: [] }],
  saturdays: [{ dateValue: 'СБ', activities: [] }],
  sundays: [{ dateValue: 'ВС', activities: [] }],
};

export const mapIndexToDayOfWeek = {
  0: 'sundays',
  1: 'mondays',
  2: 'tuesdays',
  3: 'wednesdays',
  4: 'thursdays',
  5: 'fridays',
  6: 'saturdays',
};
export type CalendarDateProps = {
  isTitle: boolean;
  isEmptyCell: boolean;
  dateValue: string;
  day: string;
  i: number;
};
export type CalendarDateWithActivityProps = {
  isWeekend: boolean;
  activities: { sport: string; id: string }[];
};

export type CalendarDateEmptyProps = {
  isTitle: boolean;
  isEmptyCell: boolean;
  dateValue: string;
  day: string;
  i: number;
};
