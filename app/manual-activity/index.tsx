import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazySaveResult = lazy(() => import('@Routes/save-activity-page/save-activity-page'));

export default function ManualActivity() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazySaveResult />
    </Suspense>
  );
}
