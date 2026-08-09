import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyMaintenance = lazy(() => import('@Routes/maintenance/maintenance'));

export default function MaintenanceScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMaintenance />
    </Suspense>
  );
}
