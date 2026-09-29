import { useMemo } from 'react';
import { getActivityMapBounds } from '@S/display-activity-map/utils';
import { createRouteTimeline } from './utils';
import type { ActivityRouteReplayProps } from './types';

export default function useRouteData({ locations, workoutDuration }: ActivityRouteReplayProps) {
  const validLocations = useMemo(
    () => locations.filter(({ coords }) => Number.isFinite(coords?.longitude) && Number.isFinite(coords?.latitude)),
    [locations],
  );
  const timeline = useMemo(() => createRouteTimeline(validLocations), [validLocations]);
  const mapData = useMemo(
    () => (timeline.coordinates.length >= 2 ? getActivityMapBounds(validLocations) : null),
    [timeline, validLocations],
  );
  const safeWorkoutDuration =
    typeof workoutDuration === 'number' && Number.isFinite(workoutDuration) && workoutDuration > 0
      ? workoutDuration
      : timeline.totalPlaybackTime * 1000;

  return { validLocations, timeline, mapData, workoutDuration: safeWorkoutDuration };
}
