import { LocationObject } from 'expo-location';
import { usePathname, useRouter } from 'expo-router';
import { View, Image, Pressable } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { formatDate, formatDuration } from '../../utils/time-formatter';
import ActivityCardCommentBtn from '../activity-card-comment-btn/activity-card-comment-btn';
import ActivityCardDeleteBtn from '../activity-card-delete-btn/activity-card-delete-btn';
import ActivityCardLikeBtn from '../activity-card-like-btn/activity-card-like-btn';
import ActivityCardLikesWrapper from '../activity-card-likes-wrapper/activity-card-likes-wrapper';
import ActivityCardShareBtn from '../activity-card-share-btn/activity-card-share-btn';
import AvatarShowable from '../avatar/avatar-showable';
import DisplayActivityMap from '../display-activiy-map/display-activity-map';
import ShowMetrics from '../show-metrics/show-metrics';
import UserNameSurname from '../user-name-surname/user-name-surname';

type ActivityCardProps = {
  description: string;
  title: string;
  date: Date;
  sport: string;
  id: string;
  userId: string;
  locations: LocationObject[];
  photoUrl: string;
  duration: number;
  speed: number;
  distance: number;
};

export default function ActivityCard({
  description,
  title,
  date,
  sport,
  id,
  userId,
  locations,
  photoUrl,
  duration,
  speed,
  distance,
}: ActivityCardProps) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Card key={id}>
      <Pressable onPress={() => router.push(`/home/${id}`)}>
        <Card.Content
          style={{ display: 'flex', flexDirection: 'row', columnGap: 5, marginBottom: 10, alignItems: 'center' }}>
          <Pressable onPress={() => router.push(`/home/profile/${userId}`)}>
            <AvatarShowable size={40} id={userId} />
          </Pressable>

          <View style={{ display: 'flex' }}>
            <UserNameSurname userId={userId} size="bodyMedium" />
            <Text variant="bodyMedium">
              {formatDate(date)}, {sport}
            </Text>
            <Text variant="headlineSmall">{title}</Text>
          </View>
        </Card.Content>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', height: 60 }}>
          <ShowMetrics title="Distance: " metrics={`${distance / 1000} км`} />
          <ShowMetrics title="Time: " metrics={`${formatDuration(duration)}`} />
          <ShowMetrics title="Pace: " metrics={`${speed} км/ч`} />
        </View>
      </Pressable>
      {pathname.includes('/home/') ? (
        <View>
          <Text variant="bodyLarge">{description}</Text>
        </View>
      ) : null}
      <View style={{ height: 200 }}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={{ flex: 1 }} resizeMode="cover" />
        ) : (
          <DisplayActivityMap locations={locations} />
        )}
      </View>
      <ActivityCardLikesWrapper activityId={id} />
      <Card.Actions>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ActivityCardLikeBtn activityId={id} />
          <ActivityCardCommentBtn activityId={id} />
          <ActivityCardShareBtn />
          {ownerId === userId ? <ActivityCardDeleteBtn activityId={id} /> : null}
        </View>
      </Card.Actions>
    </Card>
  );
}
