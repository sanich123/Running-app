import type { ActivityListItemResponse } from '@R/runich-api/types';

export interface ActivityDateFilters {
  month: number | null;
  day: number | null;
  year: number | null;
}

export function filterActivitiesByDate(activities: ActivityListItemResponse[], filters: ActivityDateFilters) {
  return activities.filter(({ date }) => {
    const activityDate = new Date(date);
    return (
      (filters.month === null || activityDate.getMonth() === filters.month) &&
      (filters.day === null || activityDate.getDate() === filters.day) &&
      (filters.year === null || activityDate.getFullYear() === filters.year)
    );
  });
}

export function getActivityYears(activities: ActivityListItemResponse[]) {
  return [...new Set(activities.map(({ date }) => new Date(date).getFullYear()))].sort(
    (first, second) => second - first,
  );
}
