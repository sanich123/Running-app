import {
  getSpeedInKmPerHour,
  getSpeedInMinsInKm,
  isRunningActivity,
  isWalkingActivity,
} from '@U/location/location-utils';
import { CARD_METRICS } from './const';
import type { LANGUAGES } from '@const/enums';

export function getCardSpeedMetric({
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
      title: CARD_METRICS[language].pace,
      metrics: `${getSpeedInMinsInKm(distance, duration).paceAsString} /${CARD_METRICS[language].km}`,
    };
  }

  return {
    title: CARD_METRICS[language].speed,
    metrics: `${getSpeedInKmPerHour(distance, duration).toFixed(1)} ${CARD_METRICS[language].kmh}`,
  };
}

export function getCardAdditionalMetric({
  sport,
  steps,
  elevationGain,
  language,
}: {
  sport: string;
  steps?: number | null;
  elevationGain: number;
  language: LANGUAGES;
}) {
  if (isRunningActivity(sport)) {
    return {
      title: CARD_METRICS[language].elevation,
      metrics: `${Math.round(Math.max(0, elevationGain))} ${CARD_METRICS[language].m}`,
    };
  }

  if (isWalkingActivity(sport)) {
    return {
      title: CARD_METRICS[language].steps,
      metrics: `${steps ?? 0}`,
    };
  }

  return null;
}
