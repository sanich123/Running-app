import { LANGUAGES } from '@const/enums';
import type {
  DashboardDailyActivities,
  DashboardLabels,
  DashboardMetric,
  DashboardSport,
  DashboardThemeColors,
} from './types';

export function formatMetricValue(
  value: number,
  metric: DashboardMetric,
  labels: Pick<DashboardLabels, 'kilometres' | 'hours'>,
) {
  const formattedValue = formatMetricNumber(value, metric);
  return metric === 'distance'
    ? `${formattedValue} ${labels.kilometres}`
    : metric === 'duration'
      ? `${formattedValue} ${labels.hours}`
      : `${formattedValue}`;
}

export function formatMetricNumber(value: number, metric: DashboardMetric) {
  return metric === 'activities' ? Math.round(value) : Number(value.toFixed(1));
}

export function getSportLabel(sport: string, labels: DashboardLabels, language: LANGUAGES) {
  const normalizedSport = sport.toLowerCase().replace(/[_-]/g, '');
  const knownLabels: Record<string, string> = {
    run: labels.run,
    running: labels.run,
    trailrun: labels.run,
    bike: labels.bike,
    ride: labels.bike,
    cycling: labels.bike,
    virtualride: labels.bike,
    walk: labels.walk,
    walking: labels.walk,
    hike: language === LANGUAGES.russian ? 'Хайкинг' : 'Hiking',
    hiking: language === LANGUAGES.russian ? 'Хайкинг' : 'Hiking',
    workout: labels.workout,
    weighttraining: labels.workout,
    gym: labels.workout,
  };
  return knownLabels[normalizedSport] ?? sport.replace(/[_-]/g, ' ');
}

export function getDayIntensity(
  date: Date,
  sport: DashboardSport,
  metric: DashboardMetric,
  dailyActivities: DashboardDailyActivities,
) {
  const activities = (dailyActivities[getDateKey(date)] ?? []).filter(
    ({ sport: activitySport }) => sport === 'all' || activitySport === sport,
  );
  const total = activities.reduce((sum, activity) => {
    if (metric === 'activities') return sum + 1;
    if (metric === 'distance') return sum + activity.distance / 1000;
    return sum + activity.duration / 3_600_000;
  }, 0);
  if (total <= 0) return 0;
  if (metric === 'activities') return Math.min(4, Math.max(1, Math.ceil(total)));
  const thresholds = metric === 'distance' ? [3, 8, 15] : [0.5, 1, 2];
  return total < thresholds[0] ? 1 : total < thresholds[1] ? 2 : total < thresholds[2] ? 3 : 4;
}

export function getHeatmapColor(level: number, colors: DashboardThemeColors) {
  if (level === 0) return colors.surfaceVariant;
  return withAlpha(colors.primary, [0, 0.32, 0.52, 0.74, 1][level]);
}

export function formatLongDate(date: Date, language: LANGUAGES) {
  return date.toLocaleDateString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });
}

export function groupActivitiesBySport(activities: DashboardDailyActivities[string]) {
  return Object.values(
    activities.reduce<Record<string, { sport: string; distance: number; duration: number; activities: number }>>(
      (result, activity) => {
        const group = result[activity.sport] ?? { sport: activity.sport, distance: 0, duration: 0, activities: 0 };
        group.distance += activity.distance;
        group.duration += activity.duration;
        group.activities += 1;
        result[activity.sport] = group;
        return result;
      },
      {},
    ),
  );
}

export function formatDayActivityValue(
  group: { distance: number; duration: number; activities: number },
  metric: DashboardMetric,
  labels: Pick<DashboardLabels, 'kilometres' | 'minutes' | 'activities'>,
) {
  const distance = `${Number((group.distance / 1000).toFixed(1))} ${labels.kilometres}`;
  const duration = `${Math.round(group.duration / 60_000)} ${labels.minutes}`;
  return metric === 'distance'
    ? `${distance} · ${duration}`
    : metric === 'duration'
      ? `${duration} · ${distance}`
      : `${group.activities} ${labels.activities.toLowerCase()}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const normalizedHex =
      hex.length === 3
        ? hex
            .split('')
            .map((part) => `${part}${part}`)
            .join('')
        : hex;
    if (normalizedHex.length === 6) {
      const channels = [0, 2, 4].map((index) => Number.parseInt(normalizedHex.slice(index, index + 2), 16));
      return `rgba(${channels.join(',')}, ${alpha})`;
    }
  }
  const channels = color.match(/\d+/g);
  return channels && channels.length >= 3 ? `rgba(${channels.slice(0, 3).join(',')}, ${alpha})` : color;
}

export function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
