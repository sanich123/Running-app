import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef, useEffect } from 'react';

export default function MapboxWeb() {
  const [, setMap] = useState<mapboxgl.Map>();
  const mapNode = useRef(null);
  useEffect(() => {
    const node = mapNode.current;

    if (typeof window === 'undefined' || node === null) return;
    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9,
    });
    setMap(mapboxMap);
    return () => {
      mapboxMap.remove();
    };
  }, []);
  return <div ref={mapNode} style={{ width: '100%', height: '100%' }} />;
}
