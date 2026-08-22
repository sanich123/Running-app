import { getElevationGain } from '@U/location/location-utils';
import { ACTIVITY_MEDIA_HEIGHT } from './media-list/const';
import type { ActivityKilometreSplit, ActivityLocation } from './types';

const MAPBOX_IMAGE_SIZE_PATTERN = /(\/)\d+x\d+(@\d+x)?(?=\?|$)/;

export function getCardMapPhotoUrl(mapPhotoUrl: string | null | undefined, width: number) {
  if (!mapPhotoUrl?.includes('api.mapbox.com')) {
    return mapPhotoUrl;
  }

  const cardWidth = Math.max(1, Math.round(width));
  return mapPhotoUrl.replace(MAPBOX_IMAGE_SIZE_PATTERN, `$1${cardWidth}x${ACTIVITY_MEDIA_HEIGHT}$2`);
}

export function getShareMapPhotoUrl(mapPhotoUrl: string | null | undefined) {
  if (!mapPhotoUrl?.includes('api.mapbox.com')) {
    return mapPhotoUrl;
  }

  const separator = mapPhotoUrl.includes('?') ? '&' : '?';
  return `${mapPhotoUrl}${separator}attribution=false`;
}

export function getActivityCardElevationGain(
  kilometresSplit: ActivityKilometreSplit[] | null | undefined,
  locations: ActivityLocation[] | null | undefined,
) {
  if (kilometresSplit?.length) {
    return kilometresSplit.reduce((total, split) => total + Math.max(0, split.lastKilometerAltitude), 0);
  }

  return locations?.length ? getElevationGain(locations) : 0;
}
