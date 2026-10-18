import { FlatList, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import useRefresh from '@U/hooks/use-refresh';
import { followingKeyExtractor, renderDivider, renderFollowingItem } from '../utils';

export default function ListOfFollowing() {
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
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
          renderItem={renderFollowingItem}
          keyExtractor={followingKeyExtractor}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState
              icon="account-arrow-right-outline"
              title={EMPTY_STATE_COPY[language].followings.title}
              message={EMPTY_STATE_COPY[language].followings.message}
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
