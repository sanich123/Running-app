import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyActivitiesList = lazy(() => import('@Routes/activities-list/activities-list'));

export default function ActivitiesListScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivitiesList />
    </Suspense>
  );
}
