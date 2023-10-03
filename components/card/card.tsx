import { usePathname, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { ActivityCardProps } from '../../constants/types/activity-cart';
import AvatarShowable from '../avatar/avatar-showable';
import CardBtns from '../card-btns/card-btns';
import CardDesription from '../card-description/card-description';
import CardLikes from '../card-likes/card-likes';
import CardMapImagesList from '../card-map-images-list/card-map-images-list';
import CardMetrics from '../card-metrics/card-metrics';
import CardTitle from '../card-title/card-title';
import CommentsLength from '../comments-length/comments-length';
import UserNameSurname from '../user-name-surname/user-name-surname';
import UserSportDate from '../user-sport-date/user-sport-date';

export default function ActivityCard({
  description,
  title,
  date,
  sport,
  id,
  userId,
  locations,
  photoUrls,
  duration,
  speed,
  distance,
}: ActivityCardProps) {
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <Card key={id}>
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
        <View style={styles.titleWrapper}>
          <CardTitle title={title} />
        </View>
        <View style={styles.metricsWrapper}>
          <CardMetrics distance={distance} duration={duration} speed={speed} />
        </View>
      </Pressable>
      {pathname.includes('/home/') ? <CardDesription description={description} /> : null}
      <CardMapImagesList locations={locations} photoUrls={photoUrls} id={id} />
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <CardLikes activityId={id} />
        <CommentsLength activityId={id} />
      </View>

      <Card.Actions>
        <View style={styles.activityBtnsWrapper}>
          <CardBtns activityId={id} userId={userId} />
        </View>
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
  profileWrapper: { display: 'flex', justifyContent: 'center' },
  titleWrapper: { marginTop: 5, marginLeft: 15, marginBottom: 5 },
  metricsWrapper: { display: 'flex', flexDirection: 'row', marginLeft: 15, columnGap: 15, marginBottom: 5 },
  activityBtnsWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});