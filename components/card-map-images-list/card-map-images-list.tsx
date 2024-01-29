import { getMapBoxImage } from '@U/location-utils';
import { ROUTES } from '@const/enums';
import { LocationObject } from 'expo-location';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Image, useWindowDimensions } from 'react-native';

type CardMapImagesListProps = {
  locations: LocationObject[];
  photoUrls: string[];
  id: string;
};

export default function CardMapImagesList({ locations, photoUrls, id }: CardMapImagesListProps) {
  const { width } = useWindowDimensions();
  const urls = locations?.length ? [getMapBoxImage(locations), ...photoUrls] : [...photoUrls];
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  return (
    <FlatList
      data={urls}
      renderItem={({ item, index }) => {
        const zeroLocations = locations?.length === 0;
        const isNotFirst = index > 0;
        return (
          <Pressable
            onPress={() => {
              if (item) {
                push(
                  zeroLocations || isNotFirst
                    ? `/${place}/${ROUTES.media}/${encodeURIComponent(item)}`
                    : `/${place}/${ROUTES.map}/${id}`,
                );
              }
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Image testID={item} source={{ uri: item }} resizeMode="cover" height={200} width={width} />
          </Pressable>
        );
      }}
      horizontal
      initialNumToRender={2}
    />
  );
}
