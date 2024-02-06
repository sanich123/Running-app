import { ROUTES } from '@const/enums';
import { Image as ExpoImage } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { memo } from 'react';
import { FlatList, Pressable, useWindowDimensions } from 'react-native';

type CardMapImagesListProps = {
  photoUrls: string[];
  id: string;
};

export default memo(function CardMapImagesList({ photoUrls, id }: CardMapImagesListProps) {
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  return (
    <FlatList
      data={photoUrls}
      renderItem={({ item }) => {
        return (
          <Pressable
            onPress={() => {
              if (item) {
                push(
                  item.includes('api.mapbox.com')
                    ? `/${place}/${ROUTES.map}/${id}`
                    : `/${place}/${ROUTES.media}/${encodeURIComponent(item)}`,
                );
              }
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <ExpoImage testID={item} style={{ width, height: 200 }} source={{ uri: item }} contentFit="cover" />
            {/* <Image width={width} height={200} source={{ uri: item }} testID={item} /> */}
          </Pressable>
        );
      }}
      horizontal
      initialNumToRender={2}
    />
  );
});
