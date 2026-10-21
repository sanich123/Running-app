import { LANGUAGES, type LANGUAGES as Language } from '@const/enums';
import { getAverageCadence, getSpeedInKmPerHour, isRunningActivity } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { ACTIVITY_STATISTICS_PAGE_COPY } from './const';
import type { ActivityStatisticMetric, ActivityStatisticSection } from './types';
import type { ActivityResponse } from '@R/runich-api/types';

interface ActivityStatisticVisibility {
  heartRate: boolean;
  elevation: boolean;
  pace: boolean;
}

function formatPace(distance: number, duration: number) {
  const secondsPerKilometre = distance > 0 ? duration / distance : 0;
  const totalSeconds = Math.round(secondsPerKilometre);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function createSection(title: string, metrics: ActivityStatisticMetric[]): ActivityStatisticSection | null {
  return metrics.length ? { title, metrics } : null;
}

export function buildActivityStatisticSections(
  activity: ActivityResponse,
  language: Language,
  visibility: ActivityStatisticVisibility = { heartRate: true, elevation: true, pace: true },
) {
  const copy = ACTIVITY_STATISTICS_PAGE_COPY[language];
  const numberLocale = language === LANGUAGES.russian ? 'ru-RU' : 'en-US';
  const heartRateMetrics: ActivityStatisticMetric[] = [];
  if (
    visibility.heartRate &&
    typeof activity.averageHeartRate === 'number' &&
    Number.isFinite(activity.averageHeartRate)
  ) {
    heartRateMetrics.push({
      label: copy.average,
      value: `${Math.round(activity.averageHeartRate)} ${copy.heartRateUnit}`,
    });
  }
  if (visibility.heartRate && typeof activity.minHeartRate === 'number' && Number.isFinite(activity.minHeartRate)) {
    heartRateMetrics.push({
      label: copy.minimum,
      value: `${Math.round(activity.minHeartRate)} ${copy.heartRateUnit}`,
    });
  }
  if (visibility.heartRate && typeof activity.maxHeartRate === 'number' && Number.isFinite(activity.maxHeartRate)) {
    heartRateMetrics.push({
      label: copy.maximum,
      value: `${Math.round(activity.maxHeartRate)} ${copy.heartRateUnit}`,
    });
  }

  const techniqueMetrics: ActivityStatisticMetric[] = [];
  if (typeof activity.steps === 'number' && activity.steps > 1) {
    techniqueMetrics.push({ label: copy.steps, value: new Intl.NumberFormat(numberLocale).format(activity.steps) });
    if (isRunningActivity(activity.sport)) {
      const averageCadence = getAverageCadence(activity.steps, activity.duration);
      if (averageCadence > 0) {
        techniqueMetrics.push({ label: copy.cadence, value: `${averageCadence} ${copy.cadenceUnit}` });
      }
    }
  }

  const conditionMetrics: ActivityStatisticMetric[] = [];
  if (typeof activity.weatherTemperature === 'number' && Number.isFinite(activity.weatherTemperature)) {
    conditionMetrics.push({ label: copy.temperature, value: `${Math.round(activity.weatherTemperature)}°C` });
  }
  if (typeof activity.weatherWindSpeed === 'number' && Number.isFinite(activity.weatherWindSpeed)) {
    conditionMetrics.push({
      label: copy.wind,
      value: `${new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 1 }).format(activity.weatherWindSpeed)} ${copy.windUnit}`,
    });
  }
  if (activity.locationName) conditionMetrics.push({ label: copy.location, value: activity.locationName });

  const paceMetrics =
    visibility.pace && isRunningActivity(activity.sport) && activity.distance > 0 && activity.duration > 0
      ? [{ label: copy.averagePace, value: `${formatPace(activity.distance, activity.duration)} /${copy.km}` }]
      : [];
  const speed = getSpeedInKmPerHour(activity.distance, activity.duration);
  const speedMetrics =
    visibility.pace && Number.isFinite(speed) && speed > 0
      ? [
          {
            label: copy.averageSpeed,
            value: `${new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 1 }).format(speed)} ${copy.kmh}`,
          },
        ]
      : [];
  const elevationMetrics =
    visibility.elevation && activity.elevationGain > 0
      ? [{ label: copy.elevationGain, value: `${Math.round(activity.elevationGain)} ${copy.m}` }]
      : [];
  const otherMetrics =
    typeof activity.caloriesActive === 'number'
      ? [{ label: copy.calories, value: `${activity.caloriesActive} ${copy.kcal}` }]
      : [];

  return [
    createSection(copy.duration, [{ label: copy.total, value: formatDuration(activity.duration) }]),
    createSection(copy.distance, [{ label: copy.total, value: `${(activity.distance / 1000).toFixed(2)} ${copy.km}` }]),
    createSection(copy.pace, paceMetrics),
    createSection(copy.elevation, elevationMetrics),
    createSection(copy.speed, speedMetrics),
    createSection(copy.heartRate, heartRateMetrics),
    createSection(copy.technique, techniqueMetrics),
    createSection(copy.conditions, conditionMetrics),
    createSection(copy.other, otherMetrics),
  ].filter((section): section is ActivityStatisticSection => section !== null);
}
