import { memo, useCallback, useMemo } from 'react';
import { FlatList, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { CustomImage } from '@S/custom-image/custom-image';
import { ACTIVITY_MEDIA_HEIGHT } from './const';
import type { MediaListProps } from '../types';

export default memo(function MediaList({ photoVideoUrls, mapPhotoUrl, id, mapPhotoUrlBlurhash }: MediaListProps) {
  const { dark } = useTheme();
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;

  const displayedData = useMemo(() => {
    const media = photoVideoUrls ?? [];
    return mapPhotoUrl ? [{ url: mapPhotoUrl, thumbnail: null, blurhash: mapPhotoUrlBlurhash }, ...media] : media;
  }, [mapPhotoUrl, mapPhotoUrlBlurhash, photoVideoUrls]);
  const renderItem = useCallback(
    ({ item, index }: { item: (typeof displayedData)[number]; index: number }) => (
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        onPress={() => {
          push(
            item.url.includes('api.mapbox.com')
              ? `/${ROUTES.map}/${id}`
              : `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}?indexOfPhoto=${index}`,
          );
        }}
        borderless>
        <CustomImage
          style={{ width: mediaWidth, height: ACTIVITY_MEDIA_HEIGHT }}
          source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
          contentFit={item.url.includes('api.mapbox.com') ? 'contain' : 'cover'}
          testID={item.url}
          placeholder={item?.blurhash}
        />
      </TouchableRipple>
    ),
    [dark, id, mediaWidth, push],
  );

  return (
    <FlatList
      data={displayedData}
      renderItem={renderItem}
      horizontal
      initialNumToRender={1}
      maxToRenderPerBatch={3}
      windowSize={3}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={Platform.OS === 'android'}
      keyExtractor={(item) => item.url}
      getItemLayout={(_, index) => ({ length: mediaWidth, offset: mediaWidth * index, index })}
    />
  );
});
