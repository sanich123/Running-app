import { MapView, Camera } from '@rnmapbox/maps';
import bbox from '@turf/bbox';
import { LocationObject } from 'expo-location';
import { usePathname } from 'expo-router';
import lineString from 'turf-linestring';

import { KilometresSplit } from '../home-activity-full-view-km-split/home-activity-full-view-km-split';
import MapKmSplit from '../map-km-split/map-km-split';
import RouteLine from '../map-route-line/map-route-line';

type DisplayActivityMapProps = {
  locations: LocationObject[];
  kilometresSplit: KilometresSplit[];
};

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
  const pathname = usePathname();
  const modifiedLocationsForTurf = locations.map(({ coords: { longitude, latitude } }) => [latitude, longitude]);
  const line = lineString(modifiedLocationsForTurf);
  const [minLat, minLng, maxLat, maxLng] = bbox(line);

  return (
    <MapView style={[{ flex: 1 }, pathname.includes('/comment') && { height: 200 }]} scaleBarEnabled={false}>
      <Camera
        animationMode="flyTo"
        animationDuration={1000}
        bounds={{ ne: [minLng, minLat], sw: [maxLng, maxLat] }}
        padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
      />
      {locations.length > 1 && <RouteLine locations={locations} />}
      <MapKmSplit kilometresSplit={kilometresSplit} />
    </MapView>
  );
}
