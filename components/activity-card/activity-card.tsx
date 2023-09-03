import { Camera, MapView } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { usePathname, useRouter } from 'expo-router';
import { View, ToastAndroid, Image, Pressable } from 'react-native';
import { Text, Card, IconButton, MD3Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';

import useFakeLocations from '../../utils/hooks/use-fake-locations';
import { formatDate, formatDuration } from '../../utils/time-formatter';
import ActivityCardCommentBtn from '../activity-card-comment-btn/activity-card-comment-btn';
import ActivityCardDeleteBtn from '../activity-card-delete-btn/activity-card-delete-btn';
import ActivityCardLikeBtn from '../activity-card-like-btn/activity-card-like-btn';
import ActivityCardLikesWrapper from '../activity-card-likes-wrapper/activity-card-likes-wrapper';
import AvatarShowable from '../avatar/avatar-showable';
import RouteLine from '../map/route-line/route-line';

type ActivityCardProps = {
  description: string;
  title: string;
  date: Date;
  sport: string;
  id: string;
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
  locations,
  photoUrl,
  duration,
  speed,
  distance,
}: ActivityCardProps) {
  const { id: userId, settings } = useSelector(({ userInfo }) => userInfo);
  const { name, surname } = settings;
  const { cameraRef } = useFakeLocations();

  const router = useRouter();
  const pathname = usePathname();
  return (
    <Card key={id}>
      <Pressable onPress={() => router.push(`/home/${id}`)}>
        <Card.Content
          style={{ display: 'flex', flexDirection: 'row', columnGap: 5, marginBottom: 10, alignItems: 'center' }}>
          <AvatarShowable size={40} id={userId} />

          <View style={{ display: 'flex' }}>
            <Text variant="bodyLarge">
              {name} {surname}
            </Text>
            <Text variant="bodySmall">
              {formatDate(date)}, {sport}
            </Text>
            <Text variant="headlineSmall">{title}</Text>
          </View>
        </Card.Content>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', height: 60 }}>
          <View style={{ display: 'flex' }}>
            <Text variant="titleMedium">Distance: </Text>
            <Text variant="bodyMedium">{distance / 1000} км</Text>
          </View>
          <View style={{ display: 'flex' }}>
            <Text variant="titleMedium">Time:</Text>
            <Text variant="bodyMedium">{formatDuration(duration)}</Text>
          </View>
          <View style={{ display: 'flex' }}>
            <Text variant="titleMedium">Pace:</Text>
            <Text variant="bodyMedium">{speed} км/ч</Text>
          </View>
        </View>
      </Pressable>
      {pathname.includes('/home/') && (
        <View>
          <Text variant="bodyLarge">{description}</Text>
        </View>
      )}
      <View style={{ height: 200 }}>
        {photoUrl && <Image source={{ uri: photoUrl }} style={{ flex: 1 }} resizeMode="cover" />}
        {!photoUrl && (
          <MapView style={{ flex: 1 }} scaleBarEnabled={false}>
            <Camera
              animationMode="flyTo"
              animationDuration={1000}
              zoomLevel={25}
              ref={cameraRef}
              centerCoordinate={[locations[0].coords.latitude, locations[0].coords.longitude]}
            />
            {locations.length > 1 && <RouteLine locations={locations} />}
          </MapView>
        )}
      </View>
      <ActivityCardLikesWrapper activityId={id} />
      <Card.Actions>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ActivityCardLikeBtn activityId={id} />
          <ActivityCardCommentBtn activityId={id} />
          <IconButton
            icon="share-outline"
            iconColor={MD3Colors.error50}
            size={20}
            onPress={() => ToastAndroid.show('Здесь будет функционал sharing', ToastAndroid.SHORT)}
          />
          <ActivityCardDeleteBtn activityId={id} />
        </View>
      </Card.Actions>
    </Card>
  );
}
