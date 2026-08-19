import { createElement } from 'react';
import { Divider } from 'react-native-paper';
import UserListItem from '@S/user-list-item/user-list-item';

export const renderLikeItem = ({ item }: { item: any }) => {
  const { profile } = item;
  return createElement(UserListItem, {
    name: profile?.name,
    surname: profile?.surname,
    profilePhoto: profile?.profilePhoto,
    placeholder: profile?.profilePhotoBlurhash,
    city: profile?.city,
    user_id: profile?.user_id,
  });
};

export const likeKeyExtractor = (item: any) => item.id || `${item.activityId}-${item.authorId}`;
export const renderDivider = () => createElement(Divider);
