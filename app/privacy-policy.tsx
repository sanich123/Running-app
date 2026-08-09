import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyPrivacyPolicy = lazy(() => import('@Routes/privacy-policy/privacy-policy'));

export default function PrivacyPolicyScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyPrivacyPolicy />
    </Suspense>
  );
}
