import { Camera, MapView } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { View, ToastAndroid, Image } from 'react-native';
import { Text, Card, IconButton, MD3Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useDeleteActivityByIdMutation } from '../../redux/runnich-api/runnich-api';
import useFakeLocations from '../../utils/hooks/use-fake-locations';
import { formatDate } from '../../utils/time-formatter';
import AvatarShowable from '../avatar/avatar-showable';
import RouteLine from '../map/route-line/route-line';

type activityCardProps = {
  description: string;
  title: string;
  date: Date;
  sport: string;
  id: string;
  locations: LocationObject[];
  photoUrl: string;
};

export default function ActivityCard({ description, title, date, sport, id, locations, photoUrl }: activityCardProps) {
  const { settings } = useSelector(({ userInfo }) => userInfo);
  const { name, surname } = settings;
  const { cameraRef } = useFakeLocations();
  const [deleteActivityById] = useDeleteActivityByIdMutation();
  console.log(photoUrl);
  return (
    <Card key={id}>
      <Card.Content
        style={{ display: 'flex', flexDirection: 'row', columnGap: 5, marginBottom: 10, alignItems: 'center' }}>
        <AvatarShowable size={40} />
        <View style={{ display: 'flex' }}>
          <Text variant="titleLarge">
            {name} {surname}
          </Text>
          <Text variant="bodyMedium">
            {formatDate(date)}, {sport}
          </Text>
        </View>
        <Text variant="bodyLarge">{title}</Text>
      </Card.Content>
      <View style={{ height: 200 }}>
        {photoUrl && <Image source={{ uri: photoUrl }} style={{ flex: 1 }} />}
        {!photoUrl && (
          <MapView style={{ flex: 1 }}>
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

      <Card.Actions>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            icon="thumb-up-outline"
            iconColor={MD3Colors.error50}
            size={20}
            onPress={() => ToastAndroid.show('Здесь будет функционал лайканья', ToastAndroid.SHORT)}
          />
          <IconButton
            icon="comment-outline"
            iconColor={MD3Colors.error50}
            size={20}
            onPress={() => ToastAndroid.show('Здесь будет функционал комментирования', ToastAndroid.SHORT)}
          />
          <IconButton
            icon="share-outline"
            iconColor={MD3Colors.error50}
            size={20}
            onPress={() => ToastAndroid.show('Здесь будет функционал sharing', ToastAndroid.SHORT)}
          />
          <IconButton
            icon="delete"
            iconColor={MD3Colors.error50}
            size={20}
            onPress={async () => {
              await deleteActivityById(id)
                .unwrap()
                .then((success) => console.log(success))
                .catch((error) => console.log(error));
              ToastAndroid.show('Здесь будет функционал sharing', ToastAndroid.SHORT);
            }}
          />
        </View>
      </Card.Actions>
    </Card>
  );
}
