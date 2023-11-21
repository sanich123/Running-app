import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, MD2Colors, Text } from 'react-native-paper';

import { useAuth } from '../../../auth/context/auth-context';
import AddDeleteFriendBtn from '../../../components/add-delete-friend-btn/add-delete-friend-btn';
import AvatarShowable from '../../../components/avatar-showable/avatar-showable';
import ErrorComponent from '../../../components/error-component/error-component';
import FollowersCount from '../../../components/followers-count/followers-count';
import FollowingCount from '../../../components/following-count/following-count';
import ProfileMediaPhotos from '../../../components/profile-media-photos/profile-media-photos';
import { useGetUserProfileByIdQuery } from '../../../redux/runich-api/runich-api';

export default function Profile() {
  const { id: friendId } = useLocalSearchParams();
  const { user } = useAuth();
  const isMineActivity = friendId === user.id;
  const {
    isLoading,
    data: profile,
    error,
  } = useGetUserProfileByIdQuery(user?.id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <>
      <ProfileMediaPhotos userId={user?.id} />
      <View style={styles.container}>
        <View style={styles.header}>
          <AvatarShowable size={100} id={user?.id} />
          <View style={styles.nicknameWrapper}>
            <Text variant="headlineMedium">
              {profile?.name} {profile?.surname}
            </Text>
            <Text variant="titleLarge">{profile?.city} </Text>
          </View>
        </View>
        <View style={styles.bio}>
          <Text variant="titleMedium">{profile?.bio}</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
          <FollowingCount />
          <FollowersCount />
          {!isMineActivity && friendId && <AddDeleteFriendBtn friendId={`${friendId}`} />}
        </View>
        {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
        {error ? <ErrorComponent error={error} /> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10,
  },
  nicknameWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  bio: {
    display: 'flex',
    marginTop: 20,
    marginBottom: 20,
  },
});
