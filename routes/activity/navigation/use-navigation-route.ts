import { useEffect, useState } from 'react';
import { Accuracy, watchPositionAsync, type LocationObject } from 'expo-location';
import { readSavedActivityTrack } from '@U/activity-track/track-library';
import type { ActivityLocation } from '@S/card/types';

export default function useNavigationRoute({
  navigationTrackId,
  isNavigationActive,
  isLocationReady,
  isRecording,
  recordingPosition,
}: {
  navigationTrackId: string | null;
  isNavigationActive: boolean;
  isLocationReady: boolean;
  isRecording: boolean;
  recordingPosition: LocationObject | null;
}) {
  const [guidancePosition, setGuidancePosition] = useState<LocationObject | null>(null);
  const [navigationRoute, setNavigationRoute] = useState<{ trackId: string; locations: ActivityLocation[] } | null>(
    null,
  );

  useEffect(() => {
    if (!navigationTrackId) return;
    let isCurrent = true;
    void readSavedActivityTrack(navigationTrackId).then(
      (locations) => {
        if (isCurrent) setNavigationRoute({ trackId: navigationTrackId, locations });
      },
      () => {
        if (isCurrent) setNavigationRoute({ trackId: navigationTrackId, locations: [] });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [navigationTrackId]);

  useEffect(() => {
    if (!navigationTrackId || !isNavigationActive || !isLocationReady || isRecording) return;

    let isCurrent = true;
    let subscription: { remove: () => void } | null = null;
    void watchPositionAsync(
      { accuracy: Accuracy.BestForNavigation, distanceInterval: 5, timeInterval: 3000 },
      (position) => setGuidancePosition(position),
    ).then(
      (nextSubscription) => {
        if (isCurrent) subscription = nextSubscription;
        else nextSubscription.remove();
      },
      () => undefined,
    );

    return () => {
      isCurrent = false;
      subscription?.remove();
    };
  }, [isLocationReady, isNavigationActive, isRecording, navigationTrackId]);

  return {
    route: navigationRoute?.trackId === navigationTrackId ? navigationRoute.locations : null,
    currentPosition: isRecording ? recordingPosition : guidancePosition,
  };
}
