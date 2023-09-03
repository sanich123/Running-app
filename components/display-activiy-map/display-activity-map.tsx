import { Camera, MapView } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';

import useFakeLocations from '../../utils/hooks/use-fake-locations';
import RouteLine from '../map/route-line/route-line';

export default function DisplayActivityMap({ locations }: { locations: LocationObject[] }) {
  const { cameraRef } = useFakeLocations();
  return (
    <MapView style={{ display: 'flex', height: 200 }} scaleBarEnabled={false}>
      <Camera
        animationMode="flyTo"
        animationDuration={1000}
        zoomLevel={25}
        ref={cameraRef}
        centerCoordinate={[locations[0].coords.latitude, locations[0].coords.longitude]}
      />
      {locations.length > 1 && <RouteLine locations={locations} />}
    </MapView>
  );
}
