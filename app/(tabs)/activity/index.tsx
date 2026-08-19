import { Suspense } from 'react';
import { LazyActivity } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ActivityPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivity />
    </Suspense>
  );
}
