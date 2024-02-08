import { useAuth } from '@A/context/auth-context';
import AddDeleteFriendBtn from '@C/add-delete-friend-btn/add-delete-friend-btn';
import { ROUTES } from '@const/enums';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

export default function UserListItemSimple({
  name,
  surname,
  profilePhoto,
  city,
  user_id,
}: {
  name: string;
  surname: string;
  profilePhoto: string;
  city: string;
  user_id: string;
}) {
  const { user } = useAuth();
  const isMineActivity = user_id === user?.id;
  const { push } = useRouter();

  return (
    <View style={styles.userItemWrapper}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.pressableAreaWrapper]}
        onPress={() => push(`/${ROUTES.home}/${ROUTES.profile}/${user_id}`)}>
        <Image style={{ width: 35, height: 35, borderRadius: 70 }} source={{ uri: profilePhoto }} contentFit="cover" />
        <View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
              {name}
            </Text>
            <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
              {surname}
            </Text>
          </View>
          <Text variant="bodyMedium">{city}</Text>
        </View>
      </Pressable>
      {!isMineActivity && <AddDeleteFriendBtn friendId={user_id} />}
    </View>
  );
}

const styles = StyleSheet.create({
  userItemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  pressableAreaWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
});
