import Mapbox from '@rnmapbox/maps';
import { Platform } from 'react-native';
import { ACTIVITY_ROUTE_REPLAY_MAP_STYLES } from '@S/activity-route-replay/const';
import type { OfflineBounds } from '../const';

export const OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO = 3 / 4;

export function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1) return '0 MB';
  if (sizeBytes < 1024 ** 2) return `${Math.round(sizeBytes / 1024)} KB`;
  const megabytes = sizeBytes / 1024 ** 2;
  return megabytes < 1000 ? `${megabytes.toFixed(1)} MB` : `${(megabytes / 1024).toFixed(2)} GB`;
}

export function isMapboxTileLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /tile_count_limit_exceeded|(?:number of maps tiles|tile count).{0,120}(?:maximum allowed|limit)/i.test(
    message,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readCoordinate(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const [longitude, latitude] = value;
  if (typeof longitude !== 'number' || typeof latitude !== 'number') return null;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  return [longitude, latitude];
}

export function parseOfflineMapPackBounds(serializedBounds: unknown): OfflineBounds | null {
  if (Array.isArray(serializedBounds) && serializedBounds.length === 2) {
    const northEast = readCoordinate(serializedBounds[0]);
    const southWest = readCoordinate(serializedBounds[1]);
    return northEast && southWest && northEast[1] > southWest[1] ? [northEast, southWest] : null;
  }

  if (Array.isArray(serializedBounds) && serializedBounds.length === 4) {
    const [northEastLongitude, northEastLatitude, southWestLongitude, southWestLatitude] = serializedBounds;
    const northEast = readCoordinate([northEastLongitude, northEastLatitude]);
    const southWest = readCoordinate([southWestLongitude, southWestLatitude]);
    return northEast && southWest && northEast[1] > southWest[1] ? [northEast, southWest] : null;
  }

  if (typeof serializedBounds !== 'string') return null;
  let parsedBounds: unknown;
  try {
    parsedBounds = JSON.parse(serializedBounds);
  } catch {
    return null;
  }
  if (!isRecord(parsedBounds) || !Array.isArray(parsedBounds.features)) return null;
  const positions = parsedBounds.features.map((feature) => {
    if (!isRecord(feature) || !isRecord(feature.geometry)) return null;
    return readCoordinate(feature.geometry.coordinates);
  });
  if (positions.length !== 2 || !positions[0] || !positions[1]) return null;
  const [northEast, southWest] = positions;
  if (northEast[1] <= southWest[1]) return null;
  return [northEast, southWest];
}

export function getOfflineMapBoundsCenter(bounds: OfflineBounds): [number, number] {
  const [northEast, southWest] = bounds;
  const longitudeSpan = ((northEast[0] - southWest[0] + 540) % 360) - 180;
  const longitude = ((southWest[0] + longitudeSpan / 2 + 540) % 360) - 180;
  return [longitude, (northEast[1] + southWest[1]) / 2];
}

export async function takeOfflineMapThumbnail(bounds: OfflineBounds, isSatellite: boolean) {
  if (Platform.OS === 'web') return undefined;
  const width = 384;
  const height = 512;

  return {
    uri: await Mapbox.snapshotManager.takeSnap({
      bounds,
      height,
      styleURL: isSatellite ? ACTIVITY_ROUTE_REPLAY_MAP_STYLES.satellite : ACTIVITY_ROUTE_REPLAY_MAP_STYLES.map,
      width,
      withLogo: false,
      writeToDisk: true,
    }),
    aspectRatio: OFFLINE_MAP_THUMBNAIL_ASPECT_RATIO,
  };
}
