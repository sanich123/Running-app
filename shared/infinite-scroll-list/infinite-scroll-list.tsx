import { useCallback, useEffect, useRef } from 'react';
import { FlatList, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import UnsendedActivitiesIndicator from '@S/infinite-scroll-list/unsended-activities/unsended-activities-indicator/unsended-activities-indicator';
import WeekStatistics from '@S/infinite-scroll-list/week-statistics/week-statistics';
import useRefresh from '@U/hooks/use-refresh';
import { PREFETCH_REMAINING_ITEMS, VIEWABILITY_CONFIG } from './const';
import { keyExtractor, renderCardsFunction } from './utils';
import type { InfiniteScrollListProps } from './type';
import type { ViewToken } from './types';

export default function InfiniteScrollList({
  dataToRender,
  refetch,
  isLastPage,
  nextPageCallback,
  isFetchingNextPage,
  headerAfterWeekStatistics,
}: InfiniteScrollListProps) {
  const { onRefresh, refreshing } = useRefresh(refetch);
  const { unsyncedActivities } = useAppSelector(({ activity }) => activity);
  const requestInFlight = useRef(false);
  const dataLength = useRef(dataToRender.length);
  useEffect(() => {
    dataLength.current = dataToRender.length;
  }, [dataToRender.length]);

  const loadNextPage = useCallback(async () => {
    if (isLastPage || isFetchingNextPage || requestInFlight.current) return;

    requestInFlight.current = true;
    try {
      await nextPageCallback();
    } finally {
      requestInFlight.current = false;
    }
  }, [isFetchingNextPage, isLastPage, nextPageCallback]);

  const loadNextPageRef = useRef(loadNextPage);
  useEffect(() => {
    loadNextPageRef.current = loadNextPage;
  }, [loadNextPage]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const lastVisibleIndex = viewableItems.reduce((maxIndex, item) => Math.max(maxIndex, item.index ?? -1), -1);
      const remainingItems = dataLength.current - lastVisibleIndex - 1;

      if (lastVisibleIndex >= 0 && remainingItems <= PREFETCH_REMAINING_ITEMS) {
        void loadNextPageRef.current();
      }
    },
    [],
  );

  return (
    <FlatList
      testID="infinite-scroll-list"
      onRefresh={onRefresh}
      data={dataToRender}
      refreshing={refreshing}
      keyExtractor={keyExtractor}
      renderItem={renderCardsFunction}
      initialNumToRender={5}
      maxToRenderPerBatch={20}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={Platform.OS === 'android'}
      viewabilityConfig={VIEWABILITY_CONFIG}
      onViewableItemsChanged={onViewableItemsChanged}
      onEndReachedThreshold={0.8}
      onEndReached={loadNextPage}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" /> : undefined}
      ListHeaderComponent={() => (
        <>
          {unsyncedActivities?.length ? <UnsendedActivitiesIndicator /> : null}
          {dataToRender?.length ? <WeekStatistics /> : null}
          {headerAfterWeekStatistics}
        </>
      )}
    />
  );
}
