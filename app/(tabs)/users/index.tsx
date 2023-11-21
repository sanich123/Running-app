import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import ErrorComponent from '../../../components/error-component/error-component';
import UserListItem from '../../../components/user-list-item/user-list-item';
import { useGetUsersQuery } from '../../../redux/runich-api/runich-api';
import useRefresh from '../../../utils/hooks/use-refresh';

export default function ListOfUsers() {
  const { isLoading, isError, error, data: users, refetch } = useGetUsersQuery('');
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView style={[{ flex: 1 }, (isLoading || isError) && { alignItems: 'center', justifyContent: 'center' }]}>
      {users && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item }) => <UserListItem userId={item?.id} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no users</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider />}
        />
      )}
      {isLoading && <ActivityIndicator size="large" />}
      {isError ? <ErrorComponent error={error} /> : null}
    </SafeAreaView>
  );
}
