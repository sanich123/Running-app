import { useState, useRef, useEffect } from 'react';
import { Map as MapboxMap } from 'mapbox-gl';
import type { LastKmSplit } from '@R/slices/location/types';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxWeb({
  boundBox,
  routeCoordinates,
  kilometresSplit,
}: {
  boundBox: [number, number, number, number];
  routeCoordinates: number[][];
  kilometresSplit: LastKmSplit[];
}) {
  const [, setMap] = useState<MapboxMap>();
  void kilometresSplit;
  const mapNode = useRef(null);

  useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;
    const mapboxMap = new MapboxMap({
      container: node,
      style: 'mapbox://styles/mapbox/streets-v12',
      bounds: boundBox,
      boxZoom: true,
      fitBoundsOptions: { padding: { top: 20, bottom: 20, left: 20, right: 20 } },
    });
    setMap(mapboxMap);
    mapboxMap.on('load', () => {
      mapboxMap.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        },
      });
      mapboxMap.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'orange',
          'line-width': 6,
        },
      });
      mapboxMap.addLayer({
        id: 'route-points',
        type: 'circle',
        source: 'route',
        paint: {
          'circle-radius': 4,
          'circle-stroke-width': 2,
          'circle-color': 'red',
          'circle-stroke-color': 'white',
        },
      });
    });

    return () => {
      mapboxMap.remove();
    };
  }, [boundBox, routeCoordinates]);

  return <div ref={mapNode} style={{ flex: 1 }} />;
}
