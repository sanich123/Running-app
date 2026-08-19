import { Suspense } from 'react';
import { LazyMaintenance } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function MaintenanceScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMaintenance />
    </Suspense>
  );
}
