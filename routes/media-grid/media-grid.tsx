import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, FlatList, Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import ErrorComponent from '@Routes/error-component/error-component';
import MediaGridImage from './image/image';
import type { PhotoVideoType } from '@Routes/card/types';

export default function MediaGrid() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { id: userId } = useLocalSearchParams();
  const [take, setTake] = useState(28);
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
            contentContainerStyle={[
              {
                backgroundColor: colors.background,
                width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
                marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
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
        ) : null
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    columnGap: 2,
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
