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
                user_id={profile?.user_id}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineLarge">There are no users</Text>
              </View>
            }
            ItemSeparatorComponent={() => <Divider />}
            initialNumToRender={15}
          />
        )}
        {isLoading && <ActivityIndicator size="large" />}
        {isError ? <ErrorComponent error={error} /> : null}
      </View>
    </SafeAreaView>
  );
}
