import { Suspense } from 'react';
import { LazyAdminDashboard } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function AdminRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyAdminDashboard />
    </Suspense>
  );
}
