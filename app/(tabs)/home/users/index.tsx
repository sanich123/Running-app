import ErrorComponent from '@C/error-component/error-component';
import UserListItemSimple from '@C/user-list-item-simple/user-list-item-simple';
import { useGetUsersQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListOfUsers() {
  const { isLoading, isError, error, data: users, refetch } = useGetUsersQuery('');
  const { refreshing, onRefresh } = useRefresh(refetch);
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[{ flex: 1 }, (isLoading || isError) && { alignItems: 'center', justifyContent: 'center' }]}>
      {users && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item: { city, name, surname, profilePhoto, user_id } }) => (
            <UserListItemSimple
              city={city}
              name={name}
              surname={surname}
              profilePhoto={profilePhoto}
              user_id={user_id}
            />
          )}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no users</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider />}
          initialNumToRender={15}
        />
      )}
      {isLoading && <ActivityIndicator size="large" />}
      {isError ? <ErrorComponent error={error} /> : null}
    </SafeAreaView>
  );
}
