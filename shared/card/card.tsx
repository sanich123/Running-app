import { useRef, memo, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { usePathname } from 'expo-router';
import { Card, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { useGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import UserInfo from '@S/card/user-info/user-info';
import { getMapBoxImage } from '@U/location/location-utils';
import Btns from './btns/btns';
import { LikesSize } from './likes/const';
import Likes from './likes/likes';
import { ACTIVITY_MEDIA_HEIGHT } from './media-list/const';
import MediaList from './media-list/media-list';
import Metrics from './metrics/metrics';
import ShareActivityImage from './share-activity-image/share-activity-image';
import { UserInfoSize } from './user-info/const';
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
    isShowDescription,
    isShowDeleteBtn,
    mapPhotoUrl,
    mapPhotoUrlBlurhash,
    locations,
    profile,
    commentsLength,
    isFullView,
  } = rest;
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;
  const shouldLoadRouteLocations = !locations?.length && Boolean(mapPhotoUrl);
  const { data: routeData } = useGetLocationsByActivityIdQuery(id, { skip: !shouldLoadRouteLocations });
  const routeLocations = locations?.length ? locations : routeData?.locations;
  const shareMapPhotoUrl = useMemo(() => {
    if (routeLocations?.length) {
      return getMapBoxImage(routeLocations) || mapPhotoUrl;
    }
    return mapPhotoUrl;
  }, [mapPhotoUrl, routeLocations]);
  const resolvedMapPhotoUrl = useMemo(() => {
    if (routeLocations?.length) {
      return getMapBoxImage(routeLocations, { width: mediaWidth, height: ACTIVITY_MEDIA_HEIGHT }) || mapPhotoUrl;
    }
    return mapPhotoUrl;
  }, [mapPhotoUrl, mediaWidth, routeLocations]);
  const likesSize = pathname.includes(ROUTES.activity) ? LikesSize.big : LikesSize.small;
  return (
    <>
      <ShareActivityImage
        title={title}
        date={date}
        duration={duration}
        distance={distance}
        cardRef={cardRef}
        mapPhotoUrl={shareMapPhotoUrl}
      />
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
        <UserInfo profile={profile} sport={sport} date={date} userId={userId} size={UserInfoSize.large} />
        {(resolvedMapPhotoUrl || Boolean(photoVideoUrls?.length)) && (
          <MediaList
            photoVideoUrls={photoVideoUrls ?? []}
            mapPhotoUrl={resolvedMapPhotoUrl}
            mapPhotoUrlBlurhash={mapPhotoUrlBlurhash}
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
        />
        <View style={{ height: 40, paddingHorizontal: 8 }}>
          <Likes activityId={id} size={likesSize} />
        </View>
        <Card.Actions style={styles.actions}>
          <Btns
            activityId={id}
            userId={userId}
            cardRef={cardRef}
            isShowDeleteBtn={isShowDeleteBtn}
            commentsLength={commentsLength}
            profile={profile}
            mapPhotoUrl={resolvedMapPhotoUrl}
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
