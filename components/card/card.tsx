import { CustomImage } from '@C/custom-image/custom-image';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { useRef, memo, useEffect } from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { ActivityCardProps } from './const ';
import CardBtns from '../card-btns/card-btns';
import CardDesription from '../card-description/card-description';
import CardLikes, { CardLikesSize } from '../card-likes/card-likes';
import CardMapImagesList from '../card-likes/card-map-images-list/card-map-images-list';
import CardMetrics from '../card-metrics/card-metrics';
import CardTitle from '../card-title/card-title';
import CommentsLength from '../comments-length/comments-length';
import UserSportDate from '../user-sport-date/user-sport-date';

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
    fullViewRef,
    isShowDescription,
    isShowDeleteBtn,
    comments,
    mapPhotoUrl,
    mapPhotoUrlBlurhash,
    profile,
    likes,
  } = rest;
  const { push } = useRouter();
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const cardRef = useRef(null);
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const prefetchFullActivity = runichApi.usePrefetch('getActivityByActivityId');
  const windowWidth = Dimensions.get('window').width;
  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchFullActivity(`${id}`);
    }
  }, [isNeedToPrefetchActivities]);

  return (
    <Card>
      <View ref={cardRef} collapsable={false}>
        <Pressable
          onPress={() => {
            if (!pathname.includes(ROUTES.activity)) {
              push(`/${place}/${ROUTES.activity}/${id}?userId=${userId}`);
            }
          }}
          style={({ pressed }) => ({ opacity: !pathname.includes(ROUTES.activity) && pressed ? 0.5 : 1 })}>
          <Card.Content>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
              onPress={() => push(`/${place}/${ROUTES.profile}/${userId}`)}>
              <View className="flex flex-row items-center gap-5">
                <CustomImage
                  style={{ width: 50, height: 50, borderRadius: 70 }}
                  source={{ uri: profile?.profilePhoto }}
                  placeholder={profile?.profilePhotoBlurhash}
                  contentFit="cover"
                />
                <View className="margin-0 padding-0">
                  <View className="flex-1 flex-row">
                    <Text variant="titleMedium">{`${profile?.name} `}</Text>
                    <Text variant="titleMedium">{profile?.surname}</Text>
                  </View>
                  <UserSportDate sport={sport} date={date} />
                </View>
              </View>
            </Pressable>
          </Card.Content>
          {title ? <CardTitle title={title} /> : null}
          <CardMetrics distance={distance} duration={duration} />
        </Pressable>
        {isShowDescription ? <CardDesription description={description} /> : null}
        {mapPhotoUrl || photoVideoUrls?.length > 0 ? (
          <CardMapImagesList
            photoVideoUrls={photoVideoUrls}
            mapPhotoUrl={mapPhotoUrl}
            mapPhotoUrlBlurhash={mapPhotoUrlBlurhash}
            id={id}
          />
        ) : null}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 5,
            paddingLeft: 5,
            height: 40,
          }}>
          <View style={{ width: windowWidth / 2 }}>
            {likes?.length ? (
              <CardLikes
                activityId={id}
                size={pathname.includes(ROUTES.activity) ? CardLikesSize.big : CardLikesSize.small}
              />
            ) : null}
          </View>
          <CommentsLength activityId={id} comments={comments} />
        </View>
      </View>
      <Card.Actions>
        <CardBtns
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
