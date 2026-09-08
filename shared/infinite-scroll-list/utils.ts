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
    duration,
    distance,
    steps,
    id,
    userId,
    profile,
    _count: { comments: commentsLength },
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
    photoVideoUrls,
    duration,
    distance,
    steps,
    profile,
    commentsLength,
  });
}

export const keyExtractor = (item: ActivityListItem) => item.id;
