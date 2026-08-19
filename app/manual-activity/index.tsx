import { Suspense } from 'react';
import { LazySaveResult } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ManualActivity() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazySaveResult />
    </Suspense>
  );
}
