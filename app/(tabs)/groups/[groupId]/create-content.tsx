import { Suspense } from 'react';
import { LazyCreateGroupContentPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function CreateGroupContentRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyCreateGroupContentPage />
    </Suspense>
  );
}
