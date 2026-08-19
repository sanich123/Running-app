import { Suspense } from 'react';
import { LazyActivityFullViewPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ActivityRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivityFullViewPage />
    </Suspense>
  );
}
