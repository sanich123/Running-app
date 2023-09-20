import { StyleSheet } from 'react-native';
import { ActivityIndicator, MD2Colors, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { View } from '../../../components/Themed';
import AvatarShowable from '../../../components/avatar/avatar-showable';
import ErrorComponent from '../../../components/error-component/error-component';
import ProfileFollowersSection from '../../../components/profile-followers-section/profile-followers-section';
import ProfileMediaPhotos from '../../../components/profile-media-photos/profile-media-photos';
import useGetProfileInfo from '../../../utils/hooks/use-get-profile';
import { calculateAge } from '../../../utils/time-formatter';

export default function Profile() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  const { isLoading, profileInfo, profileError } = useGetProfileInfo();
  
  return (
    <>
      <ProfileMediaPhotos userId={id} />
      <View style={styles.container}>
        <View style={styles.header}>
          <AvatarShowable size={100} id={id} />
          <View style={styles.nicknameWrapper}>
            <Text variant="headlineMedium">
              {profileInfo[0]?.name || 'Your name'} {profileInfo[0]?.surname || 'Your surname'}
            </Text>
            <Text variant="titleLarge">
              {profileInfo[0]?.city || 'Your homeland'},{' '}
              {profileInfo[0]?.birthday ? `${calculateAge(new Date(profileInfo[0]?.birthday))} years old` : 'Your age'}
            </Text>
          </View>
        </View>
        <View style={styles.bio}>
          <Text variant="titleMedium">{profileInfo[0]?.bio || 'Your biography'}</Text>
        </View>
        <ProfileFollowersSection />
        {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
        {profileError ? <ErrorComponent error={profileError} /> : null}
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
