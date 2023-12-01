import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetFriendsByUserIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useAuth } from 'auth/context/auth-context';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

export default function ListOfFollowing() {
  const { id: userId } = useLocalSearchParams();
  const { user } = useAuth();
  const {
    isLoading,
    error,
    data: users,
    refetch,
  } = useGetFriendsByUserIdQuery(userId !== 'undefined' ? `${userId}` : `${user?.id}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {users && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item }) => <UserListItem userId={item.friendId} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">Nobody is following you, fuck</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider />}
        />
      )}
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
    </SafeAreaView>
  );
}
