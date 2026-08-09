import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyProfilePage = lazy(() => import('@Routes/profile/profile'));

export default function HomeProfilePage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyProfilePage />
    </Suspense>
  );
}
