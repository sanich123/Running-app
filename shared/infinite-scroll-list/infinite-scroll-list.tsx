import { FlatList, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import UnsendedActivitiesIndicator from '@S/infinite-scroll-list/unsended-activities/unsended-activities-indicator';
import WeekStatistics from '@S/infinite-scroll-list/week-statistics/week-statistics';
import useRefresh from '@U/hooks/use-refresh';
import { keyExtractor, renderCardsFunction } from './utils';
import type { InfiniteScrollListProps } from './type';

export default function InfiniteScrollList({
  dataToRender,
  refetch,
  isLastPage,
  nextPageCallback,
  isFetching,
}: InfiniteScrollListProps) {
  const { onRefresh, refreshing } = useRefresh(refetch);
  const { unsyncedActivities } = useAppSelector(({ activity }) => activity);
  return (
    <FlatList
      testID="infinite-scroll-list"
      onRefresh={onRefresh}
      data={dataToRender}
      refreshing={refreshing}
      keyExtractor={keyExtractor}
      renderItem={renderCardsFunction}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={7}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={Platform.OS === 'android'}
      onEndReachedThreshold={0.5}
      onEndReached={async () => {
        if (!isLastPage && !isFetching) {
          await nextPageCallback();
        }
      }}
      ListFooterComponent={() => !isLastPage && dataToRender.length > 9 && <ActivityIndicator size="large" />}
      ListHeaderComponent={() =>
        unsyncedActivities?.length ? <UnsendedActivitiesIndicator /> : dataToRender?.length ? <WeekStatistics /> : null
      }
    />
  );
}
