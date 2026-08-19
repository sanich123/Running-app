import { Suspense } from 'react';
import { LazyMapPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ActivityMapRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMapPage />
    </Suspense>
  );
}
