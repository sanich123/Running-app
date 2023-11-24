import { usePathname, useRouter } from 'expo-router';
import { useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { ActivityCardProps } from './const ';
import AvatarShowable from '../avatar-showable/avatar-showable';
import CardBtns from '../card-btns/card-btns';
import CardDesription from '../card-description/card-description';
import CardLikes from '../card-likes/card-likes';
import CardMapImagesList from '../card-map-images-list/card-map-images-list';
import CardMetrics from '../card-metrics/card-metrics';
import CardTitle from '../card-title/card-title';
import CommentsLength from '../comments-length/comments-length';
import UserNameSurname from '../user-name-surname/user-name-surname';
import UserSportDate from '../user-sport-date/user-sport-date';

export default function ActivityCard({ ...rest }: ActivityCardProps) {
  const { description, title, date, sport, id, userId, locations, photoUrls, duration, distance, fullViewRef } = rest;
  const { push } = useRouter();
  const pathname = usePathname();
  const cardRef = useRef();

  return (
    <Card key={id}>
      <View ref={cardRef} collapsable={false}>
        <Pressable onPress={() => push(`/home/activity/${id}`)}>
          <Card.Content>
            <Pressable style={styles.cardContent} onPress={() => push(`/home/profile/${userId}`)}>
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
        {pathname.includes('/home/') && <CardDesription description={description} />}
        {(locations?.length || photoUrls?.length > 0) && (
          <CardMapImagesList locations={locations} photoUrls={photoUrls} id={id} />
        )}
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <CardLikes activityId={id} />
          <CommentsLength activityId={id} />
        </View>
      </View>
      <Card.Actions>
        <CardBtns activityId={id} userId={userId} cardRef={cardRef} fullViewRef={fullViewRef} />
      </Card.Actions>
    </Card>
  );
}

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
