import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';

export const renderUserItem = ({ item }: { item: any }) =>
  createElement(UserListItem, {
    city: item?.city,
    name: item?.name,
    surname: item?.surname,
    profilePhoto: item?.profilePhoto,
    placeholder: item?.profilePhotoBlurhash,
    userId: item?.userId,
    allowNewFollowers: item?.allowNewFollowers,
  });

export const userKeyExtractor = (item: any) => item.userId;
export const renderDivider = () => createElement(Divider);
