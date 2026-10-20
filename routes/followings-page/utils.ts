import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';
import type { FollowingResponse } from '@R/runich-api/types';

export const renderFollowingItem = ({ item }: { item: FollowingResponse }) =>
  createElement(UserListItem, {
    city: item.profile?.city,
    name: item.profile?.name,
    surname: item.profile?.surname,
    profilePhoto: item.profile?.profilePhoto,
    placeholder: item.profile?.profilePhotoBlurhash,
    userId: item?.friendId,
    allowNewFollowers: item.profile?.allowNewFollowers,
  });

export const followingKeyExtractor = (item: FollowingResponse) => item.id || item.friendId;
export const renderDivider = () => createElement(Divider);
