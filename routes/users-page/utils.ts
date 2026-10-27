import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';
import type { ProfileResponse } from '@R/services/profile/types';

export const renderUserItem = ({ item }: { item: ProfileResponse & { userId: string } }) =>
  createElement(UserListItem, {
    city: item?.city,
    name: item?.name,
    surname: item?.surname,
    profilePhoto: item?.profilePhoto,
    placeholder: item?.profilePhotoBlurhash,
    profilePhotoReviewStatus: item?.profilePhotoReviewStatus,
    userId: item?.userId,
    allowNewFollowers: item?.allowNewFollowers,
  });

export const userKeyExtractor = (item: ProfileResponse & { userId: string }) => item.userId;
export const renderDivider = () => createElement(Divider);
