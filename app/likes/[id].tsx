import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyLikesList = lazy(() => import('@Routes/likes-list/likes-list'));

export default function LikesRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLikesList />
    </Suspense>
  );
}
