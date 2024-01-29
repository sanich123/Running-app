import { runichApi } from '@R/runich-api/runich-api';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { useRef, memo, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { ActivityCardProps } from './const ';
import AvatarShowable from '../avatar-showable/avatar-showable';
import CardBtns from '../card-btns/card-btns';
import CardDesription from '../card-description/card-description';
import CardLikes, { CardLikesSize } from '../card-likes/card-likes';
import CardMapImagesList from '../card-map-images-list/card-map-images-list';
import CardMetrics from '../card-metrics/card-metrics';
import CardTitle from '../card-title/card-title';
import CommentsLength from '../comments-length/comments-length';
import UserNameSurname from '../user-name-surname/user-name-surname';
import UserSportDate from '../user-sport-date/user-sport-date';

export default memo(
  function ActivityCard({ ...rest }: ActivityCardProps) {
    const {
      description,
      title,
      date,
      sport,
      id,
      userId,
      locations,
      photoUrls,
      duration,
      distance,
      fullViewRef,
      isShowDescription,
      isShowDeleteBtn,
    } = rest;
    const { push } = useRouter();
    const cardRef = useRef(null);
    const prefetchFullActivity = runichApi.usePrefetch('getActivityByActivityId');
    const prefetchProfile = runichApi.usePrefetch('getUserProfileById');
    const prefetchProfilePhotos = runichApi.usePrefetch('getAllActivityPhotosByUserId');
    const pathname = usePathname();
    const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
    useEffect(() => {
      prefetchProfile(userId);
      prefetchProfilePhotos(userId);
      prefetchFullActivity(`${id}`);
    }, []);

    return (
      <Card>
        <View ref={cardRef} collapsable={false}>
          <Pressable
            onPress={() => push(`/${place}/${ROUTES.activity}/${id}`)}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Card.Content>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.cardContent]}
                onPress={() => push(`/${place}/${ROUTES.profile}/${userId}`)}>
                <AvatarShowable size={40} id={userId} />
                <View style={styles.profileWrapper}>
                  <UserNameSurname userId={userId} size="titleMedium" />
                  <UserSportDate sport={sport} date={date} />
                </View>
              </Pressable>
            </Card.Content>
            {title && <CardTitle title={title} />}
            <CardMetrics distance={distance} duration={duration} />
          </Pressable>
          {isShowDescription && <CardDesription description={description} />}
          {(locations?.length || photoUrls?.length > 0) && (
            <CardMapImagesList locations={locations} photoUrls={photoUrls} id={id} />
          )}
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <CardLikes
              activityId={id}
              size={pathname.includes(ROUTES.activity) ? CardLikesSize.big : CardLikesSize.small}
            />
            <CommentsLength activityId={id} />
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
  },
  (prev, next) => prev.date === next.date,
);

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
