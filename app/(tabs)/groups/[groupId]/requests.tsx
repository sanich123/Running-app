import { Suspense } from 'react';
import { LazyGroupRequestsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function GroupRequestsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyGroupRequestsPage />
    </Suspense>
  );
}
