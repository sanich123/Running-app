import { ACTIVITY_MEDIA_HEIGHT } from './media-list/const';

const MAPBOX_IMAGE_SIZE_PATTERN = /(\/)\d+x\d+(@\d+x)?(?=\?|$)/;
const MAPBOX_STATIC_IMAGE_OPTIONS = 'attribution=false&logo=false';

function removeMapboxAttribution(mapUrl: string) {
  const [path, query = ''] = mapUrl.split('?');
  const queryParams = query
    .split('&')
    .filter((queryParam) => queryParam && !queryParam.startsWith('attribution=') && !queryParam.startsWith('logo='));
  return `${path}?${[...queryParams, MAPBOX_STATIC_IMAGE_OPTIONS].filter(Boolean).join('&')}`;
}

export function getCardMapPhotoUrl(mapPhotoUrl: string | null | undefined, width: number) {
  if (!mapPhotoUrl?.includes('api.mapbox.com')) {
    return mapPhotoUrl;
  }

  const cardWidth = Math.max(1, Math.round(width));
  return removeMapboxAttribution(
    mapPhotoUrl.replace(MAPBOX_IMAGE_SIZE_PATTERN, `$1${cardWidth}x${ACTIVITY_MEDIA_HEIGHT}$2`),
  );
}

export function getShareMapPhotoUrl(mapPhotoUrl: string | null | undefined, width?: number, height?: number) {
  if (!mapPhotoUrl?.includes('api.mapbox.com')) {
    return mapPhotoUrl;
  }

  const mapUrl =
    width && height ? mapPhotoUrl.replace(MAPBOX_IMAGE_SIZE_PATTERN, `$1${width}x${height}$2`) : mapPhotoUrl;
  return removeMapboxAttribution(mapUrl);
}
