import useRefresh from '@U/hooks/use-refresh';
import { FlatList } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { keyExtractor, renderCardsFunction } from './render-item';
import { InfiniteScrollListProps } from './type';
import WeekStatistics from '@C/statistic/week-statistics/week-statistics';

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
