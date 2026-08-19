import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';

export const renderFollowerItem = ({ item }: { item: any }) =>
  createElement(UserListItem, {
    city: item.users.profile?.city,
    name: item.users.profile?.name,
    surname: item.users.profile?.surname,
    profilePhoto: item.users.profile?.profilePhoto,
    placeholder: item.users.profile?.profilePhotoBlurhash,
    user_id: item.user_id,
  });

export const followerKeyExtractor = (item: any) => item.id || item.user_id;
export const renderDivider = () => createElement(Divider);
