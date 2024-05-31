import { PhotoVideoType } from '@C/card/const ';
import ErrorComponent from '@C/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Platform, FlatList } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import MediaGridImage from './image/image';

export default function MediaGrid() {
  const { colors } = useTheme();
  const { id: userId } = useLocalSearchParams();
  const [page, setPage] = useState(0);
  const { isLoading, data, error, isError } = useGetAllActivityPhotosByUserIdQuery(
    { userId: `${userId}`, page, take: 24 },
    { skip: !userId },
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      {isLoading && <ActivityIndicator size="large" />}
      {isError ? <ErrorComponent error={error} /> : null}
      {data?.photos?.length && (
        <FlatList
          contentContainerStyle={[
            { backgroundColor: colors.background },
            styles.layout,
            (isLoading || isError) && styles.isInCenter,
          ]}
          data={data?.photos}
          renderItem={({ item: { url, thumbnail, blurhash }, index }) => (
            <MediaGridImage url={url} thumbnail={thumbnail} blurhash={blurhash} index={index} />
          )}
          initialNumToRender={24}
          maxToRenderPerBatch={24}
          // onEndReachedThreshold={Platform.OS === 'web' ? 0.8 : 0.5}
          onEndReached={() => {
            if (!data.isLastPage) {
              if (Platform.OS === 'web') {
                setTimeout(() => setPage?.(page + 1), 2000);
              } else {
                setPage?.(page + 1);
              }
            }
          }}
          keyExtractor={(arg: PhotoVideoType, index: number) => `image-${index}`}
          ListFooterComponent={() => !data.isLastPage && <ActivityIndicator size="large" />}
          numColumns={4}
          horizontal={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
