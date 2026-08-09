import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyMapPage = lazy(() => import('@Routes/map-page/map-page'));

export default function HomeActivityMap() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMapPage />
    </Suspense>
  );
}
