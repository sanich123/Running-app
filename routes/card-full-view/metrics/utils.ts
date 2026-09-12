import {
  getAverageCadence,
  getSpeedInKmPerHour,
  getSpeedInMinsInKm,
  isRunningActivity,
  isWalkingActivity,
} from '@U/location/location-utils';
import { HOME_ACTIVITY_FULL_VIEW } from './const';
import type { LANGUAGES } from '@const/enums';

export function getActivityMainMetric({
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
      title: HOME_ACTIVITY_FULL_VIEW[language].averagePace,
      value: `${getSpeedInMinsInKm(distance, duration).paceAsString} /${HOME_ACTIVITY_FULL_VIEW[language].km}`,
    };
  }

  return {
    title: HOME_ACTIVITY_FULL_VIEW[language].averageSpeed,
    value: `${getSpeedInKmPerHour(distance, duration).toFixed(1)} ${HOME_ACTIVITY_FULL_VIEW[language].kmh}`,
  };
}

export function getActivityAdditionalMetric({
  sport,
  steps,
  duration,
  language,
}: {
  sport: string;
  steps?: number | null;
  duration: number;
  language: LANGUAGES;
}) {
  if (isWalkingActivity(sport) && steps != null && steps > 0) {
    return {
      title: HOME_ACTIVITY_FULL_VIEW[language].steps,
      value: `${steps}`,
    };
  }

  if (isRunningActivity(sport)) {
    const averageCadence = getAverageCadence(steps, duration);
    if (averageCadence <= 0) {
      return null;
    }

    return {
      title: HOME_ACTIVITY_FULL_VIEW[language].averageCadence,
      value: `${averageCadence} ${HOME_ACTIVITY_FULL_VIEW[language].spm}`,
    };
  }

  return null;
}
