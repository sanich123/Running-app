import ActivityMapMarker from './activity-map-marker/activity-map-marker';
import type { ActivityLocation } from '@S/card/types';

export default function ActivityMapMarkers({ locations }: { locations: ActivityLocation[] }) {
  if (locations.length < 2) {
    return null;
  }

  return (
    <>
      <ActivityMapMarker location={locations[0]} type="start" />
      <ActivityMapMarker location={locations[locations.length - 1]} type="end" />
    </>
  );
}
