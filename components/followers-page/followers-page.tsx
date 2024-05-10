import ErrorComponent from '@C/error-component/error-component';
import UserListItemSimple from '@C/user-list-item/user-list-item';
import { useGetFollowersByUserIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useAuth } from 'auth/context/auth-context';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListOfFollowers() {
  const { user } = useAuth();
  const { id: friendId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    isError,
    data: users,
    refetch,
  } = useGetFollowersByUserIdQuery(friendId ? `${friendId}` : `${user?.id}`);
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
            renderItem={({ item }) => (
              <UserListItemSimple
                city={item.users.profile?.city}
                name={item.users.profile?.name}
                surname={item.users.profile?.surname}
                profilePhoto={item.users.profile?.profilePhoto}
                placeholder={item.users.profile?.profilePhotoBlurhash}
                user_id={item.users.profile?.user_id}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineLarge">There are no followers</Text>
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
