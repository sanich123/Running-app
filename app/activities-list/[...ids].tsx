import { Suspense } from 'react';
import { LazyActivitiesList } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ActivitiesListRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivitiesList />
    </Suspense>
  );
}
