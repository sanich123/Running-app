import { Suspense } from 'react';
import { LazyListOfFollowing } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function FollowingRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyListOfFollowing />
    </Suspense>
  );
}
