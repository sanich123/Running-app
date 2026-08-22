import {
  getAverageCadence,
  getSpeedInKmPerHour,
  isRunningActivity,
  isWalkingActivity,
} from '@U/location/location-utils';
import { formatDurationMinsSecs } from '@U/time-formatter';
import { KM_SPLITS } from './const';
import type { LANGUAGES } from '@const/enums';
import type { ActivityKilometreSplit } from '@S/card/types';

export function getSplitMetricValue(split: ActivityKilometreSplit, sport: string) {
  if (isWalkingActivity(sport)) {
    return getAverageCadence(split.lastKilometerSteps, split.lastKilometerDuration);
  }

  return getSpeedInKmPerHour(1000, split.lastKilometerDuration);
}

export function getFastestSplitValue(splits: ActivityKilometreSplit[], sport: string) {
  if (!splits.length) return 0;

  const values = splits.map((split) => getSplitMetricValue(split, sport));
  return isRunningActivity(sport) ? Math.min(...values) : Math.max(...values);
}

export function getSplitBarWidth(split: ActivityKilometreSplit, fastestSplitValue: number, sport: string) {
  const value = getSplitMetricValue(split, sport);
  if (!value || !fastestSplitValue) return 0;

  return isRunningActivity(sport) ? (fastestSplitValue / value) * 100 : (value / fastestSplitValue) * 100;
}

export function getSplitMetric(split: ActivityKilometreSplit, sport: string, language: LANGUAGES) {
  if (isWalkingActivity(sport)) {
    return Number.isFinite(split.lastKilometerSteps)
      ? `${getAverageCadence(split.lastKilometerSteps, split.lastKilometerDuration)} ${KM_SPLITS[language].spm}`
      : '—';
  }

  if (!isRunningActivity(sport) && !isWalkingActivity(sport)) {
    return `${getSpeedInKmPerHour(1000, split.lastKilometerDuration).toFixed(1)} ${KM_SPLITS[language].kmh}`;
  }

  return formatDurationMinsSecs(split.lastKilometerDuration);
}

export function getSplitMetricLabel(sport: string, language: LANGUAGES) {
  if (isWalkingActivity(sport)) return KM_SPLITS[language].cadence;
  if (isRunningActivity(sport)) return KM_SPLITS[language].pace;
  return KM_SPLITS[language].speed;
}
