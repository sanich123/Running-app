import { FlatList } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import WeekStatistics from '@Routes/statistic/week-statistics/week-statistics';
import useRefresh from '@U/hooks/use-refresh';
import { keyExtractor, renderCardsFunction } from './render-item';
import type { InfiniteScrollListProps } from './type';

export default function InfiniteScrollList({
  dataToRender,
  refetch,
  isLastPage,
  nextPageCallback,
}: InfiniteScrollListProps) {
  const { onRefresh, refreshing } = useRefresh(refetch);

  return (
    <FlatList
      onRefresh={onRefresh}
      data={dataToRender}
      refreshing={refreshing}
      keyExtractor={keyExtractor}
      renderItem={renderCardsFunction}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (!isLastPage) {
          nextPageCallback();
        }
      }}
      ListFooterComponent={() => !isLastPage && dataToRender.length > 9 && <ActivityIndicator size="large" />}
      ListHeaderComponent={() => (dataToRender?.length ? <WeekStatistics /> : null)}
    />
  );
}
