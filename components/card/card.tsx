import UserInfo from '@C/card/user-info/user-info';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { usePathname } from 'expo-router';
import { useRef, memo, useEffect } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

import Btns from './btns/btns';
import { ActivityCardProps } from './const ';
import { LikesSize } from './likes/const';
import Likes from './likes/likes';
import MediaList from './media-list/media-list';
import Metrics from './metrics/metrics';
import { UserInfoSize } from './user-info/const';

export default memo(function ActivityCard({
  description,
  title,
  date,
  sport,
  id,
  userId,
  photoVideoUrls,
  duration,
  distance,
  fullViewRef,
  isShowDescription,
  isShowDeleteBtn,
  mapPhotoUrl,
  mapPhotoUrlBlurhash,
  profile,
  commentsLength,
}: ActivityCardProps) {
  const pathname = usePathname();
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const cardRef = useRef(null);
  const prefetchFullActivity = runichApi.usePrefetch('getActivityByActivityId');
  const likesSize = pathname.includes(ROUTES.activity) ? LikesSize.big : LikesSize.small;

  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchFullActivity(`${id}`);
    }
  }, [isNeedToPrefetchActivities]);

  return (
    <Card>
      <Card.Content>
        <UserInfo profile={profile} sport={sport} date={date} userId={userId} size={UserInfoSize.large} />
        <View ref={cardRef} collapsable={false}>
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
      </Card.Content>
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
          fullViewRef={fullViewRef}
          isShowDeleteBtn={isShowDeleteBtn}
          commentsLength={commentsLength}
        />
      </Card.Actions>
    </Card>
  );
});
