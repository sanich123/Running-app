import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyListOfFollowing = lazy(() => import('@Routes/followings-page/followings-page'));

export default function HomeFollowing() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyListOfFollowing />
    </Suspense>
  );
}
