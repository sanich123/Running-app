import { STATUSES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import ActiveMotionStatus from '../active-motion-status/active-motion-status';

export default function ActivityMotionStatus() {
  const { activityStatus } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ settings }) => settings);
  const isTracking = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;

  return isTracking ? <ActiveMotionStatus language={language} /> : null;
}
