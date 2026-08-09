import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, FlatList, Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import MediaGridImage from './image/image';
import type { PhotoVideoType } from '@S/card/types';

export default function MediaGrid() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { id: userId } = useLocalSearchParams();
  const [take, setTake] = useState(28);
  const gridWidth = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const { isLoading, isSuccess, data, error, isError, refetch } = useGetAllActivityPhotosByUserIdQuery(
    { userId: `${userId}`, take },
    { skip: !userId },
  );

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="media-grid-loading" />
      ) : isSuccess ? (
        data?.photos?.length ? (
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
            data={data?.photos}
            renderItem={({ item: { url, thumbnail, blurhash }, index }) => (
              <MediaGridImage url={url} thumbnail={thumbnail} blurhash={blurhash} index={index} take={take} />
            )}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            keyExtractor={(arg: PhotoVideoType, index: number) => `image-${index}`}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (!data?.isLastPage) {
                if (Platform.OS === 'web') {
                  setTimeout(() => setTake(take + 28), 2000);
                } else {
                  setTake(take + 28);
                }
              }
            }}
            ListFooterComponent={() => !data?.isLastPage && <ActivityIndicator size="large" />}
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
