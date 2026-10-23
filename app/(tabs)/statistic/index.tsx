import { Suspense } from 'react';
import { LazyDashboard } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function DashboardScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyDashboard />
    </Suspense>
  );
}
