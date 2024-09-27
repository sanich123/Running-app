import { CustomImage } from '@C/custom-image/custom-image';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { memo } from 'react';
import { FlatList, Platform, useWindowDimensions } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MediaListProps } from '../types';

export default memo(function MediaList({ photoVideoUrls, mapPhotoUrl, id, mapPhotoUrlBlurhash }: MediaListProps) {
  const { dark } = useTheme();
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
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
                ? `/${place}/${ROUTES.map}/${id}`
                : `/${place}/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}?indexOfPhoto=${index}`,
            );
          }}
          borderless>
          <CustomImage
            style={{ width: width || 350, height: 200 }}
            source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
            contentFit="cover"
            testID={item.url}
            placeholder={item?.blurhash}
          />
        </TouchableRipple>
      )}
      style={{ overflow: !photoVideoUrls?.length ? 'hidden' : 'scroll' }}
      horizontal
      initialNumToRender={1}
    />
  );
});
