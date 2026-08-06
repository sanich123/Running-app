import { View, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { useGetFollowersByUserIdQuery } from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@Routes/error-component/error-component';
import UserListItem from '@Routes/user-list-item/user-list-item';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import useRefresh from '@U/hooks/use-refresh';

export default function ListOfFollowers() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { id: friendId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    data: users,
    refetch,
  } = useGetFollowersByUserIdQuery(friendId ? `${friendId}` : userId);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="followers-loading" />
      ) : isSuccess ? (
        <FlatList
          testID="followers-list"
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={({ item }) => (
            <UserListItem
              city={item.users.profile?.city}
              name={item.users.profile?.name}
              surname={item.users.profile?.surname}
              profilePhoto={item.users.profile?.profilePhoto}
              placeholder={item.users.profile?.profilePhotoBlurhash}
              user_id={item.user_id}
            />
          )}
          contentContainerStyle={{ flex: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text variant="headlineLarge">There are no followers</Text>
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
