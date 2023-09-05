import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import ErrorComponent from '../../../components/error-component/error-component';
import UserListItem from '../../../components/user-list-item/user-list-item';
import { useGetUsersQuery } from '../../../redux/runnich-api/runnich-api';

export default function ListOfUsers() {
  const { isLoading, error, data: users } = useGetUsersQuery('');
  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {users && (
        <FlatList
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
