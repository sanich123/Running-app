import { LANGUAGES } from '@const/enums';
import type { DashboardSport, DashboardYearData } from './types';

export const DASHBOARD_MONTHS = {
  [LANGUAGES.russian]: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  [LANGUAGES.english]: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
} as const;

export const DASHBOARD_LABELS = {
  [LANGUAGES.russian]: {
    yearActivity: 'Годовая активность',
    byMonths: 'по месяцам',
    chartHint: 'Нажмите на точку месяца, чтобы увидеть информацию',
    byWorkouts: 'по тренировкам',
    distance: 'Дистанция',
    duration: 'Время',
    activities: 'Тренировки',
    activeDays: 'Активных дней',
    peakMonth: 'Пик месяца',
    sportDistribution: 'По видам спорта',
    allSports: 'Все',
    heatmapHint: 'Нажмите на день, чтобы увидеть детали',
    selectedDay: 'Выбранный день',
    openMonth: 'Открыть месяц',
    selectedMonth: 'Выбранный месяц',
    noActivity: 'В этот день тренировок нет',
    run: 'Бег',
    bike: 'Велосипед',
    walk: 'Ходьба',
    workout: 'Силовые',
    hours: 'ч',
    minutes: 'мин',
    kilometres: 'км',
  },
  [LANGUAGES.english]: {
    yearActivity: 'Year activity',
    byMonths: 'by month',
    chartHint: 'Tap a month point to see its details',
    byWorkouts: 'by workouts',
    distance: 'Distance',
    duration: 'Time',
    activities: 'Workouts',
    activeDays: 'Active days',
    peakMonth: 'Peak month',
    sportDistribution: 'By sport',
    allSports: 'All',
    heatmapHint: 'Tap a day to see details',
    selectedDay: 'Selected day',
    openMonth: 'Open month',
    selectedMonth: 'Selected month',
    noActivity: 'No workouts on this day',
    run: 'Running',
    bike: 'Cycling',
    walk: 'Walking',
    workout: 'Strength',
    hours: 'h',
    minutes: 'min',
    kilometres: 'km',
  },
} as const;

export const DASHBOARD_HEATMAP = {
  rows: 7,
  cellSize: 12,
  gap: 3,
} as const;

export const EMPTY_DASHBOARD_YEAR_DATA: DashboardYearData = {
  totals: { distance: 0, duration: 0, activities: 0 },
  monthly: { distance: Array(12).fill(0), duration: Array(12).fill(0), activities: Array(12).fill(0) },
  sports: {},
  dailyActivities: {},
  activeDays: 0,
  bestMonth: 0,
};

export const DASHBOARD_SPORTS: { key: DashboardSport; icon: string }[] = [{ key: 'all', icon: 'chart-donut' }];
