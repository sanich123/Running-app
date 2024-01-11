import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetFollowersByUserIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function ListOfFollowers() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, error, data: users, refetch } = useGetFollowersByUserIdQuery(`${userId}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView edges={['left', 'right']} style={[{ flex: 1 }, (isLoading || error) && styles.isInCenter]}>
      {users && (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item }) => <UserListItem userId={item.user_id} />}
          ListEmptyComponent={
            <View>
              <Text variant="headlineLarge">There are no followers</Text>
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

const styles = StyleSheet.create({
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
