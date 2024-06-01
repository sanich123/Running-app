import MapKmSplit from '@C/map-km-split/map-km-split';
import MapRouteLine from '@C/map-route-line/map-route-line';
import { useAppSelector } from '@R/typed-hooks';
import useGetPermissions from '@U/hooks/use-get-permission';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { Platform, View } from 'react-native';
import { Location } from 'react-native-background-geolocation';
import { ActivityIndicator } from 'react-native-paper';

export default function Map() {
  const { isMapVisible, locationsWithPauses, kilometresSplit } = useAppSelector(({ location }) => location);
  const { isForegroundPermission, isBackgroundPermission } = useGetPermissions();
  return (
    <>
      {isForegroundPermission && isBackgroundPermission ? (
        <MapView style={[{ flex: 1 }, isMapVisible && { height: '60%' }]}>
          {Platform.OS === 'ios' ? (
            <UserLocation showsUserHeadingIndicator animated />
          ) : (
            <UserLocation showsUserHeadingIndicator androidRenderMode="compass" animated />
          )}
          <Camera followUserLocation followZoomLevel={18} animationMode="flyTo" />
          <MapKmSplit kilometresSplit={kilometresSplit} />
          {locationsWithPauses[0]?.length > 1
            ? locationsWithPauses.map((locations: Location[]) => {
                if (locations?.length > 1) {
                  const key = `${locations[0].coords.longitude}, ${locations[locations.length - 1].coords.latitude}`;
                  return <MapRouteLine key={key} locations={locations} />;
                }
              })
            : null}
        </MapView>
      ) : (
        <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, isMapVisible && { height: '60%' }]}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
}
