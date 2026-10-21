import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetFilteredUsersBySearchTextInfiniteQuery } from '@R/services/profile/profile';
import ErrorComponent from '@S/error-component/error-component';
import useDebounce from '@U/hooks/use-debounce';
import useRefresh from '@U/hooks/use-refresh';
import EmptyUsersList from '../empty-list/empty-users-list/empty-users-list';
import SearchInput from '../search-input/search-input';
import { renderDivider, renderUserItem, userKeyExtractor } from '../utils';

export default function ListOfUsers() {
  const { colors } = useTheme();
  const [isInitial, setIsInitial] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);
  const { width } = useWindowDimensions();
  const {
    isLoading,
    isError,
    isSuccess,
    error,
    data: userPages,
    refetch,
    fetchNextPage,
    isFetching,
  } = useGetFilteredUsersBySearchTextInfiniteQuery(debouncedSearch, { skip: !debouncedSearch });
  const users = useMemo(() => userPages?.pages.flatMap(({ items }) => items) ?? [], [userPages?.pages]);
  const lastPage = userPages?.pages.at(-1);
  const loadMore = useCallback(() => {
    if (lastPage?.hasMore && !isFetching) void fetchNextPage();
  }, [fetchNextPage, isFetching, lastPage?.hasMore]);
  const { refreshing, onRefresh } = useRefresh(refetch);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchInput setIsInitial={setIsInitial} setSearch={setSearch} search={search} />
      {isLoading ? (
        <View pointerEvents="none" style={styles.stateOverlay}>
          <ActivityIndicator size="large" testID="users-page-loading" />
        </View>
      ) : isInitial || isSuccess ? (
        <FlatList
          testID="usersList"
          keyboardShouldPersistTaps="handled"
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={users}
          renderItem={renderUserItem}
          keyExtractor={userKeyExtractor}
          style={{
            flex: 1,
            width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          }}
          ListEmptyComponent={<EmptyUsersList isInitial={isInitial} />}
          ItemSeparatorComponent={renderDivider}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={lastPage?.hasMore ? <ActivityIndicator size="small" /> : undefined}
        />
      ) : isError ? (
        <View style={styles.stateOverlay}>
          <ErrorComponent error={error} refetch={refetch} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, position: 'relative' },
  stateOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
