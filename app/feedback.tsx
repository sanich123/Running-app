import { Suspense } from 'react';
import { LazyFeedbackPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function FeedbackRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyFeedbackPage />
    </Suspense>
  );
}
