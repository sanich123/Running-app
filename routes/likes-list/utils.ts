import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';
import type { LikeListResponse } from '@R/runich-api/types';

export const renderLikeItem = ({ item }: { item: LikeListResponse }) => {
  const { profile } = item;
  return createElement(UserListItem, {
    name: profile?.name,
    surname: profile?.surname,
    profilePhoto: profile?.profilePhoto,
    placeholder: profile?.profilePhotoBlurhash,
    city: profile?.city,
    userId: profile?.userId ?? item.authorId,
    allowNewFollowers: profile?.allowNewFollowers,
  });
};

export const likeKeyExtractor = (item: LikeListResponse) => item.id || `${item.activityId}-${item.authorId}`;
export const renderDivider = () => createElement(Divider);
