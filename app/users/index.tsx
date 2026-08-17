import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyListOfUsers = lazy(() => import('@Routes/users-page/users-page'));

export default function UsersRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyListOfUsers />
    </Suspense>
  );
}
