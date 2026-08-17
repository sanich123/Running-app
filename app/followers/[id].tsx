import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyListOfFollowers = lazy(() => import('@Routes/followers-page/followers-page'));

export default function FollowersRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyListOfFollowers />
    </Suspense>
  );
}
