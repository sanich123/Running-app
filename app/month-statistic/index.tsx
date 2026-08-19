import { Suspense } from 'react';
import { LazyMonthStatistics } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function MonthStatisticsPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMonthStatistics />
    </Suspense>
  );
}
