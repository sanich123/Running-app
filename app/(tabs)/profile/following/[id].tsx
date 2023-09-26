import { useAuth } from '@auth/context/auth-context';
import ErrorComponent from '@c/error-component/error-component';
import UserListItem from '@c/user-list-item/user-list-item';
import { useGetFriendsByUserIdQuery } from '@r/runnich-api/runnich-api';
import useRefresh from '@u/hooks/use-refresh';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

export default function ListOfFollowing() {
  const { id: userId } = useLocalSearchParams();
  const { user } = useAuth();
  const whoIsViewing = userId === 'undefined' ? user.id : userId.toString();
  const { isLoading, error, data: users, refetch } = useGetFriendsByUserIdQuery(whoIsViewing);
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
