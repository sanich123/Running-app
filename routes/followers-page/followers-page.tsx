import { FlatList, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetFollowersByUserIdQuery } from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import UserListItem from '@S/user-list-item/user-list-item';
import useRefresh from '@U/hooks/use-refresh';

const renderFollowerItem = ({ item }: { item: any }) => (
  <UserListItem
    city={item.users.profile?.city}
    name={item.users.profile?.name}
    surname={item.users.profile?.surname}
    profilePhoto={item.users.profile?.profilePhoto}
    placeholder={item.users.profile?.profilePhotoBlurhash}
    user_id={item.user_id}
  />
);

const followerKeyExtractor = (item: any) => item.id || item.user_id;
const renderDivider = () => <Divider />;

export default function ListOfFollowers() {
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ language }) => language);
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
          style={[
            styles.list,
            {
              width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
              marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
            },
          ]}
          renderItem={renderFollowerItem}
          keyExtractor={followerKeyExtractor}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState
              icon="account-group-outline"
              title={EMPTY_STATE_COPY[language].followers.title}
              message={EMPTY_STATE_COPY[language].followers.message}
            />
          }
          ItemSeparatorComponent={renderDivider}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
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
