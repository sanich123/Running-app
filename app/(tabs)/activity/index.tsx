import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyActivity = lazy(() => import('@Routes/activity/activity'));

export default function ActivityPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivity />
    </Suspense>
  );
}
