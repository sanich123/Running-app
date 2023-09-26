import ShowMetrics from '@c/show-metrics/show-metrics';
import { formatDuration } from '@u/time-formatter';

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
