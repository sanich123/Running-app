import { Suspense } from 'react';
import { LazyGroupDetailPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function GroupDetailRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyGroupDetailPage />
    </Suspense>
  );
}
