import { Suspense } from 'react';
import { LazyOfflineMapPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function OfflineMapRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyOfflineMapPage />
    </Suspense>
  );
}
