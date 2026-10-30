import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyGroupEventsPage = lazy(() => import('@Routes/groups/group-events-page/group-events-page'));

export default function GroupEventsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyGroupEventsPage />
    </Suspense>
  );
}
