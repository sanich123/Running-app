import { SPORTS_BTNS_VALUES } from '@const/sports';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { WATCH_IMPORT_DAYS } from './const';
import type { WatchImportDateRange } from './types';
import type { WatchWorkout } from '../../modules/runich-health/src/RunichHealth';
import type { WatchWorkoutToSend } from '@R/services/activity/types';
import type { LocationObject } from 'expo-location';

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

export function mapWatchWorkoutToActivity(workout: WatchWorkout): WatchWorkoutToSend {
  const duration = Math.max(0, Math.round(workout.duration));
  const distance = Math.max(0, Number.isFinite(workout.distance) ? workout.distance : 0);
  const locations = getReducedLocations(workout.locations.map(toLocationObject), MAX_SAVED_ROUTE_LOCATIONS);

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
    locations,
  };
}
