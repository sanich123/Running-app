import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';

export default function MapRouteLine({ locations }: { locations: LocationObject[] }) {
  const coordinates = locations.map(({ coords }) => [coords.longitude, coords.latitude]);
  return (
    <ShapeSource
      id={`${locations[0].timestamp}`}
      shape={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        ],
      }}>
      <LineLayer id={`${locations[0].timestamp}+${locations.length}`} style={{ lineColor: 'orange', lineWidth: 5 }} />
    </ShapeSource>
  );
}
