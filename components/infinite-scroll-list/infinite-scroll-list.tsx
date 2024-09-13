import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import useRefresh from '@U/hooks/use-refresh';
import { FlatList, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { keyExtractor, renderCardsFunction } from './render-item';
import { InfiniteScrollListProps } from './type';
import WeekStatistics from '@C/statistic/week-statistics/week-statistics';

export default function InfiniteScrollList({
  dataToRender,
  setPage,
  page,
  refetch,
  isLastPage,
}: InfiniteScrollListProps) {
  const { onRefresh, refreshing } = useRefresh(refetch);

  return (
    <FlatList
      onRefresh={onRefresh}
      data={dataToRender}
      refreshing={refreshing}
      keyExtractor={keyExtractor}
      renderItem={renderCardsFunction}
      ListEmptyComponent={<EmptyActivitiesList />}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      onEndReachedThreshold={Platform.OS === 'web' ? 0.8 : 0.5}
      onEndReached={() => {
        if (!isLastPage) {
          if (Platform.OS === 'web') {
            setTimeout(() => setPage?.(page + 1), 2000);
          } else {
            setPage?.(page + 1);
          }
        }
      }}
      ListFooterComponent={() => !isLastPage && <ActivityIndicator size="large" />}
      ListHeaderComponent={() => <WeekStatistics />}
    />
  );
}
