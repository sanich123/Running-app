import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazySettingsPage = lazy(() => import('@Routes/settings-page/settings-page'));

export default function HomeSettingsPage() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazySettingsPage />
    </Suspense>
  );
}
