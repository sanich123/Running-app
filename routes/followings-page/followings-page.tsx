import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import ErrorComponent from '@Routes/error-component/error-component';
import UserListItem from '@Routes/user-list-item/user-list-item';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import useRefresh from '@U/hooks/use-refresh';

export default function ListOfFollowing() {
  const { width } = useWindowDimensions();
  const { id: userId } = useLocalSearchParams();
  const { isLoading, isSuccess, error, isError, data: users, refetch } = useGetYouFollowUsersByUserIdQuery(`${userId}`);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="followings-loading" />
      ) : isSuccess ? (
        <FlatList
          testID="followings-list"
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          style={[
            styles.list,
            {
              width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
              marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
            },
          ]}
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
          contentContainerStyle={{ flexGrow: 1 }}
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

const styles = StyleSheet.create({
  list: {
    alignSelf: 'stretch',
  },
});
