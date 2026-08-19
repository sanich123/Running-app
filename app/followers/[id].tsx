import { Suspense } from 'react';
import { LazyListOfFollowers } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function FollowersRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyListOfFollowers />
    </Suspense>
  );
}
