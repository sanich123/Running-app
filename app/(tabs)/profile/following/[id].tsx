import { useLocalSearchParams } from 'expo-router';
import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import { useAuth } from '../../../../auth/context/auth-context';
import ErrorComponent from '../../../../components/error-component/error-component';
import UserListItem from '../../../../components/user-list-item/user-list-item';
import { useGetFriendsByUserIdQuery } from '../../../../redux/runich-api/runich-api';
import useRefresh from '../../../../utils/hooks/use-refresh';

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
