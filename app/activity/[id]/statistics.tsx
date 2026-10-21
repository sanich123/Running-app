import { Suspense } from 'react';
import { LazyActivityStatisticsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ActivityStatisticsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyActivityStatisticsPage />
    </Suspense>
  );
}
