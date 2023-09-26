import ErrorComponent from '@c/error-component/error-component';
import UserListItem from '@c/user-list-item/user-list-item';
import { useGetUsersQuery } from '@r/runnich-api/runnich-api';
import useRefresh from '@u/hooks/use-refresh';
import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

export default function ListOfUsers() {
  const { isLoading, error, data: users, refetch } = useGetUsersQuery('');
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {users && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item }) => <UserListItem userId={item.id} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no users, fuck</Text>
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
