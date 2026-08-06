import { memo } from 'react';
import { FlatList, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { CustomImage } from '@Routes/custom-image/custom-image';
import type { MediaListProps } from '../types';

export default memo(function MediaList({ photoVideoUrls, mapPhotoUrl, id, mapPhotoUrlBlurhash }: MediaListProps) {
  const { dark } = useTheme();
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;

  const displayedData = mapPhotoUrl
    ? [{ url: mapPhotoUrl, thumbnail: null, blurhash: mapPhotoUrlBlurhash }, ...(photoVideoUrls ? photoVideoUrls : [])]
    : photoVideoUrls;

  return (
    <FlatList
      data={displayedData}
      renderItem={({ item, index }) => (
        <TouchableRipple
          rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
          onPress={() => {
            push(
              item.url.includes('api.mapbox.com')
                ? `/(protected)/map/${id}`
                : `/(protected)/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}?indexOfPhoto=${index}`,
            );
          }}
          borderless>
          <CustomImage
            style={{ width: mediaWidth, height: 202 }}
            source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
            contentFit="cover"
            testID={item.url}
            placeholder={item?.blurhash}
          />
        </TouchableRipple>
      )}
      horizontal
      initialNumToRender={1}
    />
  );
});
