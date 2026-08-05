import { View, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import UserListItem from '@C/user-list-item/user-list-item';
import { useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import useRefresh from '@U/hooks/use-refresh';

export default function ListOfFollowing() {
  const { id: userId } = useLocalSearchParams();
  const { isLoading, isSuccess, error, isError, data: users, refetch } = useGetYouFollowUsersByUserIdQuery(`${userId}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : isSuccess ? (
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
          contentContainerStyle={{ flex: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text variant="headlineMedium">Nobody is following you</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider />}
        />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
