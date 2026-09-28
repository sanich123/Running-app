import { createElement } from 'react';
import Card from '@S/card/card';
import type { ActivityListItemResponse } from '@R/runich-api/types';

type ActivityListItem = ActivityListItemResponse;

export function renderCardsFunction({ item }: { item: ActivityListItem }) {
  const { _count, ...activity } = item;

  return createElement(Card, {
    isShowDeleteBtn: false,
    isShowDescription: false,
    activity: {
      ...activity,
      title: activity.title ?? '',
      commentsLength: _count.comments,
      likesLength: _count.likes,
    },
    key: activity.id,
  });
}

export const keyExtractor = (item: ActivityListItem) => item.id;
