import { Suspense } from 'react';
import { LazyCreateOfflineMapPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function CreateOfflineMapRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyCreateOfflineMapPage />
    </Suspense>
  );
}
