import { Suspense } from 'react';
import { LazyEditGroupPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function EditGroupRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyEditGroupPage />
    </Suspense>
  );
}
