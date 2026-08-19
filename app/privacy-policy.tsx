import { Suspense } from 'react';
import { LazyPrivacyPolicy } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function PrivacyPolicyScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyPrivacyPolicy />
    </Suspense>
  );
}
