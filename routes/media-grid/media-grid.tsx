import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetAllActivityMediaByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import MediaGridImage from './image/image';
import type { ActivityMediaItem } from '@S/card/types';

export default function MediaGrid() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { id: userId } = useLocalSearchParams();
  const take = 28;
  const gridWidth = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const {
    isLoading,
    isSuccess,
    data: pages,
    error,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
  } = useGetAllActivityMediaByUserIdInfiniteQuery({ userId: `${userId}`, take }, { skip: !userId });
  const data = pages?.pages.at(-1);
  const media = pages?.pages.flatMap(({ media: pageMedia }) => pageMedia) ?? [];
  const gridItemHeight = (gridWidth - 9) / 4;

  const renderItem = useCallback(
    ({ item, index }: { item: ActivityMediaItem; index: number }) => (
      <MediaGridImage url={item.url} thumbnail={item.thumbnail} blurhash={item.blurhash} index={index} take={take} />
    ),
    [take],
  );
  const keyExtractor = useCallback((item: ActivityMediaItem) => item.url, []);
  const loadMore = useCallback(() => {
    if (!data?.hasMore || isFetching) {
      return;
    }
    void fetchNextPage();
  }, [data?.hasMore, fetchNextPage, isFetching]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="media-grid-loading" />
      ) : isSuccess ? (
        media.length ? (
          <FlatList
            testID="media-grid-list"
            style={[styles.list, { width: gridWidth }]}
            contentContainerStyle={[
              {
                backgroundColor: colors.background,
                width: '100%',
              },
              styles.layout,
              (isLoading || isError) && styles.isInCenter,
            ]}
            data={media}
            renderItem={renderItem}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={Platform.OS === 'android'}
            keyExtractor={keyExtractor}
            getItemLayout={(_, index) => ({
              length: gridItemHeight,
              offset: gridItemHeight * Math.floor(index / 4),
              index,
            })}
            onEndReachedThreshold={0.5}
            onEndReached={loadMore}
            ListFooterComponent={() => data?.hasMore && <ActivityIndicator size="large" />}
            numColumns={4}
            horizontal={false}
          />
        ) : (
          <EmptyState
            icon="image-multiple-outline"
            title={EMPTY_STATE_COPY[language].photos.title}
            message={EMPTY_STATE_COPY[language].photos.message}
          />
        )
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    alignSelf: 'center',
  },
  layout: {
    alignItems: 'flex-start',
    display: 'flex',
    columnGap: 2,
    justifyContent: 'flex-start',
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
