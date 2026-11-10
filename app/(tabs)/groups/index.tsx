import { Suspense } from 'react';
import { LazyGroupsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function GroupsTab() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyGroupsPage />
    </Suspense>
  );
}
