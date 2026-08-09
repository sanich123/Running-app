import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyMonthStatistics = lazy(() => import('@Routes/statistic/month-statistics/month-statistics'));

export default function MonthStatisticsPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMonthStatistics />
    </Suspense>
  );
}
