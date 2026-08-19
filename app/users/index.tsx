import { Suspense } from 'react';
import { LazyListOfUsers } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function UsersRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyListOfUsers />
    </Suspense>
  );
}
