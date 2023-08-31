import { Camera, MapView } from '@rnmapbox/maps';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, MD2Colors, Button, Card, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import AvatarShowable from '../../../components/avatar/avatar-showable';
import RouteLine from '../../../components/map/route-line/route-line';
import { useGetActivitiesByUserIdQuery } from '../../../redux/runnich-api/runnich-api';
import useFakeLocations from '../../../utils/hooks/use-fake-locations';
import useGetLocation from '../../../utils/hooks/use-get-location';
import { formatDate } from '../../../utils/time-formatter';

export default function Feed() {
  const { id, settings } = useSelector(({ userInfo }) => userInfo);
  const { name, surname } = settings;
  useGetLocation();
  const { cameraRef } = useFakeLocations();

  const { data: activities, error, isLoading } = useGetActivitiesByUserIdQuery(id);
  console.log(activities);
  return (
    <>
      <ScrollView>
        {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
        {activities &&
          activities.map(({ description, title, date, sport, id, locations }) => (
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
              </Card.Content>
              <View style={{ height: 200 }}>
                <MapView style={{ flex: 1 }}>
                  <Camera
                    animationMode="flyTo"
                    animationDuration={1000}
                    zoomLevel={10}
                    ref={cameraRef}
                    centerCoordinate={[locations[0].coords.latitude, locations[0].coords.longitude]}
                  />
                  {locations.length > 1 && <RouteLine locations={locations} />}
                </MapView>
              </View>

              <Card.Actions>
                <Button>Cancel</Button>
                <Button>Ok</Button>
              </Card.Actions>
            </Card>
          ))}

        <View style={styles.container}>
          {error && (
            <View>
              <Text>An error occured during fetching the data</Text>
            </View>
          )}
          {/* <FAB icon="plus" style={styles.fab} onPress={() => console.log('Pressed')} /> */}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
