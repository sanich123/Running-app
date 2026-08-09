import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyMediaGrid = lazy(() => import('@Routes/media-grid/media-grid'));

export default function HomeMediaGrid() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMediaGrid />
    </Suspense>
  );
}
