import { CustomImage } from '@C/custom-image/custom-image';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { useRef, memo, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { ActivityCardProps } from './const ';
import CardBtns from '../card-btns/card-btns';
import CardDesription from '../card-description/card-description';
import CardLikes, { CardLikesSize } from '../card-likes/card-likes';
import CardMapImagesList from '../card-map-images-list/card-map-images-list';
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
    profile,
  } = rest;
  const { push } = useRouter();
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const cardRef = useRef(null);
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const prefetchFullActivity = runichApi.usePrefetch('getActivityByActivityId');

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
              push(`/${place}/${ROUTES.activity}/${id}`);
            }
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Card.Content>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.cardContent]}
              onPress={() => push(`/${place}/${ROUTES.profile}/${userId}`)}>
              <CustomImage
                style={{ width: 40, height: 40, borderRadius: 70 }}
                source={{ uri: profile?.profilePhoto }}
                contentFit="cover"
              />
              <View style={styles.profileWrapper}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {`${profile?.name} `}
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {profile?.surname}
                  </Text>
                </View>
                <UserSportDate sport={sport} date={date} />
              </View>
            </Pressable>
          </Card.Content>
          {title ? <CardTitle title={title} /> : null}
          <CardMetrics distance={distance} duration={duration} />
        </Pressable>
        {isShowDescription ? <CardDesription description={description} /> : null}
        {mapPhotoUrl || photoVideoUrls?.length > 0 ? (
          <CardMapImagesList photoVideoUrls={photoVideoUrls} mapPhotoUrl={mapPhotoUrl} id={id} />
        ) : null}
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <CardLikes
            activityId={id}
            size={pathname.includes(ROUTES.activity) ? CardLikesSize.big : CardLikesSize.small}
          />
          <CommentsLength activityId={id} comments={comments} />
        </View>
      </View>
      <Card.Actions>
        <CardBtns
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

const styles = StyleSheet.create({
  cardContent: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 5,
    paddingTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  profileWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
});
