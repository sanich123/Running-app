import { Suspense } from 'react';
import { LazyBlockedUsersPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function BlockedUsersRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyBlockedUsersPage />
    </Suspense>
  );
}
