import { useKeepAwake } from 'expo-keep-awake';
import { getRouteSpeedColorsFromValues, getRouteSpeedValues } from '@S/display-activity-map/utils';
import {
  ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_LOOKAHEAD_METERS,
  ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_SMOOTHING_MS,
} from './const';
import type { RouteCoordinate, RouteTimeline } from './types';
import type { ActivityLocation } from '@S/card/types';

function getDistanceInMeters(from: RouteCoordinate, to: RouteCoordinate) {
  const earthRadius = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to[1] - from[1]);
  const longitudeDelta = toRadians(to[0] - from[0]);
  const fromLatitude = toRadians(from[1]);
  const toLatitude = toRadians(to[1]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function createRouteTimeline(locations: ActivityLocation[]): RouteTimeline {
  const coordinates = locations.map(({ coords }) => [coords.longitude, coords.latitude] as RouteCoordinate);
  const segmentSpeeds = getRouteSpeedValues(locations);
  const cumulativeDistances = [0];
  const cumulativePlaybackTimes = [0];
  const segmentPlaybackTimes = getSegmentPlaybackTimes(locations, coordinates);

  for (let index = 1; index < coordinates.length; index += 1) {
    cumulativeDistances.push(
      cumulativeDistances[index - 1] + getDistanceInMeters(coordinates[index - 1], coordinates[index]),
    );
    cumulativePlaybackTimes.push(cumulativePlaybackTimes[index - 1] + segmentPlaybackTimes[index - 1]);
  }

  return {
    coordinates,
    cumulativeDistances,
    totalDistance: cumulativeDistances.at(-1) ?? 0,
    cumulativePlaybackTimes,
    totalPlaybackTime: cumulativePlaybackTimes.at(-1) ?? 0,
    segmentSpeeds,
    segmentColors: getRouteSpeedColorsFromValues(segmentSpeeds),
  };
}

function getSegmentPlaybackTimes(locations: ActivityLocation[], coordinates: RouteCoordinate[]) {
  return locations.slice(1).map((location, index) => {
    const previousLocation = locations[index];
    const previousTimestamp = previousLocation.timestamp ?? previousLocation.coords.timestamp;
    const currentTimestamp = location.timestamp ?? location.coords.timestamp;
    const elapsedSeconds =
      typeof previousTimestamp === 'number' &&
      Number.isFinite(previousTimestamp) &&
      typeof currentTimestamp === 'number' &&
      Number.isFinite(currentTimestamp)
        ? (currentTimestamp - previousTimestamp) / 1000
        : null;

    if (elapsedSeconds && elapsedSeconds > 0) return elapsedSeconds;

    const recordedSpeeds = [previousLocation.coords.speed, location.coords.speed].filter(
      (speed): speed is number => typeof speed === 'number' && Number.isFinite(speed) && speed > 0,
    );
    const distance = getDistanceInMeters(coordinates[index], coordinates[index + 1]);
    const recordedSpeed =
      recordedSpeeds.length > 0
        ? recordedSpeeds.reduce((total, speed) => total + speed, 0) / recordedSpeeds.length
        : null;

    return recordedSpeed ? distance / recordedSpeed : distance;
  });
}

export function getRouteCoordinateAtProgress(timeline: RouteTimeline, progress: number): RouteCoordinate | null {
  return getCoordinateAtCumulativeProgress(timeline.coordinates, timeline.cumulativeDistances, progress);
}

export function getRouteCoordinateAtPlaybackProgress(
  timeline: RouteTimeline,
  progress: number,
): RouteCoordinate | null {
  const { coordinates, cumulativePlaybackTimes, totalPlaybackTime, cumulativeDistances } = timeline;
  const cumulativeValues = totalPlaybackTime > 0 ? cumulativePlaybackTimes : cumulativeDistances;

  return getCoordinateAtCumulativeProgress(coordinates, cumulativeValues, progress);
}

export function getRouteSpeedAtPlaybackProgress(timeline: RouteTimeline, progress: number): number | null {
  const { cumulativePlaybackTimes, cumulativeDistances, totalPlaybackTime, segmentSpeeds } = timeline;
  const cumulativeValues = totalPlaybackTime > 0 ? cumulativePlaybackTimes : cumulativeDistances;
  const segment = getProgressSegment(cumulativeValues, progress);
  if (!segment) return null;

  const currentSpeed = segmentSpeeds[segment.index - 1] ?? null;
  const nextSpeed = segmentSpeeds[segment.index] ?? null;
  if (currentSpeed === null) return nextSpeed;
  if (nextSpeed === null) return currentSpeed;

  return currentSpeed + (nextSpeed - currentSpeed) * segment.progress;
}

function getCoordinateAtCumulativeProgress(
  coordinates: RouteCoordinate[],
  cumulativeValues: number[],
  progress: number,
): RouteCoordinate | null {
  if (!coordinates.length) return null;
  if (coordinates.length === 1) return coordinates[0];

  const total = cumulativeValues.at(-1) ?? 0;
  if (total <= 0) return coordinates[0];
  const target = total * Math.max(0, Math.min(1, progress));
  let low = 1;
  let high = cumulativeValues.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (cumulativeValues[middle] < target) low = middle + 1;
    else high = middle;
  }

  const segmentStartValue = cumulativeValues[low - 1];
  const segmentLength = cumulativeValues[low] - segmentStartValue;
  const segmentProgress = segmentLength > 0 ? (target - segmentStartValue) / segmentLength : 0;
  const from = coordinates[low - 1];
  const to = coordinates[low];

  return [from[0] + (to[0] - from[0]) * segmentProgress, from[1] + (to[1] - from[1]) * segmentProgress];
}

function getRouteDistanceAtPlaybackProgress(timeline: RouteTimeline, progress: number) {
  const { cumulativeDistances, cumulativePlaybackTimes, totalDistance, totalPlaybackTime } = timeline;
  if (totalPlaybackTime <= 0) return totalDistance * Math.max(0, Math.min(1, progress));

  const segment = getProgressSegment(cumulativePlaybackTimes, progress);
  if (!segment) return 0;

  const distanceStart = cumulativeDistances[segment.index - 1];
  const distanceEnd = cumulativeDistances[segment.index];

  return distanceStart + (distanceEnd - distanceStart) * segment.progress;
}

function getProgressSegment(cumulativeValues: number[], progress: number) {
  const total = cumulativeValues.at(-1) ?? 0;
  if (cumulativeValues.length < 2 || total <= 0) return null;

  const target = total * Math.max(0, Math.min(1, progress));
  let low = 1;
  let high = cumulativeValues.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (cumulativeValues[middle] < target) low = middle + 1;
    else high = middle;
  }

  const segmentStartValue = cumulativeValues[low - 1];
  const segmentLength = cumulativeValues[low] - segmentStartValue;

  return {
    index: low,
    progress: segmentLength > 0 ? (target - segmentStartValue) / segmentLength : 0,
  };
}

export function getRouteHeadingAtProgress(timeline: RouteTimeline, progress: number): number {
  const { coordinates, totalDistance } = timeline;
  if (coordinates.length < 2 || totalDistance <= 0) return 0;

  const targetDistance = getRouteDistanceAtPlaybackProgress(timeline, progress);
  const headingStartDistance = Math.min(
    targetDistance,
    Math.max(totalDistance - ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_LOOKAHEAD_METERS, 0),
  );
  const headingEndDistance = Math.min(
    headingStartDistance + ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_LOOKAHEAD_METERS,
    totalDistance,
  );
  const from = getRouteCoordinateAtProgress(timeline, headingStartDistance / totalDistance);
  const to = getRouteCoordinateAtProgress(timeline, headingEndDistance / totalDistance);
  if (!from || !to || (from[0] === to[0] && from[1] === to[1])) return 0;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeFrom = toRadians(from[1]);
  const latitudeTo = toRadians(to[1]);
  const longitudeDelta = toRadians(to[0] - from[0]);
  const y = Math.sin(longitudeDelta) * Math.cos(latitudeTo);
  const x =
    Math.cos(latitudeFrom) * Math.sin(latitudeTo) -
    Math.sin(latitudeFrom) * Math.cos(latitudeTo) * Math.cos(longitudeDelta);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function smoothRouteHeading(currentHeading: number, targetHeading: number, elapsedMs: number): number {
  const shortestDelta = ((targetHeading - currentHeading + 540) % 360) - 180;
  const smoothing = 1 - Math.exp(-Math.max(elapsedMs, 0) / ACTIVITY_ROUTE_REPLAY_CAMERA_HEADING_SMOOTHING_MS);
  return (currentHeading + shortestDelta * smoothing + 360) % 360;
}

export function KeepAwakeDuringVideoExport() {
  useKeepAwake('activity-route-replay-video-export', { suppressDeactivateWarnings: true });
  return null;
}

export function KeepAwakeDuringReplay() {
  useKeepAwake('activity-route-replay-playback', { suppressDeactivateWarnings: true });
  return null;
}
