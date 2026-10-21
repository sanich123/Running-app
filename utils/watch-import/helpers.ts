import { SPORTS_BTNS_VALUES } from '@const/sports';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { WATCH_IMPORT_DAYS } from './const';
import { calculateWatchWorkoutKilometreSplits } from './kilometre-splits';
import type { WatchImportDateRange } from './types';
import type { WatchWorkout } from '../../modules/runich-health/src/RunichHealth';
import type { WatchWorkoutToSend } from '@R/services/activity/types';
import type { ActivityHeartRateSample } from '@S/card/types';
import type { LocationObject } from 'expo-location';

const MAX_IMPORTED_HEART_RATE_SAMPLES = 15_000;

export function getWatchImportDateRange(now = new Date()): WatchImportDateRange {
  const end = now.toISOString();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - WATCH_IMPORT_DAYS);
  return { startDate: startDate.toISOString(), endDate: end };
}

function toLocationObject(location: WatchWorkout['locations'][number]): LocationObject {
  return {
    timestamp: location.timestamp ?? 0,
    coords: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude ?? null,
      accuracy: location.coords.accuracy ?? null,
      altitudeAccuracy: location.coords.altitudeAccuracy ?? null,
      heading: location.coords.heading ?? null,
      speed: location.coords.speed ?? null,
    },
  };
}

function reduceHeartRateSamples(workout: WatchWorkout): ActivityHeartRateSample[] | undefined {
  const samples = workout.heartRateSamples;
  if (!samples?.length) return undefined;
  if (samples.length <= MAX_IMPORTED_HEART_RATE_SAMPLES) return samples;

  let minIndex = 0;
  let maxIndex = 0;
  samples.forEach((sample, index) => {
    if (sample.beatsPerMinute < samples[minIndex].beatsPerMinute) minIndex = index;
    if (sample.beatsPerMinute > samples[maxIndex].beatsPerMinute) maxIndex = index;
  });

  const selectedIndices = new Set([0, samples.length - 1, minIndex, maxIndex]);
  const remainingSlots = MAX_IMPORTED_HEART_RATE_SAMPLES - selectedIndices.size;
  for (let sample = 1; sample <= remainingSlots; sample += 1) {
    selectedIndices.add(Math.round((sample * (samples.length - 1)) / (remainingSlots + 1)));
  }

  return [...selectedIndices].sort((first, second) => first - second).map((index) => samples[index]);
}

export function mapWatchWorkoutToActivity(workout: WatchWorkout): WatchWorkoutToSend {
  const duration = Math.max(0, Math.round(workout.duration));
  const distance = Math.max(0, Number.isFinite(workout.distance) ? workout.distance : 0);
  const routeLocations = workout.locations.map(toLocationObject);
  const kilometresSplit = calculateWatchWorkoutKilometreSplits(routeLocations, duration, distance);
  const locations = getReducedLocations(routeLocations, MAX_SAVED_ROUTE_LOCATIONS);
  const heartRateSamples = reduceHeartRateSamples(workout);

  return {
    source: workout.source,
    sourceActivityId: workout.sourceActivityId,
    date: workout.date,
    timeZone: workout.timeZone,
    title: workout.title,
    sport: (workout.sport || SPORTS_BTNS_VALUES.workout) as SPORTS_BTNS_VALUES,
    duration,
    distance,
    speed: getSpeedInMinsInKm(distance, duration).paceAsNumber,
    ...(workout.steps !== undefined && workout.steps >= 0 ? { steps: Math.round(workout.steps) } : {}),
    ...(heartRateSamples ? { heartRateSamples } : {}),
    ...(typeof workout.caloriesActive === 'number' &&
    Number.isFinite(workout.caloriesActive) &&
    workout.caloriesActive >= 0
      ? { caloriesActive: Math.round(workout.caloriesActive) }
      : {}),
    ...(kilometresSplit.length > 0 ? { kilometresSplit } : {}),
    locations,
  };
}
