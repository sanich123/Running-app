import { useAuth } from '@auth/context/auth-context';
import { View } from '@c/Themed';
import AvatarShowable from '@c/avatar/avatar-showable';
import ErrorComponent from '@c/error-component/error-component';
import ProfileFollowersSection from '@c/profile-followers-section/profile-followers-section';
import ProfileMediaPhotos from '@c/profile-media-photos/profile-media-photos';
import { useGetUserProfileByIdQuery } from '@r/runnich-api/runnich-api';
import { calculateAge } from '@u/time-formatter';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, MD2Colors, Text } from 'react-native-paper';

export default function Profile() {
  const { user } = useAuth();
  const { isLoading, data: profile, error } = useGetUserProfileByIdQuery(user?.id);

  return (
    <>
      <ProfileMediaPhotos userId={user?.id} />
      <View style={styles.container}>
        <View style={styles.header}>
          <AvatarShowable size={100} id={user?.id} />
          <View style={styles.nicknameWrapper}>
            <Text variant="headlineMedium">
              {profile?.name || 'Your name'} {profile?.surname || 'Your surname'}
            </Text>
            <Text variant="titleLarge">
              {profile?.city || 'Your homeland'},{' '}
              {profile?.birthday ? `${calculateAge(new Date(profile?.birthday))} years old` : 'Your age'}
            </Text>
          </View>
        </View>
        <View style={styles.bio}>
          <Text variant="titleMedium">{profile?.bio || 'Your biography'}</Text>
        </View>
        <ProfileFollowersSection />
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
