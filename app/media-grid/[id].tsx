import { Suspense } from 'react';
import { LazyMediaGrid } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function MediaGridRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMediaGrid />
    </Suspense>
  );
}
