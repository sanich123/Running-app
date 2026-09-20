import { useCallback, useRef, useState, memo, useMemo } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { Card, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import UserInfo from '@S/card/user-info/user-info';
import Btns from './btns/btns';
import { LikesSize } from './likes/const';
import Likes from './likes/likes';
import MediaList from './media-list/media-list';
import Metrics from './metrics/metrics';
import ShareActivityImage from './share-activity-image/share-activity-image';
import { UserInfoSize } from './user-info/const';
import { getCardMapPhotoUrl } from './utils';
import type { ActivityCardProps } from './types';

export default memo(function ActivityCard({ ...rest }: ActivityCardProps) {
  const {
    description,
    title,
    date,
    sport,
    id,
    userId,
    photoVideoUrls,
    duration,
    distance,
    elevationGain,
    steps,
    emotion,
    isShowDescription,
    isShowDeleteBtn,
    mapPhotoUrl,
    mapPhotoUrlBlurhash,
    locationName,
    weatherTemperature,
    weatherWindSpeed,
    weatherCode,
    profile,
    commentsLength,
    likesLength,
    isFullView,
  } = rest;
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);
  const shareImageReadyRef = useRef<(() => void) | null>(null);
  const [isShareImageVisible, setIsShareImageVisible] = useState(false);
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;
  const cardMapPhotoUrl = useMemo(() => getCardMapPhotoUrl(mapPhotoUrl, mediaWidth), [mapPhotoUrl, mediaWidth]);

  const resolvedMapPhotoUrl = cardMapPhotoUrl;
  const likesSize = pathname.includes(ROUTES.activity) ? LikesSize.big : LikesSize.small;
  const prepareShareImage = useCallback(
    () =>
      new Promise<void>((resolve) => {
        shareImageReadyRef.current = resolve;
        setIsShareImageVisible(true);
      }),
    [],
  );
  const handleShareImageReady = useCallback(() => {
    shareImageReadyRef.current?.();
    shareImageReadyRef.current = null;
  }, []);
  const cleanupShareImage = useCallback(() => {
    setIsShareImageVisible(false);
  }, []);

  return (
    <>
      {isShareImageVisible && (
        <ShareActivityImage
          title={title}
          date={date}
          duration={duration}
          distance={distance}
          sport={sport}
          elevationGain={elevationGain}
          steps={steps}
          emotion={emotion}
          cardRef={cardRef}
          mapPhotoUrl={resolvedMapPhotoUrl}
          profile={profile}
          locationName={locationName}
          weatherTemperature={weatherTemperature}
          weatherWindSpeed={weatherWindSpeed}
          weatherCode={weatherCode}
          onReady={handleShareImageReady}
        />
      )}
      <View
        style={[
          {
            ...styles.cardStyles,
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            borderWidth: 1,
            zIndex: 10,
            width: mediaWidth,
            marginBottom: isFullView ? 0 : 16,
          },
          Platform.OS === 'web' && styles.webStyles,
        ]}>
        <UserInfo
          profile={profile}
          sport={sport}
          date={date}
          emotion={emotion}
          userId={userId}
          size={UserInfoSize.large}
        />
        {(resolvedMapPhotoUrl || Boolean(photoVideoUrls?.length)) && (
          <MediaList
            photoVideoUrls={photoVideoUrls ?? []}
            mapPhotoUrl={resolvedMapPhotoUrl}
            mapPhotoUrlBlurhash={mapPhotoUrlBlurhash}
            locationName={locationName}
            weatherTemperature={weatherTemperature}
            weatherWindSpeed={weatherWindSpeed}
            weatherCode={weatherCode}
            id={id}
          />
        )}
        <Metrics
          distance={distance}
          duration={duration}
          title={title}
          isShowDescription={isShowDescription}
          description={description}
          userId={userId}
          id={id}
          sport={sport}
          steps={steps}
          elevationGain={elevationGain}
          isFullView={isFullView}
        />
        <View style={{ height: 40, paddingHorizontal: 8 }}>
          <Likes activityId={id} size={likesSize} likesLength={likesLength} />
        </View>
        <Card.Actions style={styles.actions}>
          <Btns
            activityId={id}
            userId={userId}
            cardRef={cardRef}
            isShowDeleteBtn={isShowDeleteBtn}
            commentsLength={commentsLength}
            likesLength={likesLength}
            profile={profile}
            mapPhotoUrl={resolvedMapPhotoUrl}
            prepareShareImage={prepareShareImage}
            cleanupShareImage={cleanupShareImage}
          />
        </Card.Actions>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  webStyles: {
    maxWidth: 550,
    marginHorizontal: 'auto',
  },
  cardStyles: {
    borderCurve: 'continuous',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 'auto',
    overflow: 'hidden',
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  actions: {
    marginTop: -6,
    paddingTop: 0,
  },
});
