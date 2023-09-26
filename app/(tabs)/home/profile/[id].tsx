import { View } from '@c/Themed';
import AvatarShowable from '@c/avatar/avatar-showable';
import ProfileFollowersSection from '@c/profile-followers-section/profile-followers-section';
import ProfileMediaPhotos from '@c/profile-media-photos/profile-media-photos';
import UserBio from '@c/user-bio/user-bio';
import UserCityAge from '@c/user-city-age/user-city-age';
import UserNameSurname from '@c/user-name-surname/user-name-surname';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function Profile() {
  const { id: friendId } = useLocalSearchParams();
  return (
    <>
      <ProfileMediaPhotos userId={friendId.toString()} />
      <View style={styles.container}>
        <View style={styles.header}>
          <AvatarShowable size={100} id={friendId.toString()} />
          <View style={styles.nicknameWrapper}>
            <UserNameSurname size="headlineSmall" />
            <UserCityAge userId={friendId.toString()} size="titleMedium" />
          </View>
        </View>
        <View style={styles.bio}>
          <UserBio userId={friendId.toString()} size="bodyMedium" />
        </View>
        <ProfileFollowersSection />
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
