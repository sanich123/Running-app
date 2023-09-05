import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';
import AddFriendBtn from '../add-friend-btn/add-friend-btn';
import AvatarShowable from '../avatar/avatar-showable';
import ErrorComponent from '../error-component/error-component';

export default function UserListItem({ userId }: { userId: string }) {
  const { isLoading, error, data: userProfile } = useGetUserProfileByIdQuery(userId);
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
          <AddFriendBtn friendId={userId} />
        </View>
      )}
    </>
  );
}
