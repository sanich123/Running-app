import { Suspense } from 'react';
import { LazyAddTrackPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function AddTrackRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyAddTrackPage />
    </Suspense>
  );
}
