import { usePathname, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { ActivityCardProps } from '../../constants/types/activity-cart';
import ActivityCardBtns from '../activity-card-btns/activity-card-btns';
import ActivityCardDesription from '../activity-card-description/activity-card-description';
import ActivityCardLikesWrapper from '../activity-card-likes-wrapper/activity-card-likes-wrapper';
import ActivityCardMapImagesList from '../activity-card-map-images-list/activity-card-map-images-list';
import ActivityCardMetrics from '../activity-card-metrics/activity-card-metrics';
import ActivityCardTitle from '../activity-card-title/activity-card-title';
import AvatarShowable from '../avatar/avatar-showable';
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
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Card key={id}>
      <Pressable onPress={() => router.push(`/home/activity/${id}`)}>
        <Card.Content style={styles.cardContent}>
          <Pressable onPress={() => router.push(`/home/profile/${userId}`)}>
            <AvatarShowable size={40} id={userId} />
          </Pressable>
          <View style={styles.userInfoWrapper}>
            <UserNameSurname userId={userId} size="titleMedium" />
            <UserSportDate sport={sport} date={date} />
          </View>
        </Card.Content>
        <View style={styles.titleWrapper}>
          <ActivityCardTitle title={title} />
        </View>
        <View style={styles.metricsWrapper}>
          <ActivityCardMetrics distance={distance} duration={duration} speed={speed} />
        </View>
      </Pressable>
      {pathname.includes('/home/') ? <ActivityCardDesription description={description} /> : null}
      <ActivityCardMapImagesList locations={locations} photoUrls={photoUrls} id={id} />
      <ActivityCardLikesWrapper activityId={id} />
      <Card.Actions>
        <View style={styles.activityBtnsWrapper}>
          <ActivityCardBtns activityId={id} userId={userId} />
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
  userInfoWrapper: { display: 'flex', justifyContent: 'center' },
  titleWrapper: { marginTop: 5, marginLeft: 15, marginBottom: 5 },
  metricsWrapper: { display: 'flex', flexDirection: 'row', marginLeft: 15, columnGap: 15, marginBottom: 5 },
  activityBtnsWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
