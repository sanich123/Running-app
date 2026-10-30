import { Suspense } from 'react';
import { LazyMapsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function RoutesPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMapsPage mode="routes" />
    </Suspense>
  );
}
