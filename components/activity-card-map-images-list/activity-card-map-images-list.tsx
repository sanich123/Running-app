import { getMapBoxImage } from '@u/location-utils';
import { LocationObject } from 'expo-location';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Image, useWindowDimensions } from 'react-native';

export default function ActivityCardMapImagesList({
  locations,
  photoUrls,
  id,
}: {
  locations: LocationObject[];
  photoUrls: string[];
  id: string;
}) {
  const { width } = useWindowDimensions();
  const urls = photoUrls ? [getMapBoxImage(locations), ...photoUrls] : [getMapBoxImage(locations)];
  const router = useRouter();

  return (
    <FlatList
      data={urls}
      renderItem={({ item, index }) => {
        const isNotFirst = index > 0;
        return (
          <Pressable
            onPress={() => router.push(isNotFirst ? `/home/media/${encodeURIComponent(item)}` : `/home/map/${id}`)}>
            <Image source={{ uri: item }} resizeMode="cover" height={200} width={width} />
          </Pressable>
        );
      }}
      horizontal
      initialNumToRender={1}
    />
  );
}
