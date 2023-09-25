import { useLocalSearchParams } from 'expo-router';
import { View, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import { useAuth } from '../../../../auth/context/auth-context';
import ErrorComponent from '../../../../components/error-component/error-component';
import UserListItem from '../../../../components/user-list-item/user-list-item';
import { useGetFollowersByUserIdQuery } from '../../../../redux/runnich-api/runnich-api';
import useRefresh from '../../../../utils/hooks/use-refresh';

export default function ListOfFollowers() {
  const { user } = useAuth();
  const { id: userId } = useLocalSearchParams();
  const whoIsViewing = userId === 'undefined' ? user.id : userId.toString();
  const { isLoading, error, data: users, refetch } = useGetFollowersByUserIdQuery(whoIsViewing);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {users && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item }) => <UserListItem userId={item.userId} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no followers, fuck </Text>
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
