import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import AddActivityMediaBtn from '@S/card/add-media-btn/add-media-btn';
import CustomImage from '@S/custom-image/custom-image';
import { useActivityCard } from '../context';
import { ACTIVITY_MEDIA_ASPECT_RATIO } from './const';
import MapMetaOverlay from '../map-meta-overlay/map-meta-overlay';
import RouteReplayBtn from '../route-replay-btn/route-replay-btn';
import type { ActivityMediaItem } from '../types';

type DisplayedMediaItem = ActivityMediaItem & { isMap?: boolean };

export default memo(function MediaList() {
  const { activity } = useActivityCard();
  const {
    media,
    mapPhotoUrl,
    userId: activityOwnerId,
    id,
    mapPhotoUrlBlurhash,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    emotion,
  } = activity;
  const [isMapPressed, setIsMapPressed] = useState(false);
  const { dark } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;
  const isOwnActivity = Boolean(activityOwnerId && activityOwnerId === currentUserId);

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
        <View
          style={{ width: mediaWidth, aspectRatio: ACTIVITY_MEDIA_ASPECT_RATIO, position: 'relative' }}
          testID={isMap ? 'activity-map-media-item' : undefined}>
          <TouchableRipple
            rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, ${isMap ? '.2' : '.08'})`}
            onPressIn={() => {
              if (isMap) setIsMapPressed(true);
            }}
            onPressOut={() => {
              if (isMap) setIsMapPressed(false);
            }}
            onPress={() => {
              push(
                isMap
                  ? `/${ROUTES.map}/${id}`
                  : `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(item.url) : id}?indexOfPhoto=${index}`,
              );
            }}
            borderless={false}
            accessibilityRole="button"
            accessibilityLabel={
              isMap
                ? language === LANGUAGES.russian
                  ? 'Открыть карту тренировки'
                  : 'Open activity map'
                : language === LANGUAGES.russian
                  ? 'Открыть фото тренировки'
                  : 'Open activity photo'
            }>
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
            <>
              {isMapPressed ? (
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    styles.mapPressOverlay,
                    { backgroundColor: dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' },
                  ]}
                  testID="activity-map-press-overlay"
                />
              ) : null}
              <MapMetaOverlay
                locationName={locationName}
                weatherTemperature={weatherTemperature}
                weatherWindSpeed={weatherWindSpeed}
                weatherCode={weatherCode}
                emotion={emotion}
              />
              <View pointerEvents="box-none" style={styles.mapActions}>
                {isOwnActivity ? <AddActivityMediaBtn activityId={id} media={media ?? []} /> : null}
                <RouteReplayBtn activityId={id} userId={activityOwnerId} />
              </View>
            </>
          ) : null}
        </View>
      );
    },
    [
      dark,
      emotion,
      id,
      activityOwnerId,
      isMapPressed,
      isOwnActivity,
      language,
      locationName,
      media,
      mediaWidth,
      push,
      weatherCode,
      weatherTemperature,
      weatherWindSpeed,
    ],
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

const styles = StyleSheet.create({
  mapActions: {
    alignItems: 'center',
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    position: 'absolute',
    right: 8,
    zIndex: 3,
  },
  mapPressOverlay: {
    zIndex: 1,
  },
});
