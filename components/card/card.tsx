import CardUserInfo from '@C/card-user-info/card-user-info';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { usePathname } from 'expo-router';
import { useRef, memo, useEffect } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

import { ActivityCardProps } from './const ';
import CardBtns from '../card-btns/card-btns';
import CardLikes, { CardLikesSize } from '../card-likes/card-likes';
import CardMapImagesList from '../card-likes/card-map-images-list/card-map-images-list';
import CardMetrics from '../card-metrics/card-metrics';

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
  comments,
  mapPhotoUrl,
  mapPhotoUrlBlurhash,
  profile,
  likes,
}: ActivityCardProps) {
  const pathname = usePathname();
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const cardRef = useRef(null);
  const prefetchFullActivity = runichApi.usePrefetch('getActivityByActivityId');

  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchFullActivity(`${id}`);
    }
  }, [isNeedToPrefetchActivities]);

  return (
    <Card>
      <Card.Content>
        <CardUserInfo profile={profile} sport={sport} date={date} userId={userId} />
        <View ref={cardRef} collapsable={false}>
          <CardMetrics
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
        <CardMapImagesList
          photoVideoUrls={photoVideoUrls}
          mapPhotoUrl={mapPhotoUrl}
          mapPhotoUrlBlurhash={mapPhotoUrlBlurhash}
          id={id}
        />
      )}
      <View style={{ height: 40 }}>
        {likes?.length ? (
          <CardLikes
            activityId={id}
            size={pathname.includes(ROUTES.activity) ? CardLikesSize.big : CardLikesSize.small}
          />
        ) : null}
      </View>
      <Card.Actions>
        <CardBtns
          comments={comments}
          likes={likes}
          activityId={id}
          userId={userId}
          cardRef={cardRef}
          fullViewRef={fullViewRef}
          isShowDeleteBtn={isShowDeleteBtn}
        />
      </Card.Actions>
    </Card>
  );
});
