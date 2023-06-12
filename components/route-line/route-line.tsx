import { ShapeSource, LineLayer } from '@rnmapbox/maps';

export default function RouteLine({ locations }: { locations: number[][] }) {
  return (
    <ShapeSource
      id="shape-source"
      shape={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: locations,
            },
          },
        ],
      }}
    >
      <LineLayer id="line-layer" style={{ lineColor: 'orange', lineWidth: 5 }} />
    </ShapeSource>
  );
}
