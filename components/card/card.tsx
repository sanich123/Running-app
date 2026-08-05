import { useRef, memo, useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { usePathname } from 'expo-router';
import { Card, useTheme } from 'react-native-paper';
import UserInfo from '@C/card/user-info/user-info';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { activityApi } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import Btns from './btns/btns';
import { LikesSize } from './likes/const';
import Likes from './likes/likes';
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
    profile,
    commentsLength,
  } = rest;
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const cardRef = useRef<View>(null);
  const prefetchFullActivity = activityApi.usePrefetch('getActivityByActivityId');
  const likesSize = pathname.includes(ROUTES.activity) ? LikesSize.big : LikesSize.small;
  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchFullActivity(`${id}`);
    }
  }, [id, isNeedToPrefetchActivities, prefetchFullActivity]);

  return (
    <>
      <ShareActivityImage
        description={description}
        title={title}
        duration={duration}
        distance={distance}
        isShowDescription={isShowDescription}
        cardRef={cardRef}
        mapPhotoUrl={mapPhotoUrl}
      />
      <View
        style={[
          {
            ...styles.cardStyles,
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            borderWidth: 1,
            zIndex: 10,
            width: width < MAX_MOBILE_WIDTH ? Math.max(width - 24, 0) : MAX_MOBILE_WIDTH,
          },
          Platform.OS === 'web' && styles.webStyles,
        ]}>
        <UserInfo profile={profile} sport={sport} date={date} userId={userId} size={UserInfoSize.large} />
        {(mapPhotoUrl || photoVideoUrls?.length > 0) && (
          <MediaList
            photoVideoUrls={photoVideoUrls}
            mapPhotoUrl={mapPhotoUrl}
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
            mapPhotoUrl={mapPhotoUrl}
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
    marginBottom: 16,
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
