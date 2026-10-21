import { Suspense } from 'react';
import { LazyModerationDashboard } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ModerationRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyModerationDashboard />
    </Suspense>
  );
}
