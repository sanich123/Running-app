import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';

export const renderFollowingItem = ({ item }: { item: any }) =>
  createElement(UserListItem, {
    city: item.profile?.city,
    name: item.profile?.name,
    surname: item.profile?.surname,
    profilePhoto: item.profile?.profilePhoto,
    placeholder: item.profile?.profilePhotoBlurhash,
    user_id: item?.friendId,
  });

export const followingKeyExtractor = (item: any) => item.id || item.friendId;
export const renderDivider = () => createElement(Divider);
