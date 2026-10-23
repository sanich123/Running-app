import { Suspense } from 'react';
import { LazyUpdateAppPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function UpdateAppRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyUpdateAppPage />
    </Suspense>
  );
}
