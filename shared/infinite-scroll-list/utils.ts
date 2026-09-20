import { createElement } from 'react';
import Card from '@S/card/card';
import type { ActivityListItemResponse } from '@R/runich-api/types';

type ActivityListItem = ActivityListItemResponse;

export function renderCardsFunction({ item }: { item: ActivityListItem }) {
  const {
    title,
    date,
    sport,
    photoVideoUrls,
    mapPhotoUrl,
    mapPhotoUrlBlurhash,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    duration,
    distance,
    elevationGain,
    steps,
    emotion,
    id,
    userId,
    profile,
    _count: { comments: commentsLength, likes: likesLength },
  } = item;

  return createElement(Card, {
    isShowDeleteBtn: false,
    isShowDescription: false,
    title: title ?? '',
    date,
    sport,
    userId,
    id,
    key: id,
    mapPhotoUrl,
    mapPhotoUrlBlurhash,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    photoVideoUrls,
    duration,
    distance,
    elevationGain,
    steps,
    emotion,
    profile,
    commentsLength,
    likesLength,
  });
}

export const keyExtractor = (item: ActivityListItem) => item.id;
