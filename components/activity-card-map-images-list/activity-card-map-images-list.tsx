import { LocationObject } from 'expo-location';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Image, useWindowDimensions } from 'react-native';

import { getMapBoxImage } from '../../utils/location-utils';

export default function ActivityCardMapImagesList({
  locations,
  photoUrl,
  id,
}: {
  locations: LocationObject[];
  photoUrl: string;
  id: string;
}) {
  const { width } = useWindowDimensions();
  const urls = photoUrl ? [getMapBoxImage(locations), photoUrl] : [getMapBoxImage(locations)];
  const router = useRouter();
  return (
    <FlatList
      data={urls}
      renderItem={({ item, index }) => (
        <Pressable onPress={() => router.push(`/home/${index > 0 ? 'media' : 'map'}/${id}`)}>
          <Image source={{ uri: item }} resizeMode="cover" height={200} width={width} />
        </Pressable>
      )}
      horizontal
      initialNumToRender={1}
    />
  );
}
