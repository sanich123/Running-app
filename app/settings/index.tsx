import { Suspense } from 'react';
import { LazySettingsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function SettingsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazySettingsPage />
    </Suspense>
  );
}
