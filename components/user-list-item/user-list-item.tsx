import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetFriendsByUserIdQuery, useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';
import AddFriendBtn from '../add-friend-btn/add-friend-btn';
import AvatarShowable from '../avatar/avatar-showable';
import ErrorComponent from '../error-component/error-component';

export default function UserListItem({ userId }: { userId: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const { isLoading, error, data: userProfile } = useGetUserProfileByIdQuery(userId);
  const {
    isLoading: isLoadingFriends,
    error: isLoadingFriendsError,
    data: friends,
  } = useGetFriendsByUserIdQuery(ownerId);
  const isFriendOfOwner = friends?.filter(({ friendId }) => friendId === ownerId);
  console.log(isFriendOfOwner, ownerId, userId, friends);
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {userProfile && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 5,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
          }}>
          <AvatarShowable size={35} id={userId} />
          <Text variant="bodyLarge">{userProfile.name} </Text>
          <Text variant="bodyLarge">{userProfile.surname} </Text>
          <Text variant="bodyLarge">{userProfile.city}</Text>
          {isLoadingFriends && <ActivityIndicator size="small" />}
          {isLoadingFriendsError ? <ErrorComponent error={error} /> : null}
          {!isFriendOfOwner?.length ? <AddFriendBtn friendId={userId} /> : null}
        </View>
      )}
    </>
  );
}
