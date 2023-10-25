import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration } from '../../utils/time-formatter';
import ShowMetrics from '../show-metrics/show-metrics';

export default function CardMetrics({ distance, duration }: { distance: number; duration: number }) {
  return (
    <>
      <ShowMetrics title="Time: " metrics={`${formatDuration(duration)}`} />
      <ShowMetrics title="Pace: " metrics={`${getSpeedInMinsInKm(distance, duration).paceAsString} /km`} />
      <ShowMetrics title="Distance: " metrics={`${(distance / 1000).toFixed(2)} km`} />
    </>
  );
}
