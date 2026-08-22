import {
  getSpeedInKmPerHour,
  getSpeedInMinsInKm,
  isRunningActivity,
  isWalkingOrHikingActivity,
} from '@U/location/location-utils';
import { formatDurationMinsSecs } from '@U/time-formatter';
import { MAP_METRICS } from './const';
import type { LANGUAGES } from '@const/enums';
import type { LastKmSplit } from '@R/slices/location/types';

export function getLiveMainMetric({
  sport,
  distance,
  duration,
  language,
}: {
  sport: string;
  distance: number;
  duration: number;
  language: LANGUAGES;
}) {
  if (isRunningActivity(sport)) {
    return {
      title: MAP_METRICS[language].pace,
      metric: `${duration && distance ? getSpeedInMinsInKm(distance, duration).paceAsString : 0} /${MAP_METRICS[language].km}`,
    };
  }

  return {
    title: MAP_METRICS[language].speed,
    metric: `${getSpeedInKmPerHour(distance, duration).toFixed(1)} ${MAP_METRICS[language].kmh}`,
  };
}

export function getLiveLastKmMetric({
  sport,
  split,
  language,
}: {
  sport: string;
  split?: LastKmSplit;
  language: LANGUAGES;
}) {
  if (isRunningActivity(sport)) {
    return formatDurationMinsSecs(split?.lastKilometerDuration ?? 0);
  }

  return `${getSpeedInKmPerHour(1000, split?.lastKilometerDuration ?? 0).toFixed(1)} ${MAP_METRICS[language].kmh}`;
}

export function getLiveTopMetric({
  sport,
  altitude,
  steps,
  language,
}: {
  sport: string;
  altitude: number;
  steps: number;
  language: LANGUAGES;
}) {
  if (isWalkingOrHikingActivity(sport)) {
    return {
      title: MAP_METRICS[language].steps,
      metric: String(steps),
    };
  }

  return {
    title: MAP_METRICS[language].altitude,
    metric: `${Math.round(Math.max(0, altitude))} ${MAP_METRICS[language].m}`,
  };
}
