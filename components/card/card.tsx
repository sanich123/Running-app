import UserInfo from '@C/card/user-info/user-info';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { usePathname } from 'expo-router';
import { useRef, memo, useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

import Btns from './btns/btns';
import { LikesSize } from './likes/const';
import Likes from './likes/likes';
import MediaList from './media-list/media-list';
import Metrics from './metrics/metrics';
import { UserInfoSize } from './user-info/const';
import { ActivityCardProps } from './types';
import ShareActivityImage from './share-activity-image/share-activity-image';
import { MAX_MOBILE_WIDTH } from '@const/const';

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
  const cardRef = useRef(null);
  const prefetchFullActivity = runichApi.usePrefetch('getActivityByActivityId');
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
            backgroundColor: colors.background,
            zIndex: 10,
            width: width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH,
          },
          Platform.OS === 'web' && styles.webStyles,
        ]}>
        <View>
          <UserInfo profile={profile} sport={sport} date={date} userId={userId} size={UserInfoSize.large} />
          <View>
            <Metrics
              distance={distance}
              duration={duration}
              title={title}
              isShowDescription={isShowDescription}
              description={description}
              userId={userId}
              id={id}
            />
          </View>
        </View>
        {(mapPhotoUrl || photoVideoUrls?.length > 0) && (
          <MediaList
            photoVideoUrls={photoVideoUrls}
            mapPhotoUrl={mapPhotoUrl}
            mapPhotoUrlBlurhash={mapPhotoUrlBlurhash}
            id={id}
          />
        )}
        <View style={{ height: 40 }}>
          <Likes activityId={id} size={likesSize} />
        </View>
        <Card.Actions>
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
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    marginBottom: 5,
    borderRadius: 15,
  },
});
