import { useEffect, useState } from 'react';
import { useAppSelector } from '@R/typed-hooks';
import { hasPremiumSubscription } from './has-premium-subscription';

const MAX_TIMEOUT = 2_147_000_000;

export default function useHasPremiumSubscription(): boolean {
  const subscription = useAppSelector(({ subscription: value }) => value);
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const transitions = [subscription.startsAt, subscription.expiresAt]
      .filter((value): value is string => value !== null)
      .map(Date.parse)
      .filter((timestamp) => Number.isFinite(timestamp) && timestamp > now);
    if (!transitions.length) return undefined;

    const nextTransition = Math.min(...transitions);
    const timeout = setTimeout(() => setNow(Date.now()), Math.min(nextTransition - now + 1, MAX_TIMEOUT));
    return () => clearTimeout(timeout);
  }, [now, subscription.expiresAt, subscription.startsAt]);

  return hasPremiumSubscription(subscription, currentUserId, now);
}
