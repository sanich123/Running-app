import { MAX_MOBILE_WIDTH } from '@const/const';
import { ACTIVITY_MEDIA_HEIGHT_RATIO, ACTIVITY_MEDIA_MAX_HEIGHT, ACTIVITY_MEDIA_MIN_HEIGHT } from './const';
import type { ActivityCardData } from '../types';
import type { DisplayedMediaItem } from './types';

export function getActivityMediaDimensions(width: number) {
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH;
  const mediaHeight = Math.min(
    Math.max(mediaWidth * ACTIVITY_MEDIA_HEIGHT_RATIO, ACTIVITY_MEDIA_MIN_HEIGHT),
    ACTIVITY_MEDIA_MAX_HEIGHT,
  );

  return { mediaWidth, mediaHeight };
}

export function getDisplayedMediaData(
  media: ActivityCardData['media'],
  displayedMapPhotoUrl: ActivityCardData['mapPhotoUrl'],
  hideMap: ActivityCardData['hideMap'],
  mapPhotoUrlBlurhash: ActivityCardData['mapPhotoUrlBlurhash'],
): DisplayedMediaItem[] {
  const activityMedia: DisplayedMediaItem[] = (media ?? [])
    .filter(({ mediaReviewStatus }) => mediaReviewStatus !== 'rejected')
    .map((activityMediaItem) => ({ ...activityMediaItem, isMap: false }));

  return displayedMapPhotoUrl
    ? [
        { url: displayedMapPhotoUrl, thumbnail: null, blurhash: hideMap ? null : mapPhotoUrlBlurhash, isMap: true },
        ...activityMedia,
      ]
    : activityMedia;
}
