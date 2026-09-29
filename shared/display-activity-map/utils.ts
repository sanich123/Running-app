import getBbox from '@turf/bbox';
import lineString from 'turf-linestring';
import { DISPLAY_ACTIVITY_MAP_SPEED_COLORS } from './const';
import type { ActivityLocation } from '@S/card/types';

export function getActivityMapBounds(locations: ActivityLocation[]) {
  const routeCoordinates = locations.map(({ coords: { longitude, latitude } }) => [longitude, latitude]);
  const [minLng, minLat, maxLng, maxLat] = getBbox(lineString(routeCoordinates));

  return {
    boundBox: [minLng, minLat, maxLng, maxLat] as [number, number, number, number],
    bounds: {
      ne: [maxLng, maxLat] as [number, number],
      sw: [minLng, minLat] as [number, number],
    },
    routeCoordinates,
  };
}

export function getRouteSpeedColors(locations: ActivityLocation[]) {
  return getRouteSpeedColorsFromValues(getRouteSpeedValues(locations));
}

export function getRouteSpeedColorsFromValues(segmentSpeeds: (number | null)[]) {
  const knownSpeeds = segmentSpeeds.filter((speed): speed is number => speed !== null).sort((a, b) => a - b);
  if (!knownSpeeds.length) return [];

  const lowerBound = knownSpeeds[Math.floor((knownSpeeds.length - 1) * 0.1)];
  const upperBound = knownSpeeds[Math.ceil((knownSpeeds.length - 1) * 0.9)];
  const fallbackSpeed = knownSpeeds[Math.floor(knownSpeeds.length / 2)];

  return segmentSpeeds.map((speed) => {
    const boundedSpeed = Math.max(lowerBound, Math.min(upperBound, speed ?? fallbackSpeed));
    const factor = upperBound > lowerBound ? (boundedSpeed - lowerBound) / (upperBound - lowerBound) : 0.5;
    return getSpeedHeatmapColor(factor);
  });
}

export function getRouteSpeedValues(locations: ActivityLocation[]) {
  const coordinates = locations.map(({ coords }) => [coords.longitude, coords.latitude] as const);
  const segmentSpeeds = locations.slice(1).map((location, index) => {
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

    if (elapsedSeconds && elapsedSeconds > 0) {
      return getDistanceInMeters(coordinates[index], coordinates[index + 1]) / elapsedSeconds;
    }

    const recordedSpeeds = [previousLocation.coords.speed, location.coords.speed].filter(
      (speed): speed is number => typeof speed === 'number' && Number.isFinite(speed) && speed >= 0,
    );
    return recordedSpeeds.length
      ? recordedSpeeds.reduce((total, speed) => total + speed, 0) / recordedSpeeds.length
      : null;
  });
  const smoothedSpeeds = segmentSpeeds.map((_, index) => {
    const nearbySpeeds = segmentSpeeds
      .slice(Math.max(0, index - 2), Math.min(segmentSpeeds.length, index + 3))
      .filter((speed): speed is number => speed !== null && Number.isFinite(speed));

    return nearbySpeeds.length ? nearbySpeeds.reduce((total, speed) => total + speed, 0) / nearbySpeeds.length : null;
  });
  return smoothedSpeeds;
}

export function getSpeedHeatmapColor(factor: number) {
  const green = getColorChannels(DISPLAY_ACTIVITY_MAP_SPEED_COLORS[0]);
  const yellow = getColorChannels(DISPLAY_ACTIVITY_MAP_SPEED_COLORS[1]);
  const red = getColorChannels(DISPLAY_ACTIVITY_MAP_SPEED_COLORS[2]);
  const from = factor < 0.5 ? green : yellow;
  const to = factor < 0.5 ? yellow : red;
  const progress = factor < 0.5 ? factor * 2 : (factor - 0.5) * 2;
  const channels = from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function getDistanceInMeters(from: readonly [number, number], to: readonly [number, number]) {
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

function getColorChannels(color: string) {
  return color.match(/[0-9a-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16)) ?? [0, 0, 0];
}
