import { CustomImage } from '@C/custom-image/custom-image';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { memo, useEffect, useState } from 'react';
import { FlatList, Platform, Pressable, useWindowDimensions } from 'react-native';

type CardMapImagesListProps = {
  photoUrls: string[];
  id: string;
};

export default memo(function CardMapImagesList({ photoUrls, id }: CardMapImagesListProps) {
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const [photoUrlsWithThumbnails, setPhotoUrlsWithThumbnails] = useState<{ url: string; thumbnail: string | null }[]>(
    [],
  );

  async function addThumbnailsToVideo(
    photoUrls: string[],
    setPhotoUrlsWithThumbnails: (arg: { url: string; thumbnail: string | null }[]) => void,
  ) {
    let modifiedUrls;
    if (Platform.OS !== 'web') {
      modifiedUrls = await Promise.all(
        photoUrls.map(async (url) => {
          if (url.includes('mp4')) {
            const { uri } = await VideoThumbnails.getThumbnailAsync(url);
            return { url, thumbnail: uri };
          }
          return { url, thumbnail: null };
        }),
      );
    } else {
      modifiedUrls = photoUrls.map((url) => ({ url, thumbnail: null }));
    }
    setPhotoUrlsWithThumbnails(modifiedUrls);
  }

  useEffect(() => {
    addThumbnailsToVideo(photoUrls, setPhotoUrlsWithThumbnails);
  }, [photoUrls]);

  return (
    <FlatList
      data={photoUrlsWithThumbnails}
      renderItem={({ item }) => {
        return (
          <Pressable
            onPress={() => {
              if (item) {
                push(
                  item.url.includes('api.mapbox.com')
                    ? `/${place}/${ROUTES.map}/${id}`
                    : `/${place}/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}`,
                );
              }
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <CustomImage
              style={{ width, height: 200 }}
              source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
              contentFit="cover"
              testID={item.url}
            />
          </Pressable>
        );
      }}
      horizontal
      initialNumToRender={2}
    />
  );
});
