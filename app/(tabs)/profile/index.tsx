import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, MD2Colors, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { logOut } from '../../../auth/firebase/email-auth';
import { View } from '../../../components/Themed';
import AvatarShowable from '../../../components/avatar/avatar-showable';
import { useGetUserProfileByIdQuery } from '../../../redux/runnich-api/runnich-api';
import { calculateAge } from '../../../utils/time-formatter';

export default function Profile() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  const { isLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarShowable size={100} />
        <View style={styles.nicknameWrapper}>
          <Text variant="displaySmall">
            {profileInfo?.name || 'Your name'} {profileInfo?.surname || 'Your surname'}
          </Text>
          <Text variant="titleLarge">
            {profileInfo?.city || 'Your homeland'},{' '}
            {profileInfo?.birthday ? `${calculateAge(new Date(profileInfo?.birthday))} years old` : 'Your age'}
          </Text>
        </View>
      </View>
      <View style={styles.bio}>
        <Text variant="titleMedium">{profileInfo?.bio || 'Your biography'}</Text>
      </View>

      <Button mode="outlined" icon="logout" onPress={() => logOut()} style={{ marginTop: 15 }}>
        LogOut
      </Button>
      {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
      {error && <Text variant="headlineSmall">{`An error occured, ${error.toString()}`}</Text>}
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
