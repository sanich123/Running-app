import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';

export const renderFollowerItem = ({ item }: { item: any }) =>
  createElement(UserListItem, {
    city: item.user?.profile?.city,
    name: item.user?.profile?.name,
    surname: item.user?.profile?.surname,
    profilePhoto: item.user?.profile?.profilePhoto,
    placeholder: item.user?.profile?.profilePhotoBlurhash,
    userId: item.userId,
    allowNewFollowers: item.user?.profile?.allowNewFollowers,
  });

export const followerKeyExtractor = (item: any) => item.id || item.userId;
export const renderDivider = () => createElement(Divider);
