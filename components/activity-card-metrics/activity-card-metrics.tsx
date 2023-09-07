import { formatDuration } from '../../utils/time-formatter';
import ShowMetrics from '../show-metrics/show-metrics';

export default function ActivityCardMetrics({
  distance,
  duration,
  speed,
}: {
  distance: number;
  duration: number;
  speed: number;
}) {
  return (
    <>
      <ShowMetrics title="Time: " metrics={`${formatDuration(duration)}`} />
      <ShowMetrics title="Pace: " metrics={`${speed} км/ч`} />
    </>
  );
}
