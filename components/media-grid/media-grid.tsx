import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, FlatList, Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import MediaGridImage from './image/image';
import type { PhotoVideoType } from '@C/card/types';

export default function MediaGrid() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { id: userId } = useLocalSearchParams();
  const [take, setTake] = useState(28);
  const { isLoading, data, error, isError } = useGetAllActivityPhotosByUserIdQuery(
    { userId: `${userId}`, take },
    { skip: !userId },
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      {isLoading && <ActivityIndicator size="large" />}
      {isError ? <ErrorComponent error={error} /> : null}
      {data?.photos?.length && (
        <FlatList
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
      )}
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
