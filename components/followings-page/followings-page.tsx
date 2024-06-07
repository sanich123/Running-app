import ErrorComponent from '@C/error-component/error-component';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetYouFollowUsersByUserIdQuery } from '@R/runich-api/runich-api';
import useRefresh from '@U/hooks/use-refresh';
import { useLocalSearchParams } from 'expo-router';
import { View, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListOfFollowing() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, error, isError, data: users, refetch } = useGetYouFollowUsersByUserIdQuery(`${userId}`);
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
            renderItem={({ item }) => (
              <UserListItem
                city={item.profile?.city}
                name={item.profile?.name}
                surname={item.profile?.surname}
                profilePhoto={item.profile?.profilePhoto}
                placeholder={item.profile?.profilePhotoBlurhash}
                user_id={item?.friendId}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineLarge">Nobody is following you</Text>
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
