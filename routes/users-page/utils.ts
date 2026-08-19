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
    user_id: item?.user_id,
  });

export const userKeyExtractor = (item: any) => item.user_id;
export const renderDivider = () => createElement(Divider);
