import ErrorComponent from '@C/error-component/error-component';
import UserListItemSimple from '@C/user-list-item-simple/user-list-item-simple';
import { useGetFriendsByUserIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListOfFollowing() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, error, isError, data: users, refetch } = useGetFriendsByUserIdQuery(`${userId}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[{ flex: 1 }, (isLoading || isError || !users.length) && { justifyContent: 'center' }]}>
      <View>
        {users && (
          <FlatList
            onRefresh={onRefresh}
            refreshing={refreshing}
            data={users}
            renderItem={({ item: { profile } }) => (
              <UserListItemSimple
                city={profile?.city}
                name={profile?.name}
                surname={profile?.surname}
                profilePhoto={profile?.profilePhoto}
                placeholder={profile?.profilePhotoBlurhash}
                user_id={profile?.user_id}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineLarge">Nobody is following you</Text>
              </View>
            }
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
      </View>
    </SafeAreaView>
  );
}
