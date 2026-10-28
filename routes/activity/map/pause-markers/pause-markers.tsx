import { useAppSelector } from '@R/typed-hooks';
import PauseMarker from './pause-marker/pause-marker';
import type { LocationObject } from 'expo-location';

export default function PauseMarkers({ locations }: { locations?: LocationObject[][] } = {}) {
  const { locationsWithPauses } = useAppSelector(({ location }) => location);
  const routeLocations = locations ?? locationsWithPauses;

  return (
    <>
      {routeLocations.flatMap((segment, index) => {
        if (index === 0) return [];

        const pauseLocation = routeLocations[index - 1]?.at(-1);
        const resumeLocation = segment[0];
        return [
          pauseLocation ? <PauseMarker key={`pause-${index}`} location={pauseLocation} isResume={false} /> : null,
          resumeLocation ? <PauseMarker key={`resume-${index}`} location={resumeLocation} isResume /> : null,
        ];
      })}
    </>
  );
}
