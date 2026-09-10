import { useRef, memo, useMemo } from 'react';
import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
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
import { getActivityCardElevationGain, getCardMapPhotoUrl } from './utils';
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
    steps,
    kilometresSplit,
    isShowDescription,
    isShowDeleteBtn,
    mapPhotoUrl,
    mapPhotoUrlBlurhash,
    locations,
    profile,
    commentsLength,
    likesLength,
    isFullView,
  } = rest;
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH;
  const cardMapPhotoUrl = useMemo(() => getCardMapPhotoUrl(mapPhotoUrl, mediaWidth), [mapPhotoUrl, mediaWidth]);
  // The feed already has a static map preview. Loading the complete route for
  // every visible card creates an extra request per card and replaces the
  // image URL while the list is being scrolled. The full activity view still
  // loads the route when the detail response does not contain it.
  const shouldLoadRouteLocations = isFullView && !locations?.length && Boolean(mapPhotoUrl);
  const { data: routeData } = useGetLocationsByActivityIdQuery(id, { skip: !shouldLoadRouteLocations });
  const routeLocations = locations?.length ? locations : routeData?.locations;
  const routeKilometresSplit = kilometresSplit?.length ? kilometresSplit : routeData?.kilometresSplit;
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
    return cardMapPhotoUrl;
  }, [cardMapPhotoUrl, mapPhotoUrl, mediaWidth, routeLocations]);
  const likesSize = pathname.includes(ROUTES.activity) ? LikesSize.big : LikesSize.small;
  return (
    <>
      <ShareActivityImage
        title={title}
        date={date}
        duration={duration}
        distance={distance}
        sport={sport}
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
          sport={sport}
          steps={steps}
          elevationGain={getActivityCardElevationGain(routeKilometresSplit, routeLocations)}
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
