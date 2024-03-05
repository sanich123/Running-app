import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetFollowersByUserIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useAuth } from 'auth/context/auth-context';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListOfFollowers() {
  const { user } = useAuth();
  const { isLoading, error, isError, data: users, refetch } = useGetFollowersByUserIdQuery(`${user?.id}`);
  const { refreshing, onRefresh } = useRefresh(refetch);
  console.log('followers', users);

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
            renderItem={({ item }) => <UserListItem userId={item.user_id} />}
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
