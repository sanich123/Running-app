import { memo, useCallback, useMemo } from 'react';
import { FlatList, Platform, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import CustomImage from '@S/custom-image/custom-image';
import { ACTIVITY_MEDIA_ASPECT_RATIO } from './const';
import MapMetaOverlay from '../map-meta-overlay/map-meta-overlay';
import type { ActivityMediaItem, MediaListProps } from '../types';

type DisplayedMediaItem = ActivityMediaItem & { isMap?: boolean };

export default memo(function MediaList({
  media,
  mapPhotoUrl,
  id,
  mapPhotoUrlBlurhash,
  locationName,
  weatherTemperature,
  weatherWindSpeed,
  weatherCode,
  emotion,
}: MediaListProps) {
  const { dark } = useTheme();
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;

  const displayedData = useMemo(() => {
    const activityMedia: DisplayedMediaItem[] = (media ?? []).map((item) => ({ ...item, isMap: false }));
    return mapPhotoUrl
      ? [{ url: mapPhotoUrl, thumbnail: null, blurhash: mapPhotoUrlBlurhash, isMap: true }, ...activityMedia]
      : activityMedia;
  }, [mapPhotoUrl, mapPhotoUrlBlurhash, media]);
  const renderItem = useCallback(
    ({ item, index }: { item: (typeof displayedData)[number]; index: number }) => {
      const isMap = item.isMap === true;
      return (
        <View style={{ width: mediaWidth, aspectRatio: ACTIVITY_MEDIA_ASPECT_RATIO }}>
          <TouchableRipple
            rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
            onPress={() => {
              push(
                isMap
                  ? `/${ROUTES.map}/${id}`
                  : `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}?indexOfPhoto=${index}`,
              );
            }}
            borderless>
            <CustomImage
              style={{ width: mediaWidth, aspectRatio: ACTIVITY_MEDIA_ASPECT_RATIO }}
              source={{ uri: item.thumbnail ? item.thumbnail : item.url }}
              contentFit="cover"
              placeholderContentFit="cover"
              priority={index === 0 ? 'high' : 'normal'}
              cachePolicy="memory-disk"
              recyclingKey={item.url}
              testID={item.url}
              placeholder={item?.blurhash}
            />
          </TouchableRipple>
          {isMap ? (
            <MapMetaOverlay
              locationName={locationName}
              weatherTemperature={weatherTemperature}
              weatherWindSpeed={weatherWindSpeed}
              weatherCode={weatherCode}
              emotion={emotion}
            />
          ) : null}
        </View>
      );
    },
    [dark, emotion, id, locationName, mediaWidth, push, weatherCode, weatherTemperature, weatherWindSpeed],
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
