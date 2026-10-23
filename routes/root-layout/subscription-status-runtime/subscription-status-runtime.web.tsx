import { lazy, Suspense } from 'react';
import { useAppSelector } from '@R/typed-hooks';

const LazySubscriptionStatusSync = lazy(
  () => import('@Routes/subscription/subscription-status-sync/subscription-status-sync'),
);

export default function SubscriptionStatusRuntime() {
  const { userId } = useAppSelector(({ auth }) => auth);

  if (!userId) return null;

  return (
    <Suspense fallback={null}>
      <LazySubscriptionStatusSync />
    </Suspense>
  );
}
