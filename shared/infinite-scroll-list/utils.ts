import { createElement } from 'react';
import Card from '@S/card/card';
import type { ActivityResponse } from '@R/runich-api/types';

type ActivityListItem = ActivityResponse;

export function renderCardsFunction({ item }: { item: ActivityListItem }) {
  const {
    description,
    title,
    date,
    sport,
    photoVideoUrls,
    mapPhotoUrl,
    locations,
    duration,
    distance,
    id,
    user_id,
    profile,
    _count: { comments: commentsLength },
  } = item;

  return createElement(Card, {
    isShowDeleteBtn: false,
    isShowDescription: false,
    description: description ?? '',
    title: title ?? '',
    date,
    sport,
    userId: user_id,
    id,
    key: id,
    mapPhotoUrl,
    locations,
    photoVideoUrls,
    duration,
    distance,
    profile,
    commentsLength,
  });
}

export const keyExtractor = (item: ActivityListItem) => item.id;
