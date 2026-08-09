import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyActivityFullViewPage = lazy(() => import('@Routes/card-full-view/card-full-view'));

export default function HomeActivityFullViewPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivityFullViewPage />
    </Suspense>
  );
}
