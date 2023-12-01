import { getMapBoxImage } from '@U/location-utils';
import { LocationObject } from 'expo-location';
import { useRouter } from 'expo-router';
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
                push(zeroLocations || isNotFirst ? `/home/media/${encodeURIComponent(item)}` : `/home/map/${id}`);
              }
            }}>
            <Image testID={item} source={{ uri: item }} resizeMode="cover" height={200} width={width} />
          </Pressable>
        );
      }}
      horizontal
      initialNumToRender={2}
    />
  );
}
