import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { View } from '../../../../components/Themed';
import AvatarShowable from '../../../../components/avatar/avatar-showable';
import ProfileFollowersSection from '../../../../components/profile-followers-section/profile-followers-section';
import UserBio from '../../../../components/user-bio/user-bio';
import UserCityAge from '../../../../components/user-city-age/user-city-age';
import UserNameSurname from '../../../../components/user-name-surname/user-name-surname';

export default function Profile() {
  const { id: friendId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarShowable size={100} id={friendId.toString()} />
        <View style={styles.nicknameWrapper}>
          <UserNameSurname userId={friendId.toString()} size="headlineSmall" />
          <UserCityAge userId={friendId.toString()} size="titleMedium" />
        </View>
      </View>
      <View style={styles.bio}>
        <UserBio userId={friendId.toString()} size="bodyMedium" />
      </View>
      <ProfileFollowersSection />
    </View>
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
