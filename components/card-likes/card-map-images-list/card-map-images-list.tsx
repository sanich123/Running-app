import { PhotoVideoType } from '@C/card/const ';
import { CustomImage } from '@C/custom-image/custom-image';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { memo } from 'react';
import { FlatList, Platform, Pressable, useWindowDimensions } from 'react-native';

type CardMapImagesListProps = {
  photoVideoUrls: PhotoVideoUrls;
  mapPhotoUrl?: string;
  mapPhotoUrlBlurhash?: string;
  id: string;
};
export type PhotoVideoUrls = PhotoVideoType[];

export default memo(function CardMapImagesList({
  photoVideoUrls,
  mapPhotoUrl,
  id,
  mapPhotoUrlBlurhash,
}: CardMapImagesListProps) {
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

  return (
    <FlatList
      data={
        mapPhotoUrl
          ? [{ url: mapPhotoUrl, thumbnail: null, blurhash: mapPhotoUrlBlurhash }, ...photoVideoUrls]
          : photoVideoUrls
      }
      renderItem={({ item, index }) => {
        return (
          <Pressable
            onPress={() => {
              if (item) {
                push(
                  item.url.includes('api.mapbox.com')
                    ? `/${place}/${ROUTES.map}/${id}`
                    : `/${place}/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}?indexOfPhoto=${index}`,
                );
              }
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <CustomImage
              style={{ width, height: 200 }}
              source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
              contentFit="cover"
              testID={item.url}
              placeholder={item?.blurhash}
            />
          </Pressable>
        );
      }}
      style={{ overflow: !photoVideoUrls.length ? 'hidden' : 'scroll' }}
      horizontal
      initialNumToRender={1}
    />
  );
});
