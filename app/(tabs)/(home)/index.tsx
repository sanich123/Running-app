import { Suspense } from 'react';
import { LazyHomePageContent } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function HomePage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyHomePageContent />
    </Suspense>
  );
}
