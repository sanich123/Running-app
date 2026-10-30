import { Suspense } from 'react';
import { LazyCreateGroupPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function CreateGroupRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyCreateGroupPage />
    </Suspense>
  );
}
