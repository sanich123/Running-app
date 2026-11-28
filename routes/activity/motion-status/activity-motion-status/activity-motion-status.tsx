import { STATUSES } from '@const/enums';
import { useAppShallowSelector, useAppSelector } from '@R/typed-hooks';
import ActiveMotionStatus from '../active-motion-status/active-motion-status';

export default function ActivityMotionStatus() {
  const { activityStatus } = useAppShallowSelector(({ location }) => ({ activityStatus: location.activityStatus }));
  const { language } = useAppSelector(({ settings }) => settings);
  const isTracking = activityStatus === STATUSES.started || activityStatus === STATUSES.continued;

  return isTracking ? <ActiveMotionStatus language={language} /> : null;
}
