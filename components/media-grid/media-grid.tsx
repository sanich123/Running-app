import { PhotoVideoType } from '@C/card/const ';
import ErrorComponent from '@C/error-component/error-component';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Button, useTheme, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import MediaGridImage from './image/image';

export default function MediaGrid() {
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
            { backgroundColor: colors.background },
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
          ListFooterComponent={() =>
            !data?.isLastPage && (
              <Button
                icon="reload"
                onPress={() => setTake(take + 28)}
                mode="outlined"
                style={{ borderRadius: 0, marginLeft: 5, marginRight: 5 }}
                loading={isLoading}
                disabled={isLoading || isError}>
                <Text variant="bodyMedium">Загрузить еще фотки</Text>
              </Button>
            )
          }
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
