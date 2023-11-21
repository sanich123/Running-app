import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '../../../../auth/context/auth-context';
import AddDeleteFriendBtn from '../../../../components/add-delete-friend-btn/add-delete-friend-btn';
import AvatarShowable from '../../../../components/avatar-showable/avatar-showable';
import FollowersCount from '../../../../components/followers-count/followers-count';
import FollowingCount from '../../../../components/following-count/following-count';
import ProfileMediaPhotos from '../../../../components/profile-media-photos/profile-media-photos';
import UserBio from '../../../../components/user-bio/user-bio';
import UserCityAge from '../../../../components/user-city-age/user-city-age';
import UserNameSurname from '../../../../components/user-name-surname/user-name-surname';

export default function Profile() {
  const { id: whosProfileViewing } = useLocalSearchParams();
  const { user } = useAuth();
  const isMineActivity = whosProfileViewing === user.id;

  return (
    <>
      <ProfileMediaPhotos userId={`${whosProfileViewing}`} />
      <View style={styles.container}>
        <View style={styles.header}>
          <AvatarShowable size={100} id={`${whosProfileViewing}`} />
          <View style={styles.nicknameWrapper}>
            <UserNameSurname userId={`${whosProfileViewing}`} size="headlineSmall" />
            <UserCityAge userId={`${whosProfileViewing}`} size="titleMedium" />
          </View>
        </View>
        <View style={styles.bio}>
          <UserBio userId={`${whosProfileViewing}`} size="bodyMedium" />
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
          <FollowingCount />
          <FollowersCount />
          {!isMineActivity && whosProfileViewing && <AddDeleteFriendBtn friendId={`${whosProfileViewing}`} />}
        </View>
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
